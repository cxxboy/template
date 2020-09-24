const productionConfig = require('./webpack.config.js');   // 继承开发环境配置
const webpack = require("webpack");                 // webpack标准库
const TerserJSPlugin = require('terser-webpack-plugin');

// 代码压缩插件
const minimizer = [
    new TerserJSPlugin({
        terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {
                drop_console: true,
                drop_debugger: false,
                pure_funcs: ['console.log'] // 移除console
            }
        },
    }),
]


productionConfig.optimization.minimizer = minimizer;

// 添加环境变量
var definePlugin = new webpack.DefinePlugin({
    'process.env': {
        'NODE_ENV': JSON.stringify('production')
    }
});
productionConfig.plugins.push(definePlugin);

// 配置CDN地址前缀, 例如: http://cdn.cxxboy.com/
productionConfig.output.publicPath = "";

// 模块导出最终配置
module.exports = productionConfig;
