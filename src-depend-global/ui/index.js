import $ from 'jquery';

export default{
	yes( str='操作成功' , time=1100 ){
		var dom = $(`<div class="g-ui-yes">
						<div><span class="icon-checkmark ic"></span> ${str}</div>
					</div>`);

		$('body').append( dom );

		dom.fadeIn(300);

		setTimeout(()=>{
			dom.fadeOut(300,()=>{
				dom.remove();
			});
		}, time )
	},
	no( str='操作失败' , time=1300 ){
		var dom = $(`<div class="g-ui-no">
						<div><span class="icon-user ic"></span> ${str}</div>
					</div>`);
		
		$('body').append( dom );

		dom.fadeIn(200);

		setTimeout(()=>{
			dom.fadeOut(300,()=>{
				dom.remove();
			});
		}, time )
	},
	say( str='' , time=1100 ){
		var dom = $(`<div class="g-ui-say">
						<div>${str}</div>
					</div>`);
		
		$('body').append( dom );

		dom.fadeIn(200);

		setTimeout(()=>{
			dom.fadeOut(300,()=>{
				dom.remove();
			});
		}, time )
	},
	confirm( str='' , time=1100 ){

	}
}