<template>
	<div class="gm-choose-part">
		<div class="gm-choose-part-title">
			<div class="l">
				请选择({{ this.getChooseLength() }}/99)
			</div>
			<div class="r" @click="this.clearAll">
				清空
			</div>
		</div>
		<ul class="gm-choose-part-scroll">
			<!-- <gAvatar :avatar="'http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/917/170709/201704/19/14925940667EZD.jpg.thumb.jpg'" :name="'张琛'"/> -->
			<li v-for="(item,k) in this.selectedMans" class="gm-choose-item">
				<gAvatar 
					class="gm-choose-avatar" 
					:size="'30px'"
					:fontSize="'13px'"
					:avatar="item.avatar" 
					:name="item.userName">
				</gAvatar>
				<div class="gm-choose-name">
					{{item.userName}}
				</div>
				<div class="gm-choose-r" @click="this.deleteOne(item)">
					<span class="icon-cross"></span>
				</div>
			</li>
		</ul>
	</div>
</template>
<script type="text/javascript">
	
	export default{
		components:{

		},

		data(){
			return {

			}
		},
		methods:{
			getChooseLength(){
				return 0
			},
			clearAll(){
				window.selectMan.clearAll();
			},
			deleteOne(item){
				window.selectMan.delMan(item);
			}
		}
	}
</script>
<style lang="less">
	.gm-choose-part{
		width: 100%;height: 100%;
		position: relative;
		padding-top: 40px;
		.gm-choose-part-title{
			position: absolute;
			width: 100%;
			top: 0;left: 0;
			height: 40px;
			line-height: 40px;
			font-size: 13px;
			padding: 0 10px;
			.l{
				float: left;
			}
			.r{
				float: right;
				margin-right: 3px;
				color: #FF6873;
				cursor: pointer;
			}
		}
		.gm-choose-part-scroll{
			width: 100%;height: 100%;
			overflow-x: hidden;
			overflow-y: auto;
			.gm-choose-item{
				height: 46px;
				position: relative;
				&:hover{
					background:rgba(242, 243, 244, .5);
					.gm-choose-r{
						display: block;
					}
				}
				.gm-choose-avatar{
					position: absolute;
					top: 10px;
					left: 10px;
				}
				.gm-choose-name{
					position: absolute;
					font-size: 13px;
					top: 18px;
					left: 50px;
				}
				.gm-choose-r{
					cursor: pointer;
					display: none;
					font-size: 12px;
					color: #999;
					opacity: 0.3;
					width: 30px;
					position: absolute;
					right: 2px;
					top: 0;
					height: 46px;
					line-height: 46px;
					text-align: center;
				}
			}
		}
	}
</style>