// var FORM_PROPS = ['id','src','href','title','value','readonly','disabled','checked','selected','autofocus','multiple','action']
var FORM_PROPS = ['readOnly','disabled','checked','selected','autofocus','multiple'];

var id= Date.parse( new Date() );

var $ = {
	onlyId(){
		return ++id ;
	},
// dom 相关 ;
	q:function(str){
		return document.querySelector(str)
	},
	qs:function(str){
		return document.querySelectorAll(str)
	},
	// ***set
	setClass:function( dom , obj ){
		// typeof c == 'number'? c=c.toString() : null ; 
		for(var k in obj ){
			obj[k] ? dom.classList.add(k) : dom.classList.remove(k) ;
		}
	},
	setStyle:function( dom , obj ){
		// v=v.replace(/-(\w)/g,function(E,a){return a.toLocaleUpperCase()});
		for(var k in obj ){
			dom.style[k] = obj[k];
		}
	},
	setAttr:function( dom , obj ){
		for(var k in obj){
			var value=obj[k];
			if( FORM_PROPS.indexOf(k)!=-1 ){
				dom[k] = !!value ;
			}else{
				if(k=="value"){
					dom[k] = value ;
				}else{
					typeof value=='object' ? dom.setAttribute(k,JSON.stringify(value)) : dom.setAttribute(k,value);
				}
			}
		}
	},
	// ***diff
	diffClass:function( dom , n , old ){
		for(var k in n ){
			if( !!n[k] != !!old[k] ){
				// n[k] ? console.log('dom.classList.add',k) : console.log( 'dom.classList.remove',k) ;

				n[k] ? dom.classList.add(k) : dom.classList.remove(k) ;
			} 
		}
	},
	diffStyle:function( dom , n , old ){
		for(var k in n ){
			if( n[k] !== old[k] ){
				// console.log('dom.style.',k,n[k])
				dom.style[k] = n[k];
			} 
		}
	},
	diffAttr:function( dom , n , old ){
		for(var k in n){
			if( n[k] !== old[k] ){
				var value=n[k];
				if( FORM_PROPS.indexOf(k)!=-1 ){
					dom[k] = !!value ;
				}else{
					if(k=="value"){
						dom[k] = value ;
					}else{
						typeof value=='object' ? dom.setAttribute(k,JSON.stringify(value)) : dom.setAttribute(k,value);
					}
				}
			}
		}
	},


// 数据类型 相关
	type:function( x ){
		// regexp function object array 
		// null undefined boolean number string
		var str = Object.prototype.toString.call( x ).slice(8, -1) ;
		return str.toLocaleLowerCase();
	},
	notEmpty:function( x ){
		return !$.empty(x);
	},
	empty:function( x ){
		if( $.type(x)=='array' ){
			if( x.length==0 ){
				return true ;
			}else{
				return false ;
			}
		}else if( $.type(x)=='object' ){
			var ind = 0 ;
			for(var i in x){
				i?ind++:null;
			}
			if( !ind ){
				return true ;
			}else {
				return false ;
			}
		}else {
			if( !x ){
				return true; 
			}else{
				return false;
			}
		}
	},
	clone:function( tree ) {
		var return_ ;
		var type = $.type(tree);
		if( type=='array' ){
			return_ = tree.map(function( v ){
				return $.clone( v );
			});
		}else if( type=='object' ){
			var obj = {} ;
			for(var i in tree){
				obj[i] = $.clone( tree[i] );
			}
			return_ = obj ;
		}else{
			return_ = tree ;
		}

		return return_ ;
	},

    encodeHTML:function (s){  
        if(s.length == 0) return "";
        s = str.replace(/&/g,"&amp;");
        s = s.replace(/</g,"&lt;");
        s = s.replace(/>/g,"&gt;");
        s = s.replace(/ /g,"&nbsp;");
        s = s.replace(/\'/g,"&#39;");
        s = s.replace(/\"/g,"&quot;");
        return s;  
    },
    decodeHTML:function(s){
        if(s.length == 0) return "";
        s = str.replace(/&amp;/g,"&");
        s = s.replace(/&lt;/g,"<");
        s = s.replace(/&gt;/g,">");
        s = s.replace(/&nbsp;/g," ");
        s = s.replace(/&#39;/g,"\'");
        s = s.replace(/&quot;/g,"\"");
        return s; 
    },
}

export default $ ;