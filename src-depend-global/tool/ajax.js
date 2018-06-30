const AJAX = ( options={} )=>{
    var method      = options.type ? options.type.toUpperCase() : 'GET';
    var params      = options.params || {};   // 拼接地址
    var data        = options.data || {} ;    // formdata 数据
    var contentType = options.contentType ;
    var timeout     = options.timeout || 20000 ;
    var url         = options.url || '';
    
    var beforeSend = options.beforeSend || function(){} ;
    var success    = options.success || function(){} ;
    var error      = options.error   || function(){} ;

    var XHR = new window.XMLHttpRequest() || new window.ActiveXObject( "Microsoft.XMLHTTP" );
        // 设置必备信息
        XHR.withCredentials = true ;
        // 设置函数
        XHR.onreadystatechange = function() {
            if( XHR.readyState == 4 && XHR.status == 200 ) { 
                success( XHR.responseText );
            }
        };
        // **** ajax 失败一律不反错
        XHR.onerror=function(e){
            console.error('XHR.onerror\n',e);
            error();
        };
        XHR.onabort=function(){
            console.error('XHR.onabort');
            error();
        };
        XHR.ontimeout=function(){
            console.error('XHR.ontimeout');
            error();
        };
        
    // 转译
    var U = str=>encodeURIComponent(str) ;


    // params拼接到url上
    var paramsArr=[];
    for( let key in params ){
        paramsArr.push(`${U(key)}=${U(params[key])}`)
    };
    if( paramsArr.length ){
        if( url.indexOf('?')==-1 ){
            url=`${url}?${paramsArr.join('&')}`;
        }else{
            url=`${url}&${paramsArr.join('&')}`;
        }
    };

    // 发送数据 ;
    if( method=='GET' ){
        // open 
        XHR.open( method , url, true);
        XHR.timeout = timeout ;
        // beforeSend
        beforeSend(XHR);
        // send
        XHR.send( null );
    }else{
        if( contentType=='json' ){
            XHR.open( method , url, true);
            XHR.timeout = timeout ;
            // setRequestHeader
            XHR.setRequestHeader("Content-Type", "application/json; charset=UTF-8"); 
            // beforeSend
            beforeSend(XHR);
            // send
            var sendStr = JSON.stringify(data) ;
            XHR.send( sendStr );
        }else{
            // open
            XHR.open( method , url, true);
            XHR.timeout = timeout ;
            // setRequestHeader
            XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"); 
            // beforeSend
            beforeSend(XHR);
            // data格式化
            var dataArr = [];
            for( let key in data ){
                dataArr.push(`${U(key)}=${U(data[key])}`)
            };
            // send ;
            var sendStr = dataArr.join('&') ;
            XHR.send( sendStr );
        }
    };

// XHR.setRequestHeader('X-Requested-With','XMLHttpRequest');
    return XHR ;
};




import config from 'config';
import htmlDecode from './html-decode';
import ui from '../ui';
// 导出封装的ajax ;
export default function( opt ){
    // 特殊处理get请求 ;
    opt.type ? opt.type=opt.type.toUpperCase() : opt.type='GET';
    opt.type=='GET' ? opt.params=opt.data : null ;

    var url  =`${config['host']}${opt.url}${opt.url.indexOf('?')==-1?'?':'&'}timestamp=${(new Date).valueOf()}&token=${config['token']}`;

    // 配置
    var options = {
        type : opt.type ,
        params: opt.params,
        data : opt.data,
        contentType: opt.contentType,
        timeout: opt.timeout ,
        url: url ,
        beforeSend:(xhr)=>{
            opt.beforeSend ? opt.beforeSend.bind(this,xhr) : null ;
        } ,
        success: (responseText)=>{
            //全局替换XSS
            try{
                var res = JSON.parse( htmlDecode(responseText) );
            }catch(e){
                console.error(`xss 过滤失败  --->  ${opt.url}\n`,e);
            };

            if( res.code==0 ){
                opt.success ? opt.success.call(this,res.data , res) : null ;
            }else{
                opt.error ? opt.error.call(this,res.msg) : null ;
                // 失败提示 ;
                opt.alert!==false ? ui.no( res.msg|| '请求code!=0' ) : null ;
            };
        },
        error: ()=>{
            opt.error ? opt.error.call(this) : null ;
            opt.alert!==false ? ui.no( '网络正在开小差' ) : null ;
        } 
    };
    // 返回XHR用于停止 ;
    return AJAX( options );
};
