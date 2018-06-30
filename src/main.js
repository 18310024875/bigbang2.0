import $ from 'jquery';

import tool from 'g/tool';

import Com from 'com';

import 'assets/css/public.less';

window.$ = $ ;
Com.component.prototype.$ajax = tool.ajax ;
Com.component.prototype.$ui   = tool.ui ;
Com.component.prototype.$tool = tool ;

// 全局组件
import depTree from 'components/select-man/dep-tree'; Com.globalComponent('depTree',depTree);
import gButton from 'components/common/g-button'; Com.globalComponent('gButton',gButton);
import gAvatar from 'components/common/g-avatar'; Com.globalComponent('gAvatar',gAvatar);

// 全局选人组件 
import selectMan from 'components/select-man/index.com';
window.selectMan = window.S = new Com({ ...selectMan }).$mount('#app');


import app from 'src/app';
import routes from 'src/app.routes';

window.APP = new Com({
	...app ,
	
	routes ,
	defaultUrl:'/project?projectFlagKey=masterJoin',

}).$mount('#app');




[
	{
		avatar:'http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/14330/3256827/201806/12/1528813226fUuT.jpg',
		userName: '李楠楠',
		memberId: '3256827'
	},
	{
		avatar:'http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/14330/3256831/201806/12/1528813228UHRH.jpg',
		userName: '罗银妍',
		memberId: 3256831
	}
]


