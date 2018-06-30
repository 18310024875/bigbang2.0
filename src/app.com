<template>
	<!-- #5ca1ff -->
	
	<router-view class="root-rooter-it" v-if="this.userInfo"></router-view>

</template>
<script type="text/javascript">

	export default{
		data(){
			return {
				name:111,
				userInfo:''
			}
		},

		created(){
			this.getUserInfo();
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
			}
		}
	}

</script>