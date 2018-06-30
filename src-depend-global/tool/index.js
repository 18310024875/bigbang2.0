import ajax from './ajax';
import md5  from './md5' ;
import time from './format-time';
import friendlyTime from './friendly-time';
import iscroll from './iscroll-listen';
import echarts from './echarts.min.js';
import swiper  from './swiper/swiper';import './swiper/swiper.css';
import htmlDecode   from './html-decode';
import filterEmoji  from './filter-emoji';
import filterFace from './filter-face';
import ui from '../ui';

export default {
	ajax,
	md5,
	time,
	friendlyTime,
	iscroll,
	swiper,
	echarts,
	htmlDecode ,
	filterEmoji ,
	filterFace ,
	ui ,
	clone:( data )=>{
		return JSON.parse( JSON.stringify(data) )
	},
	type:( x )=>{
		var str = Object.prototype.toString.call( x ).slice(8, -1) ;
		return str.toLocaleLowerCase();
	},
	trigger:( eName , dom )=>{
		try{
			var event = document.createEvent('Event');
				event.initEvent( eName , true, true);
				dom.dispatchEvent(event);
		}catch(e){ console.log(e) };
	},
	getLocationParams:()=>{
		let url = location.href ;
		let obj = {} ;
		let arr = url.match(/\w+=[\w-%]*/g);
			arr.map( v=>{
				let val = v.match(/(\w+)=([\w-%]*)/) ;
				obj[val[1]]=val[2];
			})
		return obj ;
	}
}