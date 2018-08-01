<template>
	<div id="project">
		<!-- 左侧菜单 -->
		<projectLeftMenu class="project-left-menu-wrap"></projectLeftMenu>
		<!-- 跟路由 -->
		<router-view v-if="this.userInfo" class="root-rooter-it project-router-content-wrap"></router-view>

		<!-- project浮层 -->
		<projectModal ref="projectModal" style="height:auto"></projectModal>

	</div>
</template>
<script type="text/javascript">
	
	import projectLeftMenu from './project-left-menu';
	import projectModal  from 'components/project-modal/index';

	export default{
		components:{
			projectLeftMenu ,
			projectModal
		},

		data(){
			return {
				userInfo:''
			}
		},

		created(){
			this.getUserInfo();
		},
		mounted(){

		},

		methods:{
			getUserInfo(){
				this.$ajax({
					url:'/project/t_project/getUserInfo',
					success(data){
						this.userInfo = data ;
						this.$diff ;
					}
				})
			},
			openProjectModal( ...vals ){
				let projectModal = this.$refs.projectModal.component ;
				projectModal.open( ...vals )
			}
		}
	}
</script>
<style type="text/css">
	#project{
		width: 100%;height: 100%;
		min-width: 1200px;
		min-height: 500px;
		position: relative;
		.project-left-menu-wrap{
			background: white;
			position: absolute;
			width: 200px;
			left: 0;
			top:0;bottom: 0;
		}
		.project-router-content-wrap{
			position: absolute;
			left: 201px;right: 0;
			top: 0;bottom: 0;
			overflow-y: auto;
		}
	}
</style>