<template>

	<div class="g-input">
		<input type="text" />
	</div>

</template>
<script type="text/javascript">
	
	export default{
		props:{},
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
	
</style>