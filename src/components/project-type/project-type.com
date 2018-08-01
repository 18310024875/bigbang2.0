<template>
	<div class="project-type">

		<div class="loading rot_animate icon-spinner2" v-show="this.list.length==0"></div>

		<div class="project-type-title">
			<div class="part1" v-show="this.key=='masterJoin'">我负责和参与的项目</div>
			<div class="part1" v-show="this.key=='created'">我创建的项目</div>
			<div class="part1" v-show="this.key=='focus'">我关注的项目</div>
			<div class="part1" v-show="this.key=='all'">全部项目</div>

			<gButton class="gButton" :str="'创建项目'" @click="this.openProjectModal"></gButton>

		</div>

		<div v-if="this.key=='masterJoin'" class="project-type-list">
			<!-- 一级 -->
			<div v-for="(type , index) in this.list" class="type-item">
				<div class="catalogueName">{{type.catalogueName}}</div>
				<div class="type-item-list">
					<!-- 二级 -->
					<projectTypeItem v-for="(item , k) in type.list" :data="item" style="float:left;" @click="this.toDetail(item)"/>
				</div>
			</div>
		</div>

		<div v-if="this.key!='masterJoin'" class="project-type-list">
			<!-- 一级 -->
			<projectTypeItem v-for="(item , k) in this.list" :data="item" style="float:left;" @click="this.toDetail(item)"/>
		</div>
	</div>
</template>
<script type="text/javascript">
	
	import projectTypeItem from './project-type-item';

	export default{
		components:{
			projectTypeItem
		},

		data(){
			return {
				key:'',
				pageNo:1,
				obj:{
					width:'200px'
				},	

				list:[]
			}
		},

		mounted(){
			let query = this.$router.query ;

			this.key = query.projectFlagKey || 'masterJoin' ;
			this.$diff ;

			this.getList() ;
		},
		queryChange(query){
			this.pageNo = 1 ;
			this.list = [] ;

			this.key = query.projectFlagKey || 'masterJoin' ;
			this.$diff ;

			this.getList() ;
		},

		methods:{
			getList(){
				let key = this.key ;
				let info ;
				if( key=='masterJoin' ){
					info = {
						url:'/project/t_project/getWebProjectPanelList',
						data:{
							myFlag:0,
							status:1
						}
					}
				}else{
					let myFlag ;
					key=='created' ? myFlag=1 : null ;
					key=='focus'   ? myFlag=5 : null ;
					key=='all'     ? myFlag=0 : null ;

					info = {
						url:'/project/t_project/getWebProjectList',
						data:{
							myFlag: myFlag ,
							pageNo: this.pageNo ,
							pageSize: 20
						}
					}
				}	
				// ajax ;
				this.$ajax({
					...info ,
					success(data){
						if( this.key=='masterJoin' ){
							this.list = data || [] ;
							this.$diff ;
						}else{
							this.list = data.list || [] ;
							this.$diff ;
						}
					}
				})
			},

			openProjectModal(){
				APP.openProjectModal('',()=>{
					this.getList();
				})
			},

			toDetail( item ){
				this.$ajax({
					alert: false ,
					url:'/project/t_project/detail',
					data:{
						id: item.id 
					},
					success(data){
						data.creatorId=data.memberId ;
						
						!data.catalogueId ? data.catalogueId=0 : null ;
						data.beginDate=this.$tool.time(data.beginDate, 'YYYY-MM-DD');
						data.endDate=this.$tool.time(data.endDate, 'YYYY-MM-DD');

						APP.openProjectModal( data , ()=>{
							this.getList();
						})
					}
				})
			}

		},

	}
</script>
<style lang="less">
	.project-type{
		width:100%;
		height:100%;
		position:relative;
		padding-top: 57px;
		.loading{
			text-align:center;
			font-size:30px;
			color:#5ca1ff;
			position:absolute;
			top: 100px;
			width:100%;
		}
		.project-type-title{
			height:57px;
			line-height:57px;
			padding:0 22px;
			background:white;
			position:absolute;
			top:0;left:0;right:0;
		}
		.project-type-list{
			padding-left:22px;
			overflow:auto;
			height:100%;
			&>article{
				&>.type-item{
					&>.catalogueName{
						margin-top: 20px;
						font-size: 14px;
						color: #999999;
						cursor: pointer;
					}
					&>.type-item-list{
						&>article{
							overflow:hidden;
						}
					}
				}
			}
		}
		.gButton{
			position:absolute;
			right:22px;
			top: 13px;
		}
	}
</style>