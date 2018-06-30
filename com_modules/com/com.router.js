Array.prototype.has  = function(str){
	return this.indexOf(str)>-1 ? true : false ;
}
String.prototype.has = function(str){
	return this.indexOf(str)>-1 ? true : false ;
}


var r = function( ROOT_COMPONENT ){

	var $opt = ROOT_COMPONENT.$opt ;
	var routes     = $opt.routes||[] ;
	var defaultUrl = $opt.defaultUrl||'' ;

	// 当query改变时触发 ;
	this.queryChangeObj = {} ;
	// 当地址改变是触发
	this.routeChangeObj = {} ;

	// 添加唯一下标 ;
	this.allKeyObj = this.routesAddKey( ROOT_COMPONENT , routes ) ;

	// 默认路径
	this.defaultUrl = defaultUrl ;

	// 历史记录 ;
	this.history = [] ;

	// 设置默认路径 ;
	this.setDefault();

	// 第一次默认状pushInfo信息
	this.root_setPushInfo();

	// 监听变化
	this.listen();

	var this_ = this ;
	Object.defineProperty(this,'$active',{
		get:function(){
			return this_.getRouteInfo() ;
		}
	})
};


r.prototype={
	push(str){
		location.hash=str ;
	},
	// 添加节点下标
	routesAddKey:function( ROOT_COMPONENT , routes ){
		var this_ = this ;
		var allKeyObj = {} ;

		var render = function( tree , parentKey ){
			// 生成key ;
			tree.key = parentKey+'/'+tree.path ;
			// 子节点加入容器
			allKeyObj[ tree.key ] = tree ;
			// 组件做记录
			allKeyObj[ tree.key ].option.$route = tree ;

		   !tree.children ? tree.children=[] : null ;
			tree.children.map(function(each){
				// 递归
				render( each , tree.key );
			})
		}
		// 便利子节点 ;
		routes.map( function(each){
			render( each , '' )
		});

		// 构建根节点 ;
		var rootTree = {
			path : '/' ,
			key  : '/' ,
			option: ROOT_COMPONENT.$opt ,
			children : routes
		};

		// 根节点加入容器
		allKeyObj['/'] = rootTree ;
		// 组件做记录
		allKeyObj['/'].option.$route = rootTree ;

		return allKeyObj ;
	},

	// 访问 ''或/  , 重定向到默认路径 ;
	setDefault:function(){
		// 计算info ;
		var info = this.getRouteInfo();

		if( this.defaultUrl ){
			if( info.pathArr.length==0 || info.pathArr.length==1 ){
				location.hash=this.defaultUrl ;
			}
		}
	},

	// 第一次进入页面设置push信息 ;
	root_setPushInfo:function(){
		// 计算info ;
		var info = this.getRouteInfo();

		var pushKeyArr = [];
			info.keyArr.map(function(v,k){
				k>0 ? pushKeyArr.push(v) : null ;
			});


		this.PUSH_INFO = {
			activeRoute: this.allKeyObj['/'] ,
			pushKeyArr:  pushKeyArr
		}

		// 记录历史 ;
		this.history.push( info );
	},

	// 防止地址改变 , v-if等干扰 ;
	component_setPushInfo:function( startKey ){
		var info = this.getRouteInfo();
		var pushKeyArr = [];
		var allowPush = false ;
		info.keyArr.map(function(v){
			allowPush   ? pushKeyArr.push(v) : null ;
			v==startKey ? (allowPush=true)   : null ;
		});

		this.PUSH_INFO = {
			activeRoute: this.allKeyObj[startKey] ,
			pushKeyArr:  pushKeyArr
		}
	},


	// 开始监听变化
	listen:function(){
		var this_ = this ;

		window.onhashchange = function(){

			var oldInfo = this_.history[ this_.history.length-1 ] ;
			var newInfo = this_.getRouteInfo() ;

			// 当节点发生变化
			if( newInfo.pathString != oldInfo.pathString ){
				var new_pathArr = newInfo.pathArr ;
				var old_pathArr = oldInfo.pathArr ;

				// 找到相同节点path
				var same = [] ;
				var len = Math.min( new_pathArr.length ,old_pathArr.length );
				for(var i=0 ; i<len ; i++ ){
					if(new_pathArr[i]==old_pathArr[i]){
						same.push( new_pathArr[i] );
					}else{
						break ;
					}
				};

				// 需要删除的节点key ;
				// var deleteKey = '';
				// var delarr=[];
				// for(var i=0 ; i<old_pathArr.length ; i++){
				// 	delarr.push( old_pathArr[i] );
				// 	if( old_pathArr[i] != same[i] ){
				// 		deleteKey = ('/'+delarr.join('/')).replace(/\/{1,}/g,'/');
				// 		break ;
				// 	}
				// }


				// 需要添加的节点key ;
				var startKey = ('/'+same.join('/')).replace(/\/{1,}/g,'/');
				var allKeyObj = this_.allKeyObj ;
				// 替换儿子
				var parent = allKeyObj[startKey]&&allKeyObj[startKey].component ;
					parent ? parent.$replace_child_route&&parent.$replace_child_route() : null ;	

				// 调用组件函数
				for(var $k in this_['routeChangeObj']){
					this_['routeChangeObj'][$k] ? this_['routeChangeObj'][$k]( newInfo ) : null ;
				};

				// 记录
				this_.history.push( newInfo );
			}else{

				if( newInfo.queryString!=oldInfo.queryString ){

					var $obj = {};
					var $nq = newInfo.query ;
					var $oq = oldInfo.query ;

					var $n_keys = Object.keys( $nq );
					var $o_keys = Object.keys( $oq );
					var $same = [] ;
					$n_keys.map(function( key ){
						$o_keys.has(key) ? $same.push(key) : null ;
					})
					// 被删掉的
					$o_keys.map(function( key ){
						$same.has(key) ? null : $obj[key]=null ;
					})
					// 增加的
					$n_keys.map(function( key ){
						$same.has(key) ? null : $obj[key]=$nq[key] ;
					})
					// 改变的
					$same.map(function( key ){
						$nq[key]!=$oq[key] ? $obj[key]=$nq[key] : null ;
					})

					// 调用组件函数
					for(var $k in this_['queryChangeObj']){
						this_['queryChangeObj'][$k] ? this_['queryChangeObj'][$k]( $obj ) : null ;
					};

					// 记录
					this_.history.push( newInfo );
				};				
			}

		}

	},


	getRouteInfo:function(){
		var pathArr =null ;
		var pathString =null ;
		var h = location.hash ;
		if( !h ){
			pathArr = [] ;
		}else{
			if( h[1] != '/' ){
				pathArr = [] ;
			}else{
				pathString = h.match(/#([\/\w]*)/)[1];
				pathArr = pathString.split('/').filter(function(a){ return a&&1 });

				// 添加跟节点
				pathArr.unshift('/');
			}
		};

		var keyArr = [];
		var key='';
		pathArr.map(function(v){
			if(v=='/'){
				keyArr.push(v)
			}else{
				key+='/'+v;
				keyArr.push(key)
			}
		});

		var queryString = location.hash.match(/\?.*/) ? location.hash.match(/\?.*/)[0] : '' ;
		var query = this.getHashQuery();

		return {
			href: location.href ,
			keyArr: keyArr ,
			pathString: pathString ,
			pathArr:    pathArr ,
			queryString: queryString ,
			query:   	 query
		}
	},

	getUrlQuery:function(){
		var l = location.href ;
		if( !l.has('?') ){
			return {}
		}else{
			var str = l.match(/\?.*/)[0];
			var arr = str.match(/[?&]\w+=[^?&#\/]*/g);
			var obj = {};
			arr.map(function(v){
				var m = v.match(/(\w+)=(.*)/);
				obj[m[1]] = m[2]
			})
			return obj ;
		}	
	},

	getHashQuery:function(){
		var h = location.hash ;
		if( !h.has('?') ){
			return {}
		}else{
			var str = h.match(/\?.*/)[0];
			var obj = {};
			var arr = str.match(/[?&]\w+=[^?&#\/]*/g);
			if( arr ){
				arr.map(function(v){
					var m = v.match(/(\w+)=(.*)/);
					obj[m[1]] = m[2]
				})
			};
			return obj ;
		}
	},


}




export default r ;
