Array.prototype.has  = function(str){
	return this.indexOf(str)>-1 ? true : false ;
}
String.prototype.has = function(str){
	return this.indexOf(str)>-1 ? true : false ;
}


var t = Date.parse(new Date());

var $ = {

	q:function(str){
		return document.querySelector(str)
	},
	qs:function(str){
		return document.querySelectorAll(str)
	},

	onlyId:function(){
		return 'id_'+(++t);
	},

	// formProps:['id','src','href','title','value','readonly','disabled','checked','selected','autofocus','multiple','action'],
	formProps:['readOnly','disabled','checked','selected','autofocus','multiple'],
	setAttr:function( dom , key , value ){
		if( $.formProps.has(key) ){
			dom[key] = !!v.value ;
		}else{
			typeof value=='object' ? dom.setAttribute(key,JSON.stringify(value)) : dom.setAttribute(key,value)
		}
	},
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

	diffClass:function( dom , n , old ){
		for(var k in n ){
			if( !!n[k] != !!old[k] ){
				n[k] ? console.log('dom.classList.add',k) : console.log( 'dom.classList.remove',k) ;

				n[k] ? dom.classList.add(k) : dom.classList.remove(k) ;
			} 
		}
	},
	diffStyle:function( dom , n , old ){
		for(var k in n ){
			if( n[k] !== old[k] ){
				console.log('dom.style.',k,n[k])
				dom.style[k] = n[k];
			} 
		}
	},

	type:function( x ){
		// 分辨数据类型 
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