var src = require('../../src/assets/images/loading.png');

export default class Loading
{
	constructor(){
		let dom = document.createElement('div');
			dom.className = 'g-load-mask';
			dom.innerHTML = `<div class="loading"> 
                                <div class="rot">
                                    <img src="${src}"/>
                                </div>  
                                <p>加载中 . . .</p>
                            </div>`;
		this.dom = dom ;
		this.hasOpen=false ;
	}
	open(){
		if( this.hasOpen==false ){
			this.hasOpen=true;
			// 前面所有的隐身
			var ds = document.querySelectorAll('.g-load-mask');
			for(let i=0,len=ds.length ; i<len ; i++){
				let el = ds[i];
					el.style.display='none';
			};
			// 添加新一个
			document.body.appendChild( this.dom );
		}
	}
	close(){
		try{
			this.dom.outerHTML='';
		}catch(e){}
	}

	// 当有alert时 , 需要清空loading ;
	static hideAll(){
		var ds = document.querySelectorAll('.g-load-mask');
		for(let i=0,len=ds.length ; i<len ; i++){
			let el = ds[i];
				el.style.display='none';
		};
	}

};
