'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	const collection = db.collection('piclist')
	const res = await collection.add({'md5':event.md5, 'name': event.name, 'size': event.size, 'url': event.pic, 'time': Date.now()})
	return res
};
