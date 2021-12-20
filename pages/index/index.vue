<template>
	<view class="content">
		<view class="tips">
			<view>1.严禁违法使用</view>
			<view>2.CTRL+V可粘贴图片，支持多图上传，最大100M</view>
			<view>3.数据持久化存储，不删除，提供JS接口上传</view>
		</view>
		<view id="drop-area" :class="'btn-list '+ (dropActive ? 'drop-active' : '')">
			<text style="margin-top: 40px;display: block;">拖拽文件至此自动上传</text>
		</view>
			<button type="primary" @click="upload()">上传文件</button>
	
		<view :class="{'my-tabs':true,'space-between':formatBe}">
			<view  v-for="(item,index) in getModelData" :key="index" :class="{'tab-item':true,'active':activeIndex==index}" @tap="tap(index)">
				{{item.label}}
			</view>
		</view>
		<view v-show="activeIndex==0">
			<view v-for="(item,i) in picurl" :key="i" class="picurl">{{item}}</view>
		</view>
		<view v-show="activeIndex==1">
			<view v-for="(item,i) in picurl" :key="i" class="picurl">&lt;img src=&quot;{{item}}&quot; /&gt;</view>
		</view>
		<view v-show="activeIndex==2">
			<view v-for="(item,i) in picurl" :key="i" class="picurl">[img]{{item}}[/img]</view>
		</view>
		<view v-show="activeIndex==3">
			<view v-for="(item,i) in picurl" :key="i" class="picurl">![pic]({{item}})</view>
		</view>
		<view v-show="activeIndex==4">
			<view v-for="(item,i) in picurl" :key="i" class="picurl">[![pic]({{item}})]({{item}})</view>
		</view>
    <view class="footer"><text>copyright &copy; Img.Application.Pub</text></view>
	</view>
</template>

<script>
	import SparkMD5 from '@/node_modules/spark-md5/spark-md5.min.js';
	export default {
		data() {
			return {
				dropActive:false,
				picurl:[],
				activeIndex: 0,
				modelData:[
					{'label':'URL'},
					{'label':'HTML'},
					{'label':'BBCODE'},
					{'label':'Markdown'},
					{'label':'Markdown with link'},
				],
				md5: []
			}
		},
		computed:{
			getModelData(){
				return this.modelData
			},
			formatBe(){
				return this.modelData
						?this.modelData.length>4?true:false
						:false
			}
		},
		methods: {
			dropEvent(e) {
				        this.dropActive = false
				        e.stopPropagation()
				        e.preventDefault()
						console.log(e.dataTransfer.files)
						for(let i = 0; i < e.dataTransfer.files.length; i++){
							this.upload(e.dataTransfer.files[i])
						}
				        
			},
			tap(index){
				if(index!==this.activeIndex)this.$emit("change",index);
				this.activeIndex=index;
			},
			/**
			 * @name 初始化activeIndex
			 */
			initActive(){
				this.activeIndex=this.initIndex||this.activeIndex
			},
			calculate(file,i){  //console.log(file)
			return new Promise((resolve, reject) => {
			    var fileReader = new FileReader(),  
			        blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice,  
			        chunkSize = 2097152,  
			        // read in chunks of 2MB  
			        chunks = Math.ceil(file.size / chunkSize),  
			        currentChunk = 0,  
			        spark = new SparkMD5();  
					let that = this;
			     fileReader.onload = function(e) {  
			        spark.appendBinary(e.target.result); // append binary string  
			        currentChunk++;  
			  
			        if (currentChunk < chunks) {  
			            loadNext();  
			        }  
			        else {  
			            let a = spark.end();//console.log(a)
						that.md5[i] = a;
						resolve(a)
						return a
			        }  
			    };  
			  
			    function loadNext() {  
			        var start = currentChunk * chunkSize,  
			            end = start + chunkSize >= file.size ? file.size : start + chunkSize;  
			  
			        fileReader.readAsBinaryString(blobSlice.call(file, start, end));  
			    };  
			  
			    loadNext();  
			})
			} ,
			blobToFile (theBlob) {
			      return new window.File([theBlob], name, {type: 'image/png'})
			},
			upload(file) {
				let that = this;
				this.md5 = [];
				new Promise(async (resolve, reject) => {
					let options = []
					console.log(file)
					if(typeof(file)!='undefined'){
						name = Date.now()+'.png'
						let f = this.blobToFile(file, name)
						var size = f.size
						options.push({
							filePath: file,
							cloudPath: name,//Date.now() + '.' + ext,
							size: size
						})
						console.log(f)
						await this.calculate(f, 0).then(res=>{
							that.md5[0] = res
						})
						resolve(options)
					}else{
						
						uni.chooseImage({
							count: 5,
							success: async res => {
								let ext
								let path = '';
								let name
								// #ifdef H5
							
								for(let i in res.tempFilePaths){
									path = res.tempFilePaths[i]
									//console.log(res)
									var size = res.tempFiles[i].size
									ext = res.tempFiles[i].name.split('.').pop()
									name = res.tempFiles[i].name.split('/').pop()
									options.push({
										filePath: path,
										cloudPath: name,//Date.now() + '.' + ext,
										size: size
									})
									await this.calculate(res.tempFiles[i], i).then(res=>{
										that.md5[i] = res
									})
								}
									resolve(options)
								// #endif
								
								
								// #ifndef H5
								for(let i in res.tempFilePaths){
									path = res.tempFilePaths[i]
									var size = res.tempFiles[i].size
									ext = res.tempFiles[i].name.split('.').pop()
									name = res.tempFiles[i].name.split('/').pop()
									uni.getImageInfo({
										src: path,
										success(info) {
											plus.io.getFileInfo({
												filePath: res.tempFilePaths[0],  
												digestAlgorithm: 'md5',  
												success: res => {  
													options.push({
														filePath: path,
														cloudPath: name,//Date.now() + '.' + info.type.toLowerCase(),
														md5: res.digest,
														size: size
													})
												}  
											})  	
											
										},
										fail(err) {
											reject(new Error(err.errMsg || '未能获取图片类型'))
										}
									})
									}
									resolve(options)
								// #endif
							},
							fail: () => {
								reject(new Error('Fail_Cancel'))
							}
						})
					}
							
							/*
							
							const path = res.tempFilePaths[0]
							let ext
							// #ifdef H5
							ext = res.tempFiles[0].name.split('.').pop()
							const options = {
								filePath: path,
								cloudPath: Date.now() + '.' + ext
							}
							resolve(options)
							// #endif
							// #ifndef H5
							uni.getImageInfo({
								src: path,
								success(info) {
									const options = {
										filePath: path,
										cloudPath: Date.now() + '.' + info.type.toLowerCase()
									}
									resolve(options)
								},
								fail(err) {
									reject(new Error(err.errMsg || '未能获取图片类型'))
								}
							})
							// #endif
							*/
				}).then((options) => {
					uni.showToast({
						title: '文件上传中...',
						icon: 'loading'
					})
					let arr = []
					console.log(options)
					for(let i in options){
						console.log(options[i])
						console.log(typeof(options[i].md5)=='undefined'?that.md5:'')
						uniCloud.callFunction({
						    name: 'get',
						    data: { md5: typeof(options[i].md5)=='undefined'?that.md5[i]:options[i].md5 }
						  }).then(res => {
							  if(res.result.data.length>0){
								  that.picurl.push(res.result.data[0].url)
								  
								  
							  }else{
								  uniCloud.uploadFile({
								  	//url:'https://9b24efc2-400e-4e7d-8af1-7fc2911fbfcc.bspapp.com/http/upload',
								  	...options[i],
								  	onUploadProgress: function(progressEvent) {
								  	  console.log(progressEvent);
								  	  var percentCompleted = Math.round(
								  		(progressEvent.loaded * 100) / progressEvent.total
								  	  );
								  	  }
								  }).then(res=>{
								  	/*uni.showModal({
								  		content: '图片上传成功，fileId为：' + res.fileID,
								  		showCancel: false
								  	})*/
								  	that.picurl.push(res.fileID)
								  	uniCloud.callFunction({
								  	    name: 'baidupic',
								  	    data: { pic: res.fileID, 'name':options[i].cloudPath,'size':options[i].size,'md5':that.md5[i] }
								  	  }).then(res => {
								  		  console.log(res)
										  /*if(res.result.result=="ok"){
											  uniCloud.callFunction({
											      name: 'add',
											      data: {'name':'','size':'','url':res.fileID,'md5':that.md5[i]}
											    })
										  }*/
								  	  });
								  });
							  }
							  
						  });
						
					}
					return arr
				}).then(res => {
					uni.hideLoading()
					//console.log(res);
					//for(let i in res){
					//}
				}).catch((err) => {
					uni.hideLoading()
					console.log(err);
					if (err.message !== 'Fail_Cancel') {
						uni.showModal({
							content: `图片上传失败，错误信息为：${err.message}`,
							showCancel: false
						})
					}
				})
			},
			paste (event) {
				let that = this;
			    console.log(event);
			    var isChrome = false;
			    if (event.clipboardData || event.originalEvent) {
			        //某些chrome版本使用的是event.originalEvent
			        var clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
			        if(clipboardData.items){
			            // for chrome
			            var  items = clipboardData.items,
			                len = items.length,
			                blob = null;
			            isChrome = true;
			            for (var i = 0; i < len; i++) {
			                console.log(items[i]);
			                if (items[i].type.indexOf("image") !== -1) {
			                    //getAsFile() 此方法只是living standard firefox ie11 并不支持
			                    blob = items[i].getAsFile();
			                }
			            }
			            if(blob!==null){
			                var blobUrl=URL.createObjectURL(blob);
							console.log(blobUrl) ;
			                //blob对象显示
			                //document.getElementById("imgNode").src=blobUrl;
			                //var reader = new FileReader();
			                //base64码显示
			               /* reader.onload = function (event) {
			                    // event.target.result 即为图片的Base64编码字符串
			                    var base64_str = event.target.result;
						
			                    document.getElementById("imgNode").src=base64_str;
			                }
			                reader.readAsDataURL(blob);*/
							//var fd = new FormData(document.forms[0]);
			                //fd.append("the_file", blob, 'image.png');
							that.upload(blobUrl);
			                //创建XMLHttpRequest对象
			            }
			        }
			    }
			}
		},
		created() {
			this.initActive()
		},
		mounted() {
			    document.addEventListener('paste', this.paste, true)
				let dropArea = document.getElementById('drop-area')
					    dropArea.addEventListener('drop', this.dropEvent, false)
					    dropArea.addEventListener('dragleave', (e) => {
					      e.stopPropagation()
					      e.preventDefault()
					      this.dropActive = false
					    })
					    dropArea.addEventListener('dragenter', (e) => {
					      e.stopPropagation()
					      e.preventDefault()
					      this.dropActive = true
					    })
					    dropArea.addEventListener('dragover', (e) => {
					      e.stopPropagation()
					      e.preventDefault()
					      this.dropActive = true
					    })
		},
		destroyed() {
		  document.removeEventListener("paste", this.paste, true);
		},
	}
</script>

<style lang='scss'>
	#drop-area{
		height:100px;
		background-color:#fff;
		border:1px solid red;
		text-align: center;
	}
	.drop-active{
		background-color: rgba(231,234,246,0.8)!important;
	}
	.content {
		padding-bottom: 10px;
	}

	.title {
		font-weight: bold;
		text-align: center;
		padding: 20px 0px;
		font-size: 20px;
	}

	.tips {
		color: #999999;
		font-size: 14px;
		padding: 20px 30px;
	}

	.btn-list {
		padding: 0px 0px;
	}

	.btn-list button {
		margin-bottom: 20px;
	}

	.upload-preview {
		width: 100%;
	}
	.picurl{
		user-select: text;
	    margin: 10px;
	    padding: 10px;
	    background-color: #e1e1e1;
	    color: #373737;
		font-size: 12px;
	}
	
	.footer{
		position: fixed;
		width: 100%;
		bottom: 0;
		text-align: center;
	}
	.footer text{
		text-align: center;
	}
	.my-tabs {
		height: 30px;
		font-size: 10px;
		display: flex;
		box-sizing: border-box;
		border-top: 2upx solid #dddddd;
		border-bottom: 2upx solid #dddddd;
		min-width: 100%;
		overflow-x: auto;
		
		.tab-item{
			line-height: 20px;
			padding: 5upx;
			min-width: 100upx;
			text-align: center;
		}
		.tab-item.active{
			position: relative;
			color: #3682FF;
		}
		.tab-item.active::after{
			content: "";
			position: absolute;
			bottom: 0;
			left:50%;
			transform: translateX(-50%);
			width: 100%;
			border-bottom: 4upx solid #3682FF;
			animation: tab ease 1 1.5s;
		}
	}
	.my-tabs.space-between{
		justify-content: space-between;
	}
	@keyframes tab{
		0%{width: 100%}
		50%{width: 90%}
		100%{width: 100%}
	}	
	
</style>
