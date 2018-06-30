<template>
	<div class="gm-dep-tree">
		<!-- 头部 -->
		<div v-if="!this.isRoot" class="gm-dep-tree-head" @click="this.openChildrenFun">
			<div class="part1">
				<div class="icon-play3 close" :class="{openChildren: this.openChildren }"></div>
			</div>
			<div class="part2">
				{{this.deptName||''}}
			</div>
		</div>
		<!-- 儿子容器 -->
		<ul 
			class="gm-dep-tree-children" 
			v-if="this.mountedChildren"
			v-show="this.openChildren">

			<li v-for="(item,k) in this.list">
				<!-- 部门 , 递归自身-->
				<depTree 
					v-if="item.type==1" 
					:deptName="item.deptName" 
					:pid="item.deptId">
				</depTree>

				<!-- 人员 -->
				<manItem 
					v-if="item.type==0" 
					:useInDepTree="true" 
					:avatar="item.avatar" 
					:name="item.userName" 
					:checked="item.checked"
					@click="this.addMan(item)">
				</manItem>
			</li>

			<!-- 加载状态 -->
			<div class="gm-load-status" v-if="this.loadStatus!='over'">
				<div v-show="this.loadStatus=='loading'" class="loading rot_animate icon-spinner2"></div>
				<div v-show="this.loadStatus=='success'" class="success" @click="this.loadMore">加载更多</div>
				<div v-show="this.loadStatus=='nodata'"  class="nodata">暂无数据</div>
				<div v-show="this.loadStatus=='error'"   class="error"   @click="this.getList">加载失败 <span>&nbsp;重新加载</span></div>
			</div>

		</ul>
	</div>
</template>
<script type="text/javascript">
	
	/*
		props -->
			isRoot 是否显示部门头部 , 跟组件不需要显示
			pid   父级部门id ;
			deptName  部门名称
	*/


	import manItem from './man-item';

	export default{
		components:{
			manItem
		},

		data(){
			return {
				loadStatus:'',
				openChildren:false,
				mountedChildren:false,
				pageNo: 1 ,
				list:[]
			}
		},

		created(){
			if( this.isRoot ){
				this.openChildren=true ;
				this.mountedChildren=true;
			}
		},

		mounted(){
			if( this.isRoot ){
				this.getList()
			}
		},

		methods:{
			openChildrenFun(){
				this.openChildren = !this.openChildren ;
				this.$diff ;
				if( this.openChildren && this.mountedChildren==false ){
					this.mountedChildren=true ;
					this.getList();
				}
			},
			getList(){
				this.loadStatus = 'loading';
				this.$diff ;

				let pid = this.pid||'' ;
				this.$ajax({
					url:'/project/team/deptUsers',
					data:{
						pid:pid,
						pageNum:this.pageNo,
						pageSize:100
					},
					success(data){
						!data ? data=[] : null ;

						// 加载状态
						if( data.length==0 ){
							this.pageNo==1 ? this.loadStatus='nodata' : this.loadStatus='over' ;
						}else if( data.length<100){
							this.loadStatus='over' ;
						}else{
							this.loadStatus='success'
						}

						let selectedMans = window.selectMan.selectedMans ;
						let mids = selectedMans.map( v=>+v.memberId );
						// 赋值
						data = data.map((v)=>{
							let obj = { 
								type:    v.type ,
								$component: this ,
								...v.value ,
							};
							obj.type==0 ? obj.checked=mids.has(+obj.memberId) : null ;

							// 加入根节点
							obj.type==0 ? window.selectMan.tabDepMans.push( obj ) : null ;
							
							return obj ;
						});
						this.list = this.list.concat(data) ;
						this.$diff ;
					},
					error(){
						this.loadStatus='error';
						this.$diff ;
					}
				})
			},
			loadMore(){
				this.pageNo++ ;
				this.getList();
			},
			addMan(item){
				if( item.checked ){
					window.selectMan.delMan( item ) ;
				}else{
					window.selectMan.addMan( item ) ;
				};
			}
		}
	}
</script>
<style lang="less">
	.gm-dep-tree{
		.gm-load-status{
			width: 100%;
			height: 40px;
			overflow:hidden;
			&>div{
				text-align: center;
				height: 40px;
				line-height: 40px;
			}
			&>.loading{
				color: #5ca1ff ;
				font-size: 16px;
			}
			&>.success{
				cursor: pointer;
				font-size: 12px;
				color: #666;
			}
			&>.nodata{
				font-size: 12px;
				color: #666;
			}
			&>.error{
				color: #666;
				font-size: 12px;
				cursor: pointer;
				&>span{
					color: #5ca1ff
				}
			}
		}
		&>.gm-dep-tree-head{
			position: relative;
			height: 38px;
			line-height: 38px;
			padding-left: 20px;
			cursor: pointer;
			&>.part1{
				position: absolute;
				width: 20px;
				left: 0;
				top: 0;
				bottom: 0;
				font-size: 12px;
				&>div{
					width: 12px;
					height: 12px;
					transition: all 0.3s ;
					margin-top: 12px;
				}
				&>div.openChildren{
					transform: rotate(90deg);
				}
			}
			&>.part2{
				font-size: 13px;
			}
		}
		&>.gm-dep-tree-children{
			padding-left: 20px;
		}
	}
</style>