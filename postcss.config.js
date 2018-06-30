// const px2rem = require('postcss-px2rem')
module.exports = {  
    plugins: {  
        'autoprefixer': {
            browsers: [
                'last 3 versions',
                'ie >= 10',
                'ie_mob >= 10',
                'ff >= 30',
                'chrome >= 34',
                'safari >= 6',
                'opera >= 12.1',
                'ios >= 6',
                'android >= 4.4',
                'bb >= 10',
                'and_uc 9.9'
            ]
        },
        // 'postcss-px2rem':{
        //     remUnit:37.5,
        //     threeVersion:false,
        //     remVersion:true,
        //     baseDpr:2,
        //     remPrecision:6,
        // },
    }  
}  