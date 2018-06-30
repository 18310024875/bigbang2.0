<template>

	<div class="g-button"
		 :class="{disabled: this.disabled }"
		 :style="{
		 	width: this.width||'90px' ,
		 	height: this.height||'32px' ,lineHeight: this.height||'32px' ,
		 	color: this.color||'white',
		 	backgroundColor: this.backgroundColor||'#5ca1ff',
		 	borderColor: this.borderColor||'#5ca1ff',
		 	fontSize: this.fontSize||'13px'
		 }">

		{{ this.str || '按 钮' }}
	</div>

</template>
<script type="text/javascript">
	
	/*
		props --> 
			str ,
			disabled ,

			width ,
			height ,
			color ,
			backgroundColor ,
			borderColor ,
			fontSize
	*/

	export default{
		components:{

		},

		data(){
			return {

			}
		},
		methods:{

		}
	}
</script>
<style lang="less">
	.g-button{
		box-sizing:border-box;
		text-align: center;
		border-radius: 5px;
		cursor: pointer;
		border:1px solid #5ca1ff;
	}
	.g-button.disabled{
		opacity: 0.3;
		pointer-events: none;
	}
</style>