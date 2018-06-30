// section ---> 路由
// figure  ---> 组件
// article ---> v-for外层





import $ from './com.tool.js';

Array.prototype.has  = function(str){
	return this.indexOf(str)>-1 ? true : false ;
}
String.prototype.has = function(str){
	return this.indexOf(str)>-1 ? true : false ;
}

// 用于v-show的class ;
try{
	var style = document.createElement('style');
		style.innerHTML = '* .com_displayNone{ display:none!important }';
	document.head.appendChild( style );
}catch(e){}

// component ;
var c  = function( 
		opt ,   //配置项
		$data , //配置项克隆data()返回值 
		$tree , //解析配置项模板生成的组件树
		$props  //收到的props
	){

		var this_ = this ;

		// 配置 ;
		this.$opt = opt ;

		// 访问diff 直接调用$update() ;
		Object.defineProperty( this_ , '$diff' , {
			get:function(){
				this.$update();
			}
		})

		// props 绑定props ;
		this.$props = $props || {};

		// $props 映射this ;
		for(var pName in $props){
			(function(each){
				Object.defineProperty( this_ , each , {
					get:function(){
						return $props[each]
					},
					set:function(val){
						$props[each]=val ;
					}
				})
			}(pName));
		}

		// data 绑定this
		this.$data = $data || {};

		// $data 映射this
		for(var dName in $data){
			(function(each){
				Object.defineProperty( this_ , each , {
					get:function(){
						return $data[each]
					},
					set:function(val){
						$data[each]=val ;
					}
				})
			}(dName));
		}

		// 收集DOM eventListener绑定事件 组件移除时统一删除 ;
		this.domRemoveListener = [];

	 	// 生命周期 ;
	 	this.created = opt.created || function(){};
	 	this.mounted = opt.mounted || function(){};
	 	this.updated = opt.updated || function(){};
	 	this.destroyed = opt.destroyed || function(){};

	 	// 装refs树的盒子
	 	this.$refsTreeObj = {} ;

	 	// 组件 绑定this;
	 	this.$components = opt.components || {};
	 	// 全局组件添加到$components ;
	 	for(var $g in Com.globalComponents ){
	 		this.$components[$g] = Com.globalComponents[$g];
	 	}

	 	// 事件 绑定this ;
	 	this.$methods = opt.methods||{} ;

	 	// 事件 映射this .
	 	var methods = this.$methods ;
 		for(var mName in methods){
 			(function(each){
 				Object.defineProperty( this_ , each , {
 					get:function(){
 						return methods[each]
 					}
 				})
 			}(mName))
 		};



		// *** 路由判断 *** 在此判断是否是跟路由 , 是的话初始化 ;
		var isRR = this.$opt.routes ;
			isRR ? c.prototype.$router = new Com.router( this ) : null ;


		// *** 路由判断 *** 判断是否是路由元素 , 是的话创建时候变成组件 ;
		var $_R = this.$router ;
		var $_route = this.$opt.$route ;

		// 当前路由活动节点和自己相等 , 节点向下 , 添加儿子 ;
		if( $_R&&$_route ){
			if( $_R['PUSH_INFO'].activeRoute==$_route ){

				// 赋值component ;
				$_R['PUSH_INFO'].activeRoute.component = this ;

				// router的query改变触发 ;
				this.routeQueryChange = this.$opt.routeQueryChange || function(){} ;
				this.routeChange = this.$opt.routeChange || function(){} ;
				// 注册金router
				$_R['queryChangeObj'][$_route.key] = this.routeQueryChange.bind(this) ;
				$_R['routeChangeObj'][$_route.key] = this.routeChange.bind(this) ;

				// 调用函数 ;	
				this.$_route_append_callback = function(){

					// 防止地址改变 , v-if等干扰
					$_R.component_setPushInfo( $_route.key );

					var $_PUSH_INFO = $_R['PUSH_INFO'] ;

					var key = $_PUSH_INFO.pushKeyArr[0] ;
					var new_activeRoute = $_R['allKeyObj'][ key ] ;
					if( new_activeRoute ){
						// 存在组件 节点next ;
						$_PUSH_INFO.pushKeyArr.shift() ;
						$_PUSH_INFO.activeRoute = new_activeRoute ;
						// 返回下一节点信息
						return new_activeRoute.option ;
					}else{
						return false ;
					}
				}
			}

		};
		

		// dom树 绑定this
		$tree.isRoot = true ;

		this.created();
		this.$tree = this.$readTree( $tree , {} ); // 默认作用域 = {} 
	};

	c.prototype = {
		// 挂载
		$mount:function( x ){
			var $tree = this.$tree ;

				$tree.$el = ($.type(x)=='string' ? $.q(x) : x );

				$tree.DOM ? $tree.$el.appendChild( $tree.DOM ) : null ;

			// 激活refs
			this.$hookRefs();

			// mounted 生命周期
			this.mounted();

			return this ;
		},
		// 激活refs
		$hookRefs(){
			var this_ = this ;
			var $refsTreeObj = this.$refsTreeObj ;
			Object.defineProperty( this , '$refs' , {
				get:function(){
					var $refs = {} ;
					for(var $key in $refsTreeObj){
						var $T = $refsTreeObj[$key] ;
						// 是组件节点
						if( $T.$mount_component ){
							$refs[$key] = $T.$mount_component ;
						}else{
						// 正常节点
							$refs[$key] = $T.DOM ;
						}
					};
					return $refs ;
				}
			})
		},

		// 生成作用域字符串;
		$evalScope( $S ){
			var str = '' ;
			for(var $key in $S){
				str += ('var '+$key+'='+$S[$key]+' ; ') ;
			}
			return str ;
		},

		// 处理vfor作用域 , 克隆儿子 ;
		$vforScopeMakeChildren( $T , $S , $_beginIndex ){
			var this_ = this ;

			// 声明作用域
			var $evalScope = this.$evalScope( $S ); 
				$evalScope ? eval($evalScope) : null ;

			// 返回值
			var $_makeChildren = [] ;

			var $_item  = $T.vfor_item ;
			var $_key   = $T.vfor_key  ;
			var $_array = $T.vfor_array ;

			// 循环的数据
			var $_list = eval($_array); 

			if( $.type( $_list )=='array' ){
				for(var $_i=$_beginIndex ; $_i<$_list.length ; $_i++){
					// 克隆作用域
					var new_scope = $.clone( $S );
					// 循环数组 可以在this上去 , 可以从作用域取 
					if($_array.has('this.')){
						// 从this中取
						new_scope[ $_item ] = $_array+'['+$_i+']' ;
						new_scope[ $_key  ] = $_i ;
					}else{
						// 从作用域中取 , 正则替换头部
						$_array = $T.vfor_array = $_array.replace(/(\w+)(.*)/,function(E,a,b){
							return $S[a]+b ;
						})
						new_scope[ $_item ] = $_array+'['+$_i+']' ;
						new_scope[ $_key  ] = $_i ;
					};
					
					// 克隆镜像元素 放到children中 ;
					var new_vfor_vnode_tree = $.clone( $T.vfor_vnode_tree );
					var new_child = this.$readTree( new_vfor_vnode_tree , new_scope );

					$_makeChildren.push(new_child);
				}
			}else{
				alert('v-for只能便利数组');
			};

			return $_makeChildren ;
		},

		// 解析树
		$readTree:function( $T , $S ){

			var this_ = this ;

			// 声明作用域
			var $evalScope = this.$evalScope( $S );
				$evalScope ? eval($evalScope) : null ;

			// 作用域绑定到树
			$T.scope = $S ;

			// v-if 优先级最高 ;
			var $_if = $T['vif'];
			if( $.notEmpty($_if) ){
				$_if['value'] = eval( $_if['eval_key'] );
				// 如果初次渲染v-if为false 阻止下文 ;
				if( !$_if['value'] ){
					return $T ;
				}
			}

			// 用于判断组件 , 路由
			var $_ROUTE_COMP = false;
			var $_CHILD_COMP = false;
			// 儿子option , props ;
			var $_COMPT_OPTION = null ;
			var $_COMPT_PROPS  = {} ;
			// 是路由组件
			if( $T.tagName=='router-view' ){
				$_ROUTE_COMP = true ;

				$_COMPT_OPTION = this.$_route_append_callback() ;
			}else if( this.$components[$T.tagName] ){
				$_CHILD_COMP = true ;

				$_COMPT_OPTION = this.$components[$T.tagName] ;
			}


			// 创建dom ;
			var $_dom ;
			// 判断是否是组件 ;
			if($_ROUTE_COMP){
				$_dom = $T.DOM = document.createElement( 'section' ); 
				$T['domprops'].classList += ' vrouter_wrap';
			}else if($_CHILD_COMP){
				$_dom = $T.DOM = document.createElement( 'figure' ); 
				$T['domprops'].classList += ' vcomponent_wrap';
			}else{
				$_dom = $T.DOM = document.createElement( $T.tagName );
			};


			/**** 递归 children  位置很重要 !!! ****/ 
			if( $T.tag.has('vfor_begin') ){
				// 从0开始寻循环 , 制作儿子 ;
				var $_makeChildren = this.$vforScopeMakeChildren( $T , $S , 0); 
				$T.children = $_makeChildren;

				// *** 添加节点
				$T.children.map(function(each){
					// 添加$el属性 ;
					each.$el = $_dom ;
					// 添加$parentTree属性
					each.$parentTree = $T ;

					// 解析作用域->vforScopeMakeChildren 已经递归了readTree 不需要递归自身了 ;

					// 追加dom节点 ;
					each.DOM ? $_dom.appendChild( each.DOM ) : null ;
				})
			}else{
				// *** 递归自身
				$T.children.map(function(each){
					// 添加$el属性 ;
					each.$el = $_dom ;
					// 添加$parentTree属性
					each.$parentTree = $T ;

					// 递归自身
					each = this_.$readTree( each , $S );

					// 追加dom节点 ;
					each.DOM ? $_dom.appendChild( each.DOM ) : null ;
				})
			}


			// on事件
			var $_on = $T['von'];
			// 绑定函数 争取的指向this
			var eval_on_function = function( str , evt ){ 
				// 声明作用域
				var $evalScope = this.$evalScope( $S );
					$evalScope ? eval($evalScope) : null ;
				eval(str) 
			};
			if( $.notEmpty( $_on ) ){
				for(var $_k in $_on){
					(function(method){
						// 声明函数
						var FUNC = function(evt){
							// ***** 问题 **** 事件结果是实时取的 和 $update不同步 ;
							eval_on_function.call( this_ , $_on[method]['eval_key'], evt);
						}
						// 绑定函数
						$_dom.addEventListener(method,FUNC,false);

						// 记录函数
						var removeFUNC = function(){
							$_dom.removeEventListener(method,FUNC,false);
							FUNC=null;
							eval_on_function=null;
							removeFUNC=null;
						}
						this_.domRemoveListener.push(removeFUNC); 

					}($_k))
				}
			};

			// 正常属性
			var $_pos = $T['domprops'];
			$.notEmpty( $_pos['domtext'] )   ? $_dom.innerHTML     = $_pos['domtext'] : null ;
			$.notEmpty( $_pos['classList'] ) ? $_dom.className     = $_pos['classList'] : null ;
			$.notEmpty( $_pos['cssText'] )   ? $_dom.style.cssText = $_pos['cssText'] : null ;
			$.notEmpty( $_pos['attr'] )      ? $_pos['attr'].map(function(each){ 
													// 记录ref位置 ;
													each['dom_key']=='ref' ? this_.$refsTreeObj[ each['value'] ]=$T : null ;

													$.setAttr($_dom , each['dom_key'] , each['value']);
												}) : null ;


			// 特殊属性
			var $_vbd = $T['vbind'];
			var $$_double = $_vbd['double'];
			var $$_class  = $_vbd['class'];
			var $$_style  = $_vbd['style'];
			var $$_attr   = $_vbd['attr'];

			if( $.notEmpty( $$_double ) ){
				$$_double['value'] = eval($$_double['eval_key'])
				typeof $$_double['value']=='object' ? $_dom.innerHTML=JSON.stringify($$_double['value']) : $_dom.innerHTML=$$_double['value'];
			}
			if( $.notEmpty( $$_class ) ){
				$$_class['value'] = eval('('+$$_class['eval_key']+')')

				$.setClass($_dom, $$_class['value'])
			}
			if( $.notEmpty( $$_style ) ){
				$$_style['value'] = eval('('+$$_style['eval_key']+')')

				$.setStyle($_dom, $$_style['value'])
			}
			if( $.notEmpty( $$_attr ) ){
				for(var $_i=0 ; $_i<$$_attr.length ; $_i++){

					$$_attr[$_i]['value']=eval( $$_attr[$_i]['eval_key'])

					// 记录ref位置 ;
					$$_attr[$_i]['dom_key']=='ref' ? this_.$refsTreeObj[ $$_attr[$_i]['value'] ]=$T : null ;

					// 判断是否是组件 
					if( $_ROUTE_COMP || $_CHILD_COMP ){
						// 是组件制作props
						$_COMPT_PROPS[ $$_attr[$_i]['dom_key'] ] = $$_attr[$_i]['value'] ;
					}else{
						// 不是组件 设置attr 
						$.setAttr( $_dom , $$_attr[$_i]['dom_key'] , $$_attr[$_i]['value'] )
					}
				};
			}

			// 路由组件地址变化重新计算儿子 ;
			if( $_ROUTE_COMP ){
				this.$replace_child_route = function(){
					// 移除旧儿子 ;
					$T.$mount_component ? $T.$mount_component.$destroy() : null ;
					// 重新计算新儿子 ;
					$_COMPT_OPTION = this_.$_route_append_callback( $T ) ;

					if( $_COMPT_OPTION ){
						// 组件存在 向$T 增加 $mount_component
						$T.$mount_component = new Com( $_COMPT_OPTION , $_COMPT_PROPS );
						// 组件增添parent属性 ;
						$T.$mount_component.$parent = this_ ;
						// 挂载到自身上 ;
						$T.$mount_component.$mount( $_dom );
					}
				}
			}


			// 添加组件 ;
			if( $_COMPT_OPTION ){
				// 组件存在 向$T 增加 $mount_component
				$T.$mount_component = new Com( $_COMPT_OPTION , $_COMPT_PROPS );
				// 组件增添parent属性 ;
				$T.$mount_component.$parent = this_ ;
				// 挂载到自身上 ;
				$T.$mount_component.$mount( $_dom );
			}


			// 最后判断v-show ;
			var $_show = $T['vshow'];
			if( $.notEmpty($_show) ){
				$_show['value'] = eval( $_show['eval_key'] );
				$_show['value'] ? $_dom.classList.remove('com_displayNone') : $_dom.classList.add('com_displayNone') ;
			}

			return $T ;
		},

		// 手动更新
		$update(){
			var $tree = this.$tree;

			this.$diffTree( $tree );

			// updated 生命周期
			this.updated();
		},

		// 更新树
		$diffTree:function( $T ){ 
			var this_ = this ;

			// 找到作用域 ;
			var $S = $T.scope ;

			// 声明作用域
			var $evalScope = this.$evalScope( $S );
				$evalScope ? eval($evalScope) : null ;

			// v-if 优先级最高 ;
			var $_if = $T['vif'];
			if( $.notEmpty($_if) ){
				$_new = eval( $_if['eval_key'] );
				$_old = $_if['value'];
				if( !!$_new != !!$_old ){
					$_if['value'] = $_new ;
					// v-if 为 true
					if($_if['value']){

						// 因为JS的引用赋值, $T 对应children[$_i] , 所以 $readTree 之后会自动替换$T
						this.$readTree($T , $S) ;

						// v-if 追加dom节点
						this.$vifautoAppendChild($T);

						// 结束下文 ;
						return ;
					}
					// v-if 为 false
					if(!$_if['value']){
						this.$removeTree( $T , true );
					}
				}
			}

			// 如果存在 说明上一次v-if为true , 再进行比对 ;
			var $_dom = $T.DOM ;
			if( $_dom ){

					// 处理vfor , 检查数组长度是否变化 , 变化了重新渲数组 对比 ;
					if( $T.tag.has('vfor_begin') ){

						var $_newList     = eval( $T.vfor_array );
						var $_oldChildren = $T.children;
						var $_cha = $_newList.length - $_oldChildren.length ;

						// 数组变长
						if( $_cha>0 ){
							var $_addChild = this_.$vforScopeMakeChildren( $T , $S ,$_oldChildren.length );
								$_addChild.map(function(v){
									// 添加$el属性 ;
									v.$el = $_dom ;
									// 添加$parentTree属性
									v.$parentTree = $T ;

									// 改变children长度
									$T.children.push( v );

									// 追加dom节点 ; 
									v.DOM ? $T.DOM.appendChild( v.DOM ) : null ;
								})
						}
						// 数组变短
						if( $_cha<0 ){
							var $_addChild=[];
								$_oldChildren.map(function(v,k){
									if( k>$_newList.length-1 ){
										// 移除多余长度数组
										this_.$removeTree(v,true)
									}else{
										// 赋值新children
										$_addChild.push(v)
									}
								})
							// 改变children长度
							$T.children = $_addChild ;
						}
					}


					/**** 递归 children  位置很重要 !!! ****/ 
					var $children = $T.children || [] ;
					for(var $_i=0 ; $_i<$children.length ; $_i++ ){
						(function(){

						}());

						var $child = $children[$_i];

						this.$diffTree( $child );
					};


					var $_vbd = $T['vbind'];
					var $$_double = $_vbd['double'];
					var $$_class  = $_vbd['class'];
					var $$_style  = $_vbd['style'];
					var $$_attr   = $_vbd['attr'];

					if( $.notEmpty( $$_double ) ){
						var $_new = eval($$_double['eval_key']);
						var $_old = $$_double['value'];

						if( $_new!==$_old ){

							$$_double['value']=$_new ;

							console.log('$_dom.innerHTML',$$_double['value']);
							typeof $$_double['value']=='object' ? $_dom.innerHTML=JSON.stringify($$_double['value']) : $_dom.innerHTML=$$_double['value'];
						}
					}
					if( $.notEmpty( $$_class ) ){
						var $_new = eval('('+$$_class['eval_key']+')');
						var $_old = $$_class['value'];

						$.diffClass( $_dom , $_new , $_old );

						$$_class['value'] = $_new ;
					}
					if( $.notEmpty( $$_style ) ){
						var $_new = eval('('+$$_style['eval_key']+')');
						var $_old = $$_style['value'];

						$.diffStyle( $_dom , $_new , $_old );

						$$_style['value'] = $_new ;
					}
					if( $.notEmpty( $$_attr ) ){

						// 可能存在组件
						var $mount_component = $T.$mount_component ;
						var $mount_component_needUpdate = false ;

						for(var $_i=0 ; $_i<$$_attr.length ; $_i++){
							var $_new = eval( $$_attr[$_i]['eval_key']);
							var $_old = $$_attr[$_i]['value'];

							if( $_new!==$_old ){

								$$_attr[$_i]['value']=$_new ;

								// 判断组件
								if( $mount_component ){
									// 存在组件 改变组件props ;
									$mount_component.$props[ $$_attr[$_i]['dom_key'] ] = $$_attr[$_i]['value'] ;
									$mount_component_needUpdate = true ;
								}else{
									// 不存在组件 直接赋值 ;
									console.log('$_dom.attr , '+$$_attr[$_i]['dom_key']+' , '+$$_attr[$_i]['value'])
									$.setAttr( $_dom , $$_attr[$_i]['dom_key'] , $$_attr[$_i]['value'] )
								}
							}
						};

						// 组件props有值改变&&全部改变完 组件$update() ;
						$mount_component_needUpdate ? $mount_component.$update() : null ;
					}

					// 最后判断v-show ;
					var $_show = $T['vshow'];
					if( $.notEmpty($_show) ){
						$_new = eval( $_show['eval_key'] );
						$_old = $_show['value'];
						if( !!$_new != !!$_old ){
							$_show['value'] = $_new ;
							$_show['value'] ? $_dom.classList.remove('com_displayNone') : $_dom.classList.add('com_displayNone') ;
						}
					}
			}

		},

		// v-if追加位置判断
		$vifautoAppendChild( $T ){
			if( !$T.$el ){
				alert('找不到挂载节点 , 组件根元素使用v-if 需要先调用 $mount(...) 方法挂载'); 
			}else{
				// 根元素直接追加到调用 $mount 方法后的 $el 上
				if( $T.isRoot ){
					$T.DOM ? $T.$el.appendChild($T.DOM) : null ;
				}else{
					// 非根元素便利同级元素
					var $realPrevArr =[];
					var $parentTree  = $T.$parentTree ;
					for(var k=0 ; k<$parentTree.children.length ; k++ ){
						var v=$parentTree.children[k];
				    	// 当同级元素v-if==true有值情况下
						if( v.DOM ){
							
							// 找到自身开始判断
							if(v.DOM==$T.DOM){
								// 数组最后一位为 , 上一个已经创建的节点 ;
								var $prev = $realPrevArr.pop();
								// 存在$prev , 自己不是第一位 , 查找上一个节点的下一个节点
								if( $prev ){
									var $nextElement = $prev.DOM.nextElementSibling ;
									// 存在上一个节点的下一节点 ;
									if( $nextElement ){
										$T.DOM ? $T.$el.insertBefore( $T.DOM , $nextElement ) : null ;
									}
									// 不存在上一个节点的下一节点 , 说明是最后一位 , 直接添加dom到$el上
									else{
										$T.DOM ? $T.$el.appendChild($T.DOM) : null ;
									}
								}
								// 不存在$prev , 自己是第一位 
								else{
									var $childNodes = $T.$el.children ;
									// 不存在子元素 , 直接添加
									if( $childNodes.length==0){
										$T.DOM ? $T.$el.appendChild($T.DOM) : null ;
									}
									// 存在子元素 , 添加到第一个子元素之上层
									else{
										var $firstChild = $childNodes[0];
										$T.DOM ? $T.$el.insertBefore( $T.DOM , $firstChild ) : null ;
									}
								}

								return ;
							}
							// 找不到自身 添加数组
							else{
								$realPrevArr.push(v);
							}
						};
					}

				}
			}
		},

		// 删除组件或者dom ;
		$removeTree( $T , neetDeleteDom ){
			var this_ = this ;

			// 清空DOM节点引用
			neetDeleteDom ? null : $T.DOM='';


			$T.children&&$T.children.map(function(child){
				// 子集递归自身 , 不删除 ;
				this_.$removeTree(child,false);
				// 清空子集$el引用 ;
				child.$el='';
			})


			// 存在组件 移除组件 ;
			if( $T.$mount_component ){
				$T.$mount_component.$destroy();
				$T.$mount_component = '' ;
			}

			// 是否同时移除DOM节点
			if( neetDeleteDom ){
				if( !$T.$el ){
					alert('找不到挂载节点 , 组件根元素使用v-if 需要先调用 $mount(...) 方法挂载'); 
				}else{
					$T.DOM ? $T.$el.removeChild($T.DOM) : null ;
					$T.DOM='';
				}
			}
		},

		$destroy(){
			// 取消dom 事件
			this.domRemoveListener.map(function(v){ v() });
			// 删除组件或者dom ;
			this.$removeTree( this.$tree , true );
			// 删除路由函数
			this.$_route_append_callback=null ;
			// 移除路由改变函数
			var $_R = this.$router ;
			var $_route = this.$opt.$route ;
				$_route&&$_R ? ($_R['queryChangeObj'][$_route.key]=null) : null ;
				$_route&&$_R ? ($_R['routeChangeObj'][$_route.key]=null) : null ;

			// destroyed 生命周期
			this.destroyed();
		}

	}

export default c ;


