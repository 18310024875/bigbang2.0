import $ from './com.tool.js' ;

import template from './com.template.js';

import component from './com.component.js';

import router from './com.router.js';


window.Com = function( opt , props ){

	// 判断是否解析了less
	if( opt.templateOfLess && !opt.templateOfLessAppend ){
		opt.templateOfLessAppend = true ;

		var style = document.createElement('style');
		var css = opt.templateOfLess ;
			css = '\n'+css ;
			css = css.replace(/\}/g,'}\n');

			style.innerHTML = css ;

		document.head.appendChild( style );
	}

	// 判断是否解析了树
	!opt.tree ? opt.tree=Com.template.run( opt.template ) : null ;

	// 解析的树克隆一份
	var tree = $.clone(opt.tree);

	// 每次引入组件 data刷新 ;
	var data 
	!opt.data ? opt.data=function(){ return {} } : null ;
	if( $.type(opt.data)=='function' ){
		data = opt.data() ;
	}else {
		alert( 'data必须为函数' );
		return ;
	}


	// 生成组件
	return new Com.component( 
		opt ,   //配置项
		data ,  //配置项克隆data()返回值
		tree ,  //解析配置项模板生成的组件树
		props , //收到的props
	);
};

// 注册全局组件 可递归自己 ;
Com.globalComponents={};
Com.globalComponent = function(name , opt){

	// 判断是否解析了树
	!opt.tree ? opt.tree=Com.template.run( opt.template ) : null ;

	// 记录组件名 
	Com.globalComponents[ name ] = opt ;

	return opt ;
}

// 绑定到 Com 上 ;
Com.template = template ;
Com.component = component ;
Com.router = router ;

export default Com ;