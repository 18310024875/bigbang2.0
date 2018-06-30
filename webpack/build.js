const webpack = require('webpack');
const base = require('./base');
const merge = require('webpack-merge');

const ENV = process.env.NODE_ENV ;
console.log('\n----------------\n',ENV,'\n----------------\n')

module.exports = merge( base , {
    devtool:false,
    plugins:[
	    new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
	    }),
    	new webpack.optimize.UglifyJsPlugin({minimize: true, sourceMap: false})
    ]
});
