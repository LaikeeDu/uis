'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	const collection = db.collection('piclist')
	const res = await collection.where({'md5':event.md5}).field({'url':true}).get()
	return res
};
