<template>
	<div class="g-select-man">
		
		<div class="gm-content">
			<div class="gm-head">
				<span>选择提交人</span>
				<div class="icon-cross" @click="this.cancel"></div>
			</div>
			<div class="gm-body">
				<div class="gm-dep-and-man-wrap">
					<ul>
						<li @click="this.changeActiveTab('dep')"><span :class="{active : this.activeTab=='dep'}">部门</span></li>
						<li @click="this.changeActiveTab('man')"><span :class="{active : this.activeTab=='man'}">成员</span></li>
					</ul>

					<!-- 部门组件 -->
					<depContent v-show="this.activeTab=='dep'"></depContent>

					<!-- 成员组件 -->
					<manContent v-show="this.activeTab=='man'"></manContent>

				</div>

				<!-- 右侧选中的人员 -->
				<choosePart class="choosePart" :selectedMans="this.selectedMans"></choosePart>

			</div>
			<div class="gm-foot">
				<gButton class="cancel" 
					:width="'100px'" :str="'取消'" :borderColor="'#dddee1'" :backgroundColor="'white'" :color="'#495060'"
					@click="this.cancel">		
				</gButton>
				<gButton class="submit" 
					:width="'100px'" :str="'确定'"
					@click="this.submit">
				</gButton>
			</div>
		</div>

	</div>
</template>
<script type="text/javascript">

	import depContent from './dep-content';
	import manContent from './man-content';
	import choosePart from './choose-part';

	/*
		props --> 
			selectedMans 选中的人员 ;
	*/

	export default{
		components:{
			depContent ,
			manContent ,
			choosePart
		},

		data(){
			return {
				open:false,
				activeTab:'dep'
			}
		},
		methods:{
			changeActiveTab( tab ){
				this.activeTab = tab ;
				this.$diff ;
			},
			cancel(){
				window.selectMan.close();
			},
			submit(){
				let list = window.selectMan.selectedMans.map( v=>({
					avatar: v.avatar ,
					memberId : v.memberId,
					userName : v.userName,
				}))
				window.selectMan.callback ? window.selectMan.callback(list) : null ;

				window.selectMan.close();
			}
		}
	}
</script>
<style lang="less">
	/*#dddee1*/
	/*#5ca1ff*/
	.g-select-man{
		position: fixed;
		top: 0;bottom: 0;
		left: 0;right: 0;
		z-index: 100;
		background: rgba(0,0,0,0.5);
		.gm-content{
			width: 600px;height: 500px;
			position: absolute;
			left: 50%;top: 50%;
			transform: translate(-50%,-50%);
			border-radius: 2px;
			overflow: hidden;
			background: white;
		}

		.gm-head{
			position: relative;
			height: 40px;
			line-height: 40px;
			background: #F2F3F4;
			padding: 0 20px;
			&>span{
				font-size: 13px;
				color: #666;
			}
			&>.icon-cross{
				width: 40px;
				line-height: 40px;
				height: 40px;
				text-align: center;
				color: #999;
				font-size: 12px;
				position: absolute;
				right: 2px;top: 0;
				opacity: 0.6;
				cursor: pointer;
			}
		}
		.gm-body{
			position: absolute;
			width: 100%;
			left: 0;
			top: 40px;
			bottom: 60px;
			.gm-dep-and-man-wrap{
				width: 360px;
				height: 100%;
				position: relative;
				border-right: 1px solid #dddee1;
				padding-top: 40px;
				position: relative;
				overflow-y: auto;
				&>ul{
					position: absolute;
					left: 0;top: 0;
					width: 100%;
					height: 40px;
					line-height: 40px;
					border-bottom: 1px solid #dddee1;
					font-size: 0;
					li{
						height: 40px;
						line-height: 40px;
						width: 50%;
						float: left;
						text-align: center;
						font-size: 0;
						span{
							height: 40px;
							line-height: 40px;
							font-size: 13px;
							display: inline-block;
							padding: 0 20px;
							border-bottom: 2px solid transparent ;
							cursor: pointer;
							transition: all 0.2s;
						}
						span.active{
							border-color: #5ca1ff;
							color: #5ca1ff;
						}
					}
				}
			}
			.choosePart{
				position: absolute;
				right: 0;
				top: 0;
				bottom: 0;
				width: 239px;
			}
		}
		.gm-foot{
			position: absolute;
			width: 100%;
			left: 0;bottom: 0;
			height: 60px;
			border-top: 1px solid #dddee1 ;
			.cancel{
				position: absolute;
				right: 140px;top: 12px;
			}
			.submit{
				position: absolute;
				right: 20px;top: 12px;
			}
		}
	}
</style>