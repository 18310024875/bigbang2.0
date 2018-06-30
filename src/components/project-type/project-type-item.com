<template>
	<div class="project-type-item cp" 
		 v-if="this.data"
		 :class="{enter: this.enter }"
		 @click="this.toProjectDetail"
		 @mouseenter="this.mouseFun(true)"
		 @mouseleave="this.mouseFun(false)">
		<!-- {{this.data}} -->
		<div class="init" :class="{doing:this.data.status==1, done:this.data.status==3, not_start:this.data.status==4, delay:this.data.status==5}">
			<div class="pname elli">
				<span>{{this.data.name}}</span>
			</div>
			<div class="ss-wrap">
				<span class="ss" v-if="this.data.status==1">进行中</span>
				<span class="ss" v-if="this.data.status==4">未开始</span>
				<span class="ss" v-if="this.data.status==3">已结束</span>
				<span class="ss" v-if="this.data.status==5">已延期</span>
					<span class="ss-f" v-if="!this.data.isPublic">不公开</span>
				<span class="ss-t">{{this.data.finishTaskNum}}/{{this.data.allTaskNum}}</span>
			</div>
			<div class="btm">
				<div class="n elli">{{this.data.chargePersonName}}</div>
				<div class="g">
					<div class="move" :style="{width: this.getMoveWidth()}"></div>
				</div>
				<div class="t">{{this.time(this.data.endDate)}}截止</div>
			</div>
			<div class="gz cp" :class="{foucs:this.data.isFocus , not_foucs:!this.data.isFocus }" @click="this.doFocus">
				<span class="icon-star-full ic"></span>
			</div>
		</div>

	</div>
</template>
<script type="text/javascript">
	
	export default{

		data(){
			return {
				enter:false
			}
		},

		methods:{
			time(tmp){
				return this.$tool.time(tmp,'YYYY-MM-DD');
			},
			getMoveWidth(){
				if( this.data.allTaskNum==0 ){
					return '0%';
				}else{
					return ((this.data.finishTaskNum/this.data.allTaskNum)*100).toFixed(1)+'%';
				}
			},
			mouseFun( bool ){
				this.enter = bool ;
				this.$diff ;
			},
			doFocus(e){
				e.stopPropagation();
				this.$ajax({
					url:'/project/projectUserRelation/focus',
					type:'post',
					data:{
						projectId: this.data.id 
					},
					success(data){
						this.$ui.yes() ;
						this.data.isFocus==0 ? this.data.isFocus=1 : this.data.isFocus=0 ;
						this.$diff ;
					}
				})
			},
			toProjectDetail(){
				let data = this.data ;
				// this.$router.push(`/project/projectDetail/${data.id}/taskViewBoard?taskRole=0&isFinished=1`);
			}
		}
	}
</script>
<style lang="less">
.project-type-item{
		width: 245px;
		height: 120px;
		display: inline-block;
		margin: 20px 15px 0px 0px;
		background: #f5f5f5;
		box-shadow: rgba(0, 0, 0, 0.13) 0px 4px 10px;
		transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
		border-radius: 5px;
		overflow: hidden;
		&:hover{
			box-shadow: rgba(0, 0, 0, 0.129412) 0px 4px 10px, rgba(0, 0, 0, 0.129412) 0px 6px 20px !important;
		}
		.gz .ic{
			position:relative;
			top:-1px;
			font-size: 14px;
		}
		.doing{
			background: url("assets/images/doing_bg.png") no-repeat ;
			background-size: contain;
			.ic,.ss{
				color: rgba(104,182,252,1);
			}
		}
		.done{
			background: url("assets/images/done_bg.png") no-repeat ;
			background-size: contain;
			.ic,.ss{
				color: rgba(195,197,211,1);
			}
		}
		.not_start{
			background: url("assets/images/not_start_bg.png") no-repeat ;
			background-size: contain;
			.ic{
				color: rgba(195,197,211,1);
			}
			.ss{
				color: rgb(31, 218, 154);
			}
		}
		.delay{
			background: url("assets/images/delay_bg.png") no-repeat ;
			background-size: contain;
			.ic,.ss{
				color: rgba(249,159,205,1);
			}
		}
		.init{
			width: 100%;height: 100%;
			padding:12px 16px;
			position: relative;
			.pname{
				max-width: 170px;
				color: white;
				font-size: 16px;
				margin-bottom: 15px;
			}
			.gz{
				width: 22px;height: 22px;line-height: 22px;
				text-align: center;
				border-radius: 50%;
				transition: all 500ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
				position: absolute;
				top: 13px;right: 15px;
			}
			.foucs{
				background: white;
				opacity: 0.9;
				.ic{
					color: #FFDE00;
				}
			}
			.not_foucs{
				opacity: 0 ;
				background: rgba(255,255,255,0.4);
			}
			.ss-wrap{
				.ss,.ss-f{
					font-size: 12px;
					width: 50px;height: 20px;line-height: 19px;
					background: white;
					text-align: center;
					border-radius: 15px;
					display: inline-block;
				}
				.ss-f{
					color:rgb(255, 180, 0);
					margin-left: 3px;
				}
				.ss-t{
					font-size: 12px;
					float: right;
					color: white;
				}
			}
		}
		.btm{
			font-size: 12px;
			position: absolute;
			bottom:0;left: 0;right: 0;
			height: 36px;line-height: 36px;
			background: white;
			padding: 0 15px 0 16px;
			&>div{
				float: left;
			}
			.n{
				color: rgb(102, 102, 102);
				display: inline-block;max-width: 50px;
			}
			.g{
				width: 50px;height: 6px;
				background: rgb(229, 229, 229);
				display: inline-block;
				border-radius: 10px;
				margin-top: 15px;
				margin-left: 10px;
				position: relative;
				overflow: hidden;
				.move{
					float: left;
					background: rgb(49, 217, 156);
					height: 6px;
					border-radius: 0 3px 3px 0;
				}
			}
			.t{
				float: right;
				color: rgb(204, 204, 204);
			}
		}
	}
	.enter .not_foucs{
		opacity: 1!important;
	}
</style>