const base = {
    v: '1.0',
    sn:'576ca34e4f674288831159',
    salt:'BAN/+GGzUBtMW',
    token: ''
}

const ConfigObj = {
	'test':{
		// ...base ,
		// host: 'http://123.103.9.204:6058',
		// projectUrl: 'http://123.103.9.204:6058/project/dist/index.html',
		// taskUrl   : 'http://123.103.9.204:6058/task/dist/index.html',
		...base ,
		host : 'https://ezone.yonyoucloud.com',
		projectUrl: 'https://ezone.yonyoucloud.com/project/dist/index.html',
		taskUrl   : 'https://ezone.yonyoucloud.com/task/dist/index.html',
	},
	'prev':{
		...base ,
		host : 'https://ezone.esn.ren',
		projectUrl: 'https://ezone.esn.ren/project/dist/index.html',
		taskUrl   : 'https://ezone.esn.ren/task/dist/index.html',
	},
	'build':{
		...base ,
		host : 'https://ezone.yonyoucloud.com',
		projectUrl: 'https://ezone.yonyoucloud.com/project/dist/index.html',
		taskUrl   : 'https://ezone.yonyoucloud.com/task/dist/index.html',
	}
}

const config = ConfigObj[ ENV ] ;

// 当地址存在token 赋值给config ;
var href  = window.location.href ;
var token = href.match(/[^\w]token=([\w-]*)/) && href.match(/[^\w]token=([\w-]*)/)[1];
    token ? config['token']=token : null ;

console.warn('ENV =====> ');
console.warn('config ======> ' + JSON.stringify(config));

export default config ;

