// 过滤Emoji
export default function( str ){
	// var ranges = [
	//     '\ud83c[\udf00-\udfff]', 
	//     '\ud83d[\udc00-\ude4f]', 
	//     '\ud83d[\ude80-\udeff]'
	// ];
	// return str.replace(new RegExp(ranges.join('|'), 'g'), '');

	str = str.replace(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g, "");
	str = str.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDC80-\uDEFF]/g, "");
	return str ;
};