<template>
	
		<selectMan class="select-man-root"
			v-if="this.openIt"
			:selectedMans="this.selectedMans">
		</selectMan>

</template>
<script type="text/javascript">
	
	import selectMan from './select-man';

	export default{
		components:{
			selectMan
		},

		data(){
			return {
				openIt:false,

				tabDepMans:[],  // tabDep所有部门下的成员
				tabManMans:[],  // tabMan所有成员

				selectedMans:[]
			}
		},

		methods:{
			open( selectedMans=[] , callback=function(){} ){
				this.callback = callback ;
				this.tabDepMans=[];
				this.tabManMans=[];
				this.selectedMans=selectedMans ;
				this.openIt=true;
				this.$diff ;
			},
			close(){
				this.openIt=false ;
				this.$diff ;
			},

			findMansChecked( item ){
				let mids = this.selectedMans.map( v=>+v.memberId );

				this.tabDepMans.map( v=>{
					let val ;
					mids.has( +v.memberId ) ? val=true : val=false ;
					if( v.checked!=val ){
						// debugger
						v.checked=val ;
						v.$component.$diff ;
					}
				})
				this.tabManMans.map( v=>{
					let val ;
					mids.has( +v.memberId ) ? val=true : val=false ;
					if( v.checked!=val ){
						// debugger
						v.checked=val ;
						v.$component.$diff ;
					}
				})
			},
			addMan( item ){
				this.selectedMans.push( item ) ;
				this.selectedMans = this.selectedMans.concat([]) ;
				this.$diff ;

				this.findMansChecked();
			},
			delMan( item ){
				for(let i=0 ; i<this.selectedMans.length ; i++){
					let each = this.selectedMans[i] ;
					if( each.memberId==item.memberId ){
						this.selectedMans.splice(i,1);
						i--;
					}
				}
				this.selectedMans = this.selectedMans.concat([]) ;
				this.$diff ;

				this.findMansChecked();
			},
			clearAll(){
				this.selectedMans=[];
				this.$diff ;

				this.findMansChecked();
			}
		}
	}
</script>
<style lang="less">
	.select-man-root{
		position:absolute;
		left:0;top:0;
	}
</style>