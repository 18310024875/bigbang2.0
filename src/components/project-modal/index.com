<template>
	
	<projectModal 
		v-if="this.detail" 
		:type="this.type"
		:detail="this.detail">	
	</projectModal>

</template>
<script type="text/javascript">
		
	import projectModal from './project-modal' ;

	var CALLBACK ; ;

	export default{
		components:{
			projectModal
		},

		data(){
			return {
				detail:'',
				type:'',
			}
		},

		methods:{
			open( detail , callback ){
				let T = this.$tool ;
				let U = APP.userInfo ;
				let bd = T.time();
				let ed = T.time()+86400000 ;
				CALLBACK = callback ;
				if( !detail ){
					this.type="add";
					this.detail = {
						name:'', // 项目名称
						description:'', // 描述
						chargePerson: { ...U },
						beginDate: T.time( bd ,'YYYY-MM-DD'),
						endDate:   T.time( ed ,'YYYY-MM-DD'),
						creatorMemberId: U.memberId, // 创建人id(默认自己)
						participants:[],   // 参与人list
						catalogueId: 0 ,     // 项目分类
						isPublic:0
					}
				}else{
					this.type="update";
					this.detail = detail ;
				};
				this.$diff ;
				
			},
			close(){
				CALLBACK ? CALLBACK() : null ;
				CALLBACK='';
				this.detail='';
				this.$diff ;
			}
		}
	}
</script>
<style lang="less">
	.project-modal-index{

	}
</style>