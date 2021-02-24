'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	//const fs = require("fs")
	let result = await uniCloud.uploadFile({
	    cloudPath: event.filename,
	    fileContent: event.filedata
	});
	//返回数据给客户端
	return result
};
