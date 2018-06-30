// 需要转译的
// , . * ? $ ^ | \/ ( ) { } [] ;

// [`~!@#$^&*()=|{};:'".,[\]./?~@#&*{}]

// \s空 \S !空 
// \n 换行 \r 回车 \0 空字符 \t 缩进
// \w = [a-zA-Z0-9_]
// \d = [0-9]

// \b 单词边界 \B非单词边界 
// \t 缩进符
// (\r|\n) 换行符
 
// {n,}最少n次
// 禁止贪婪模式 必须有量词 ,例如 .*? .{3,6}?  --- 量词后面加?
// 反向引用    必须有分组 ,例如 2016-11-22  str.replace(/(\d*)-(\d*)-(\d*)/,"$2/$3/$1")
// 忽略选组    必须有组  , (?:\d{3})
// 前瞻断言   'a2*3'.replace(/\w(?=\d)/,'X') --- X2*3  'a2*3'.replace(/\w(?!\d)/,'X') --- aX*3 ;


Array.prototype.has  = function(str){
	return this.indexOf(str)>-1 ? true : false ;
}
String.prototype.has = function(str){
	return this.indexOf(str)>-1 ? true : false ;
}


var t = {};
// 跑起来
	t.run = function( template ){

		var tpl = t.filter_tpl( template );

		var tag_arr = t.make_tag_arr(tpl);

		var vnode_tree = t.make_vnode_tree(tag_arr);

		return vnode_tree ;
	}



    t.encode_bind = function(s){
        if(s.length == 0) return "";
        s = s.replace(/</g,"&lt;");
        s = s.replace(/>/g,"&gt;");
        return s.trim(); 
    }
    t.decode_bind = function(s){
        if(s.length == 0) return "";
        s = s.replace(/&lt;/g,"<");
        s = s.replace(/&gt;/g,">");
        return s; 
    }

	// 过滤模板 ;
	t.filter_tpl = function(tpl){
		// (0) 去换行 ; 		
			tpl = tpl.replace(/\r/g,' ') ;
			tpl = tpl.replace(/\n/g,' ') ;
			tpl = tpl.replace(/\s{1,}/g,' ');

		// (1) 编码 {{...}} 内部支持<>" , ="..." 内支持<> ;
			tpl = tpl.replace(/\{\{(.*?)\}\}/g,function(E,a){ return '{{'+t.encode_bind(a).replace(/"/g,'\'')+'}}'});
			tpl = tpl.replace(/="(.*?)"/g,function(E,a){ return '="'+t.encode_bind(a)+'"'});

		// (2) 替换: @ 符号 ;
			tpl = tpl.replace(/<.*?>/g,function(E){
				if( E[1]=='/' ){
					return E ;
				}else{
					E=E.replace(/\s{1,}/g,' ');
					E=E.replace(/\s+:([\w\.-]+)=/g,function(E,a){ return ' v-bind:'+a+'='});
					E=E.replace(/\s+@([\w\.-]+)=/g,function(E,a){ return ' v-on:'+a+'='});
					// v-on:click="cliclFun" 替换成 v-on:click="cliclFun()"
					E=E.replace(/(v-on:[\w\.-]+=\"(.*?))\"/g,function(E,a,b){ 
						var str = b.has('(')?str=E:str=(a+'()\"') ;
						return str.replace(/\s*/g,'');
					});
					// v-on:click="cliclFun()" 替换成 v-on:click="cliclFun(e)"
					E=E.replace(/(v-on:[\w\.-]+=)\"(.*?)\"/g,function(E,a,b){ 
						var match = b.match(/(.*)\((.*)\)/);
						var k = match[1];
						var v = match[2];
							v ? v+=',evt' : v+='evt';
						return a+'\"'+k+'('+v+')'+'\"';
					});
					return E ;
				}
			})

		// (3) 去注释
			tpl = tpl.replace(/<\!\-\-(.*?)\-\->/g,'');

		// (4) 把单标签变双标签
			tpl = tpl.replace(/([^<])\/>/g,function(E,a){ return a+'></over>' });

		// (5) 替换 {{key}} 
			tpl = tpl.replace(/\{\{(.*?)\}\}/g,function(E,a){
				return '<font class="v-double" v-bind:V_DOUBLE="'+a+'"></font>';
			}) ;
		// (6) 替换 标签内文字 >123< 
			tpl = tpl.replace(/>\s{1,}</g,'><');
			tpl = tpl.replace(/>([^<>]+?)</g,function(E,a){
				var s = a.replace(/\s{1,}/g,' ');
				return '><font class="domtext" domtext="'+s.trim()+'"></font><';
			});

		return tpl ;
	}

	// 生成标签数组(分类v-fortemplate)
	t.make_tag_arr = function(tpl){
		var tag_arr = [] ;
		// 所有标签 ;
		var tags = tpl.match(/<.*?>/g) ; 
		if( tags.length==0 ){console.error('template内 没有标签');return};

		// ********************************** 查找v-for模块 ***************************************** ;
		var inVF = false ; // 是否在解析vfor ;
		var vlen_arr  = []  ; // 如果在解析vfor--> 记录层级数组
		var vpush_arr = []  ; // 如果在解析vfor--> 真正放元素的容器 ;


		// 层级计数器
		var dir = true ;
		var len = 0;
		for(var i=0 ; i<tags.length ; i++){
			// 层级下标
			var each = tags[i];
			if( each[1]!='/' ){
				// 开始标签 ;
				dir==false ? null : len++ ;
				dir=true ;
			}else{
				// 结束标签 ;
				dir==true  ? null : len-- ;
				dir=false;
			};

			// 第一个含有v-for的标签 表示进入一个v-for作用域 , 开始计数器 !!! ;
			if( each.has('v-for')&&inVF==false ){
				inVF=true;
				// vpush_arr 添加默认值
				vpush_arr = [{tag:'$ROOT',vfor_tag_arr:[]}]
			};
			
			// vfor模板内
			if( inVF==true ){
				// 开始标签
				if( each[1]!='/' ){
					if( each.has('v-for') ){
						// 记录位置
						vlen_arr.push(len);
						// 节点
						var obj = {
							tag:'<article class="vfor_begin">',
							vfor_tag_arr:[]
						};
						// 父亲的 vfor_tag_arr 加入当前节点为开始标签
						vpush_arr[vpush_arr.length-1]['vfor_tag_arr'].push(obj);
						// vpush 加入节点 , push方向向下 ;
						vpush_arr.push(obj);
					}
					// push开始标签
					vpush_arr[vpush_arr.length-1]['vfor_tag_arr'].push(each)
				}
				// 结束标签 ;
				else{
					// push结束标签
					vpush_arr[vpush_arr.length-1]['vfor_tag_arr'].push(each)
					// 删除节点
					if( len==vlen_arr[vlen_arr.length-1] ){
						// 移除位置
						vlen_arr.pop();
						// vpush 移除节点 , push方向向上 ;
			  			vpush_arr.pop();

			  			// 父级节点加入结束标签
			  			vpush_arr[vpush_arr.length-1]['vfor_tag_arr'].push('</article vfor_end>')

						// 最后退出节点时
						if(vlen_arr.length==0){
							// 还原默认设置
							var pop = vpush_arr.pop();
							tag_arr = tag_arr.concat(pop['vfor_tag_arr'])
							inVF = false ;
						}
					}
				};
			}else{
				tag_arr.push(each)
			}
		}

		return tag_arr ;
	}

	// 生成标签树
	t.make_vnode_tree = function (tag_arr) {

		var push_arr = [{tag:'$ROOT',children:[]}];

		for(var i=0 ; i<tag_arr.length ; i++){
			var each = tag_arr[i];
			// 开始标签
			if( each[1]!='/' ){
				var vnode = null ;

				// v-for递归此函数 ;
				if( each.tag && each.tag.has('vfor_begin') ){
					vnode = t.make_vnode(each.tag);
					vnode['vfor_vnode_tree'] = t.make_vnode_tree( each.vfor_tag_arr );

					var match = vnode['vfor_vnode_tree'].tag.match(/v-for="\s*\(\s*([\w-]+)\s*,\s*([\w-]+)\s*\)\s+in\s+([\w-\.\[\]']+)\s*"/) ;

					vnode['vfor_item']  = match[1] ;
					vnode['vfor_key']   = match[2] ;
					vnode['vfor_array'] = match[3] ;
				}else{
					vnode = t.make_vnode(each);
					vnode['children']=[];
				};

				push_arr[push_arr.length-1]['children'].push(vnode);
				push_arr.push(vnode);
			}else{
			// 结束标签
				push_arr.pop();
			}	
		}

		return push_arr[0].children[0];
	}

	// 制作一个虚拟dom ;
	t.make_vnode = function( tag  ){
		//解码 {{...}} 内部支持<>" , ="..." 内支持<> ;
		var tag = t.decode_bind( tag ) ;

		var tagName = tag.match(/<([\w-\$]+).*>/)[1] ;

	  	var vnode = {
	  		$el:'',
			tag:tag,
		  	tagName: tagName.trim() ,
			DOM:'',
			domprops:{
				domtext:'',
				classList:'',cssText:'',attr:[]
			},
			vbind:{
				double:{},
				class:{}, style:{},attr:[], 
			},
			von:{},
			vif:{},
			vshow:{},
		};

		// 便利所有的属性 ;
		var attributs = tag.match(/[^\s]+="(.*?)"+/g)||[] ; //log(attributs)
			attributs.map(function( each ){
				// 处理事件
				if( each.has('v-on:') ){
					// push 
					var on = vnode['von'];

					var match = each.match(/v-on:(.*)=["](.*)["]/);
				    var key   = match[1];
				    var value = match[2].trim();

					var eName   = key ;
					var vMethod = value.split('(')[0];
					on[eName] = {
						vMethod : vMethod,
						eval_key: value
					}
				};

				// 处理v-if , v-show
				if( each.has('v-if=') ){
					var match = each.match(/v-if=["](.*)["]/);
				    var value = match[1].trim();
				    vnode['vif']={
				    	eval_key:value ,
				    	value:''
				    };
				}
				if( each.has('v-show=') ){
					var match = each.match(/v-show=["](.*)["]/);
				    var value = match[1].trim();
				    vnode['vshow']={
				    	eval_key:value ,
				    	value:''
				    };
				}

				// 处理绑定属性
				if( each.has('v-bind:') ){
					// push
					var vbd = vnode['vbind'];

					var match = each.match(/v-bind:(.*)=["](.*)["]/);
				    var key   = match[1];
				    var value = match[2].trim();
					if( key=='V_DOUBLE' ){
						var obj = {
							eval_key: value ,
							value:''
						}
						vbd.double = obj ;
					}else if( key=='class' ){
						var obj = {
							eval_key: value ,
							value:''
						}
						vbd.class = obj ;
					}else if( key=='style' ){
						var obj = {
							eval_key: value ,
							value:''
						}
						vbd.style = obj ;
					}else{
						var obj = {
							dom_key : key , 
							eval_key: value,
							value:''
						}
						vbd.attr.push(obj)
					}
				}
				// 静态属性
				else{
					// push
					var ops = vnode['domprops'];

					var match = each.match(/(.*)=["](.*)["]/);
				    var key   = match[1];
				    var value = match[2].trim();
				    if( key=='domtext' ){
				    	ops.domtext = value ;
				    }else if( key=='class' ){
				    	ops.classList = value ;
				    }else if( key=="style" ){
				    	ops.cssText = value ;
				    }else{
				    	ops.attr.push({
				    		dom_key: key ,
				    		value:   value
				    	});
				    }
				}
			});

		return vnode ;
	}


module.exports = t ;

