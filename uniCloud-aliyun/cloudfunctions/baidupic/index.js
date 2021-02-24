'use strict';
let client = require('baidu')
const db = uniCloud.database()
exports.main = async (event, context) => {
	return new Promise(function(resolve){
		client.imageCensorUserDefined(event.pic, 'url').then(async function(data) {
		    if(data.conclusion=="合规"){
			
				const collection = db.collection('piclist')
				const res = await collection.add({'md5':event.md5, 'name': event.name, 'size': event.size, 'url': event.pic, 'time': Date.now()})
					
				resolve({'result':'ok','url':event.pic})
			}else{
				uniCloud.deleteFile({
					fileList:[event.pic]
				}).then((res)=>{
					resolve({'result':'no'})
				})
			}
			//resolve(data)
		}, function(e) {
		    console.log(e)
			return "error"
		});
	})
};