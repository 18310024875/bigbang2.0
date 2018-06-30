<template>
	<div id="project">

		<projectLeftMenu class="project-left-menu-wrap"></projectLeftMenu>

		<router-view class="project-router-content-wrap"></router-view>

	</div>
</template>
<script type="text/javascript">
	
	import projectLeftMenu from './project-left-menu';

	export default{
		components:{
			projectLeftMenu
		},
		data(){

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
		}
	}
</style>