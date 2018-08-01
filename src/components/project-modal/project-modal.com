<template>
	<div class="project-modal-mask">

		<div class="content">
			<div class="pm-head">
				<span v-show="this.type=='add'">创建项目</span>
				<span v-show="this.type=='update'">修改项目</span>
				<div class="icon-cross" @click="this.cancel"></div>
			</div>

			<div class="pm-body">
				<div class="init">
					<div class="part1">
						<input 
							type="text" 
							maxlength="50" 
							placeholder="请输入项目名称(不超过50字)" 
							:value=" this.detail.name "
							@input="this.changeInput('name')"/>
					</div>
					<div class="part2">
						<input 
							type="text" 
							maxlength="100" 
							placeholder="+ 添加项目描述"
							:value=" this.detail.description "
							@input="this.changeInput('description')"/>
					</div>
					<div class="part3">
						<table>
							<tr>
								<th><div class="in-th">负责人</div></th>
								<th><div class="in-th">开始时间</div></th>
								<th><div class="in-th">截止时间</div></th>
								<th><div class="in-th">是否公开</div></th>
							</tr>
							<tr>
								<td>
									<div 
										class="in-td" 
										style="min-width: 150px;padding:0 10px;"
										@click="this.setChargeMan">
										<gAvatar 
											style="display:inline-block;vertical-align:middle;height:30px" 
											:avatar="this.detail.chargePerson.avatar" 
											:name="this.detail.chargePerson.userName">
										</gAvatar>
										<div style="display:inline-block;vertical-align:middle;margin-left:5px">
											{{this.detail.chargePerson.userName}}
										</div>
									</div>
								</td>
								<td>
									<div class="in-td">
										<input 
											type="date" 
											:value="this.detail.beginDate" 
											@change="this.changeInput('beginDate')"/>
									</div>
								</td>
								<td>
									<div class="in-td">
										<input 
											type="date" 
											:value="this.detail.endDate" 
											@change="this.changeInput('endDate')"/>
									</div>
								</td>
								<td>
									<div class="in-td" style="min-width: 120px">
										<select 
											:value="this.detail.isPublic" 
											@change="this.changeInput('isPublic')">
											<option value="1">公开</option>
											<option value="0">不公开</option>
										</select>
									</div>
								</td>
							</tr>
						</table>
					</div>
					<div class="part4">
						<p>参与人:</p>
						<div class="join-mans">
							<gAvatar 
								v-for="(item,k) in this.detail.participants" 
								style="float:left;margin:5px;"
								:size="'30px'" 
								:avatar="item.avatar" 
								:name="item.userName">
							</gAvatar>
							<div class="add-it" style="margin:5px;" @click="this.setJoinMan"> + </div>
						</div>
					</div>
					<div class="part5">
						<span>项目分类:</span>
						<select class="typeList">
							
						</select>
					</div>

				</div>
			</div>

			<div class="pm-foot">
				<gButton class="cancel" 
					:width="'100px'" :str="'取消'" :borderColor="'#dddee1'" :backgroundColor="'white'" :color="'#495060'"
					@click="this.cancel">		
				</gButton>
				<gButton class="submit" 
					:width="'100px'" :str="'确定'"
					@click="this.submit">
				</gButton>
			</div>
		</div>

	</div>
</template>
<script type="text/javascript">
	
	export default{
		components:{

		},

		data(){
			return {
				typeList:[]
			}
		},

		mounted(){
			this.getTypeList()
		},

		methods:{
			cancel(){
				this.$parent.close();
			},
			submit(){
				let say = this.$ui ;
				let d = this.detail ;
					d.name=d.name.trim();

				if( !d.name ){
					say.no('项目名称不能为空');
					return ;
				};
				let data={
					    "name": d.name ,
					    "description": d.description ,
					    "isPublic": d.isPublic ,
					    "beginDate": Date.parse(new Date(d.beginDate)),
					    "endDate":   Date.parse(new Date(d.endDate)),
					    "source": 1 ,          			   // 1-web , 2-app
					    "catalogueId": d.catalogueId ,     // 项目分类
					    "chargeMemberId": d.chargePerson.memberId ,   // 负责人id
					    "partMemberIds": d.participants.map( v=>{ return v.memberId })
					};

				let url ;
				if( this.type=='add' ){
					url = '/project/t_project/add';
				}else{
					url = '/project/t_project/update';
					data.id = d.id ;
				};
				//ajax
				this.$ajax({
					type:'post',
					contentType:'json',
					url:url,
					data:data,
					success( data ){
						say.yes('操作成功');
						setTimeout(()=>{
							this.$parent.close();
						},1000)
					}
				});
			},
			getTypeList(){
				this.$ajax({
					url:'/project/projectCatalogue/list',
					success(data){
						data ? this.typeList=data : null ;
						let html ='';
						data.map( v=>{html+= `<option value="${v.id}">${v.name}</option>`});
						$('.typeList').html(html).val(this.detail.catalogueId).on('change',(e)=>{
							this.detail.catalogueId = e.target.value ;
						})
					}
				})
			},
			changeInput(type,e){
				var val = e.target.value ;
				this.detail[ type ] = val ;
			},
			setChargeMan(){
				let selected = [this.detail.chargePerson] ;
				window.selectMan.open(selected , true , (list)=>{
					this.detail.chargePerson = list[0];
					this.$diff ;
				})
			},
			setJoinMan(){
				let selected = [...this.detail.participants] ;
				window.selectMan.open(selected , false , (list)=>{
					this.detail.participants = list ;
					this.$diff ;
				})
			}
		}
	}
</script>
<style lang="less">
	/*5ca1ff*/
	.project-modal-mask{
		position: fixed;
		top: 0;bottom: 0;
		left: 0;right: 0;
		background: rgba(0,0,0,0.5);
		&>.content{
			width: 49%;
			height: 68%;
			min-width: 750px;
			min-height: 510px;
			background: white;
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			transition: opacity 0.5s;
			.pm-head{
				position: relative;
				height: 40px;
				line-height: 40px;
				background: #F2F3F4;
				padding: 0 20px;
				&>span{
					font-size: 13px;
					color: #666;
				}
				&>.icon-cross{
					width: 40px;
					line-height: 40px;
					height: 40px;
					text-align: center;
					color: #999;
					font-size: 12px;
					position: absolute;
					right: 2px;top: 0;
					opacity: 0.6;
					cursor: pointer;
				}
			}
			.pm-body{
				position: absolute;
				width: 100%;
				left: 0;
				top: 40px;
				bottom: 60px;
				overflow-y: auto;
				.init{
					padding: 0 20px;
				}
			}
			.pm-foot{
				position: absolute;
				width: 100%;
				left: 0;bottom: 0;
				height: 60px;
				border-top: 1px solid #dddee1 ;
				.cancel{
					position: absolute;
					right: 140px;top: 12px;
				}
				.submit{
					position: absolute;
					right: 20px;top: 12px;
				}
			}
		}
	}
	.project-modal-mask .pm-body{
		.part1{
			margin-top: 15px;
			display: inline-block;
			width: 330px;
			height: 32px;
			line-height: 1.5;
			padding: 4px 7px;
			font-size: 12px;
			border: 1px solid #dddee1;
			border-radius: 4px;
			color: #495060;
			background-color: #fff;
			background-image: none;
			position: relative;
			cursor: text;
			input{
				width: 100%;
				height: 100%;
			}
		}
		.part2{
			margin-top: 20px;
			display: inline-block;
			width: 500px;
			height: 32px;
			line-height: 1.5;
			padding: 4px 7px;
			font-size: 12px;
			/*border: 1px solid #dddee1;*/
			border-radius: 4px;
			color: #495060;
			background-color: #fff;
			background-image: none;
			position: relative;
			cursor: pointer;
			input{
				width: 100%;
				height: 100%;
			}
		}
		.part3{
			margin-top: 25px;
			table{
				width: 100%;
				font-size: 12px;
				text-align: center;
				th{
					background: #f5f5f5;
					border: 1px solid #eeeeee;
					&>div{
						height: 30px;
						line-height: 30px;
					}
				}
				td{
					border: 1px solid #eeeeee;
					&>div{
						cursor: pointer;
						height: 60px;
						line-height: 60px;
						select{
							color: #495060;
							border: none;
							outline: none;
							background: white;
						}
						input[type=date]{
							color: #495060;
							margin-left: 55px;
						}
					}
				}
			}
		}
		.part4{
			margin-top: 20px;
			&>p{
			    font-size: 13px;
			    line-height: 25px;
			    padding-bottom: 3px;
			}
			.join-mans{
				overflow: hidden;
			}
			.add-it{
				float: left;
				cursor: pointer;
			    width: 30px;
			    height: 30px;
			    line-height: 25px;
			    border-radius: 50%;
			    text-align: center;
			    font-size: 20px;
			    border: 1px dashed #dddee1;
			    color: #dddee1;
			}
		}
		.part5{
			margin-top: 20px;
			&>span{
			    font-size: 13px;
			    line-height: 25px;
			}
			select{
				outline: none;
				background: white;
				margin-left: 10px;
				color: #495060;
				vertical-align: middle;
				border-color: #ddd;
			}
		}
	}

</style>