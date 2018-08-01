/*
	必须存在 !!!!!
	<script> 
		export default {} 
	</script>
*/


// less ;
var less = require('less');
// autoprefixPlugin 加前缀 ;
var lessPluginAutoPrefix = require('less-plugin-autoprefix');
// 配置兼容 ;
var autoprefixPlugin = 
	(new lessPluginAutoPrefix(
			{browsers: [                
				'last 3 versions',
	            'ie >= 9',
	            'ie_mob >= 9',
	            'ff >= 30',
	            'chrome >= 34',
	            'safari >= 6',
	            'opera >= 12.1',
	            'ios >= 6',
	            'android >= 4.4',
	            'bb >= 10',
	            'and_uc 9.9']
	        }));

// 解析模板 ;
var template = require('../com/com.template.js');

// 解析路径
var path = require('path');

// webpack 自带 , 得到引入文件信息 ;
var loaderUtils = require("loader-utils");


// 导出 ;
module.exports = function( com ){

	// 处理完交给回调函数 ;
	var callback = this.async() ;


	// 1 获取 js ( 必有 )
	var js = com.match(/<script.*?>((\n|.)*)<\/script>/) ;
		js&&js[1] ? js=js[1] : null ;
	if( js ){
		// 2 获取 template ;
		var tpl = com.match(/<template.*?>((\n|.)*)<\/template>/) ; 
			tpl&&tpl[1] ? tpl=tpl[1] : tpl='<i class="no_template"/>' ;
			Number(tpl)===0 ? tpl='<i class="empty_template"/>' : null ;
		if( tpl ){

			var render = template.run( tpl ) ;

			js = js.replace(/export\s+default\s*(\\n)*\s*{/,`export default { \n render:${render} ,\n`)
		}

		// 3 获取 style ;
		var style = com.match(/<style.*?>((\n|.)*)<\/style>/) ;
			style&&style[1] ? style=style[1] : style=null ;
		if( style ){

			// less引入路径 ;
			var url = loaderUtils.getCurrentRequest(this); 
				url = url.split('!').pop();
				url = path.resolve(url , '..');

			// 解析less ;
			less.render( 
				style , { 
					plugins  : [autoprefixPlugin] , 
					compress : true ,
					paths    : [url]
				},function(e,output){
					var css = output.css ;

					js = js.replace(/export\s+default\s*(\\n)*\s*{/,"export default { \n templateOfLess: `"+css+"`,\n")

					callback(null, js );
				});
		}else{

			callback(null, js );
		}
	}else{

		callback(null, com );
	}

};
