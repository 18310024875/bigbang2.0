const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const base = require('./base');

const ENV = process.env.NODE_ENV ;
console.log('\n----------------\n',ENV,'\n----------------\n')

module.exports = merge( base , {
    devtool: '#eval-source-map' ,
    devServer: {
        host: "0.0.0.0",
        port: 5555,
        quiet: false,
        stats: {
            colors: true
        },
        // proxy: {
        //     '/': {
        //         target: 'http://123.103.9.204:6058',
        //         secure: false, //是否验证SSl证书
        //         changeOrigin: true //如果设置为true,那么本地会虚拟一个服务端接收你的请求并代你发送该请求，这样就不会有跨域问题了
        //     }
        // },
        compress: true, //gzip压缩
        publicPath: 'http://localhost:4000/',
        disableHostCheck: true,
        contentBase: path.resolve(__dirname,'..'), //默认情况下，webpack-dev-server会从项目的根目录提供文件，可以通过此选项设置文件的目录名
        historyApiFallback: true, //当设置为true时，访问所有服务器上不存在的文件，都会被重定向到/，也就是index.html文件
    }
});



