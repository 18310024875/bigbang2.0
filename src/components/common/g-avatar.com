<template>
	<div class="g-avatar img-wrap" 
		:style="{
			width: this.size||'30px', 
			height: this.size||'30px'
		}">
		<!-- 图片头像 -->
		<img 
			class="g-avatar-img" 
			v-if="!this.isError" 
			:src="this.avatar"
			@error="this.imgError"/>
		<!-- 文字头像 -->
		<div 
			class="g-avatar-name"
			v-if="this.isError" 
			:style="{
				background: this.getBgColor()
			}">
			<div 
				class="tran"
				:style="{
					fontSize: this.fontSize||'13px'
				}">
				{{ this.getName() }}
			</div>		
		</div>
	</div>
</template>
<script type="text/javascript">
	
	const COLOR_LIST = ['#00B8D9', '#1594ff', '#ffa92f', '#b587fa', '#06cf86', '#fa6771', '#73d51c', '#8991ff'];

	/*
		props -->
			size ,
			fontSize ,
			avatar ,
			name
	*/

	export default{
		components:{

		},

		data(){
			return {
				isError:false 
			}
		},

		created(){
			// 如果没传图片 或者 传递的图片为默认图片 , 直接显示文字头像 ;
			if( this.isDefaultImg() ){
				this.isError=true
			}
		},

		methods:{
			imgError(){
				this.isError=true;
				this.$diff ;
			},
			isDefaultImg(){
				let avatar=this.avatar||'';
				if( !avatar || avatar.has('default_avatar') ){
					return true ;
				}else{
					return false;
				}
			},
			getName(){
				let str = this.name || '' ;
				return /[\u4e00-\u9fa5]/.test(str) ? str.substr(-2) : str.substr(0, 2);
			},
			getBgColor(){
				let str = this.name || '' ;
				let c = this.$tool.md5(str).charAt(0).toLowerCase();
				let bg = COLOR_LIST['abcdefghijklmnopqrstuvwxyz0123456789'.indexOf(c) % COLOR_LIST.length];
				return bg;
			},
		}
	}
</script>
<style>
	.g-avatar{
		.g-avatar-img{
			border-radius: 50%;
			overflow: hidden;
			display: block;
			width: 100%;
			height: 100%;
		}
		.g-avatar-name{
			border-radius: 50%;
			overflow: hidden;
			height: 100%;
			width: 100%;
			position: relative;
			float: left;
			.tran{
				line-height: 1;
				text-align: center;
				color: white;
				width: 100%;
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
			}
		}
	}
</style>