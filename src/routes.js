// 必须挂载跟组件 等于跟组件不许存在 router-view ;

import project from 'components/project/project';
import projectType from 'components/project-type/project-type';

export default [
	{
		path:  'projectType',
		option: projectType
	}
]