<template>
	<div class="project-left-menu">
		
		<div class="part1">
			<span class="icon-stack"></span>
			<span class="str">&nbsp;项目</span>
		</div>

		<div class="part2">
			<div class="title">
				<span class="icon-stack"></span>&nbsp;&nbsp;项目
			</div>
			<ul>
				<li v-for="(v,k) in this.list1"
					:class="{active: this.active==v.projectFlagKey }"
					@click="this.changerojectFlagKey(v)">
					{{v.name}}
				</li>
			</ul>
		</div>
		<div class="part3">
			<div class="title">
				<span class="icon-clipboard"></span>&nbsp;&nbsp;任务
			</div>
			<ul>
				<li v-for="(v,k) in this.list2"
					:class="{active: this.active==v.path }"
					@click="this.cahngePath(v)">
					{{v.name}}
				</li>
			</ul>
		</div>
	</div>
</template>
<script type="text/javascript">

	export default {
		data(){
			return {
				active:'',
				list1:[
					{
						name:'我负责和参与的',
						projectFlagKey:'masterJoin'
					},
					{
						name:'我创建的',
						projectFlagKey:'created'
					},
					{
						name:'我关注的',
						projectFlagKey:'focus'
					},
					{
						name:'全部项目',
						projectFlagKey:'all'
					}
				],
				list2:[
					{
						name:'个人统计',
						path:'chartsMan'
					},
					{
						name:'部门统计',
						path:'chartsDep'
					}
				]
			}
		},

		mounted(){
			this.getDefaultActive() ;
		},

		methods:{
			getDefaultActive(){
				let r = this.$router.$active ;
				let pathArr = r.pathArr ;
				let query = r.query ;
				let projectFlagKey = query.projectFlagKey ;

				this.list1.map( v=>{
					if( v.projectFlagKey==projectFlagKey ){
						this.active=projectFlagKey ;
						this.$diff ;
					}
				})
				this.list2.map( v=>{
					if( pathArr.has(v.path) ){
						this.active=v.path ;
						this.$diff ;
					}
				})
			},

			changerojectFlagKey(v){
				this.active = v.projectFlagKey ;
				this.$diff ;
				this.$router.push(`/project/projectType?projectFlagKey=${v.projectFlagKey}`);
			},

			cahngePath(v){
				this.active = v.path ;
				this.$diff ;
				this.$router.push(`/project/${v.path}`);
			}
		}
	}

</script>
<style type="text/css">
	.project-left-menu{
		width: 100%;height: 100%;
		background: white;
		padding-top: 90px;
		.part1{
			line-height: 35px;
			color: #5ca1ff ;
			font-size: 30px;
			position: absolute;
			top: 27px;
			left: 53px;
			span{
				display: inline-block;
				vertical-align: middle;
			}
			.str{
				font-size: 20px;
				padding-top: 3px;
			}
		}
		.title,li{
			transition: all 0.2s ease-in-out;
			height: 50px;
			line-height: 50px;
			font-size: 14px;
		}
		.title{
			padding-left: 25px;
			span{
				font-size: 15px;
				color: #999;
			}
		}
		li{
			padding-left: 48px;
		}
		.title:hover{
			background: #f5f5f5;
		}	
		li:hover{
			background:rgba(92, 161, 255, .1);
		}
		li.active{
			background: #5ca1ff;
			color: white; 
		}
	}
</style>