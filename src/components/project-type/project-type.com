<template>
	<div class="project-type">

		<div class="project-type-title">
			<div class="part1" v-show="this.key=='masterJoin'">我负责和参与的项目</div>
			<div class="part1" v-show="this.key=='created'">我创建的项目</div>
			<div class="part1" v-show="this.key=='focus'">我关注的项目</div>
			<div class="part1" v-show="this.key=='all'">全部项目</div>

			<gButton class="gButton" :str="'创建项目'" @click="this.openModalProject"></gButton>

		</div>
		<div class="project-type-list">
			<projectTypeItem v-for="(item , k) in this.list" :data="item" style="float:left;"/>
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
			let r = this.$router.$active ;
			let query = r.query ;

			this.key = query.projectFlagKey || 'masterJoin' ;
			this.$diff ;

			this.getList() ;
		},
		routeQueryChange(query){
			this.pageNo = 1 ;

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
						if( key=='masterJoin' ){

						}else{
							this.list = data.list || [] ;
							this.$diff ;
						}
					}
				})
			},

			openModalProject(){
				alert(1)
			}

		},

	}
</script>
<style lang="less">
	.project-type{
		.project-type-title{
			height:57px;
			line-height:57px;
			padding:0 22px;
			background:white;
		}
		.project-type-list{
			padding-left:22px;
		}
		.gButton{
			position:absolute;
			right:22px;
			top: 13px;
		}
	}
</style>