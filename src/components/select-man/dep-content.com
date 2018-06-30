<template>
	<div class="gm-dep-content">

		<depTree style="height:auto" :isRoot="true"></depTree>

	</div>
</template>
<script type="text/javascript">

	export default{

	}

</script>
<style lang="less">
	.gm-dep-content{
		width:100%;height:100%;
		position: relative ;
		overflow-x: hidden;
		overflow-y: auto;
	}
</style>