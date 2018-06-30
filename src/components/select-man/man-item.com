<template>
	<div class="gm-man-item" :class="{useInDepTree: this.useInDepTree}">
		<gAvatar 
			class="gm-avatar" 
			:size="'30px'"
			:fontSize="'13px'"
			:avatar="this.avatar" 
			:name="this.name">		
		</gAvatar>

		<p class="elli">
			<span class="s1">{{this.name||''}}</span>
			<span class="s2">{{this.dep||''}}</span>
		</p>

		<div class="checkbox"
			:class="{
				checked: this.checked
			}">
			<span class="icon-checkmark"></span>
		</div>
	</div>
</template>
<script type="text/javascript">

	/*
		props -->
			useInDepTree
			avatar
			name
			dep
			checked
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
	.gm-man-item{
		height:47px;
		width:100%;
		position:relative;
		cursor: pointer;
		padding-left: 61px;
		padding-right: 40px;
		&:hover{
			background:rgba(242, 243, 244, 0.5);
		}
		.checkbox{
			width: 14px;
			height: 14px;
			text-align: center;
			line-height: 10px;
			border: 1px solid #dddee1;
			border-radius: 2px;
			position: absolute;
			right: 20px;
			top: 16px;
			transition: all 0.2s;
			background: white;
			.icon-checkmark{
				font-size: 12px;
				color: white;
			}
		}
		&>p{
			font-size: 13px;
			line-height: 47px;
			.s2{
				font-size: 12px;
				color: #999;
				margin-left: 12px;
			}
		}
		.checkbox.checked{
			background: #5ca1ff;
			display: inline;
			border-color: #5ca1ff;
		}

		.gm-avatar{
			position: absolute;
			left: 20px;top: 8px;
		}
	}
	.gm-man-item.useInDepTree{
		padding-left: 41px;
		.gm-avatar{
			left: 0;
		}
		&:hover{
			background:white;
		}
	}
</style>