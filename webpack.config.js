const path = require("path"); // 处理文件路径的标准库
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');// CSS提取插件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // HTML生成插件
const {CleanWebpackPlugin} = require("clean-webpack-plugin");//自动清理
const JavaScriptObfuscator = require('webpack-obfuscator'); //加密代码
const glob = require('glob'); // HTML生成插件

// 设置html-webpack-plugin参数，返回参数对象
let getHtmlConfig = function (name, chunks) {
    var _template = `./src/pages/${name}/index.ejs`;
    var _filename = `${name}/index.html`;
    //index单独处理
    if (name === "index") {
        _filename = `index.html`;
    }
    let config = {
        template: _template,
        filename: _filename,
        // favicon: './favicon.ico',
        // title: title,
        inject: true, //设置为true插入的元素放入body元素的底部
        hash: false, //开启hash  ?[hash]
        chunks: chunks,
        minify: process.env.NODE_ENV === "development" ? false : {
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: true, //折叠空白区域 也就是压缩代码
            removeAttributeQuotes: true, //去除属性引用
        }
    };
    return config;
};

var plugins = [];

//加入其它plugin
plugins.push(
    // 自动清理
    new CleanWebpackPlugin(),
    //css加载
    new MiniCssExtractPlugin({
        // 类似 webpackOptions.output里面的配置 可以忽略
        filename: 'assets/css/[name].[hash:4].css',
        chunkFilename: 'assets/css/[id].[hash:4].css',
    }),
    // 自动加载类库
    //webpack配置ProvidePlugin后，在使用时将不再需要import和require进行引入，直接使用即可。
    new webpack.ProvidePlugin({
       /* $: 'jquery',
        jQuery: 'jquery',*/
    })
)

//生产环境加密js代码
if (process.env.NODE_ENV === "production") {
    console.log("打包生产环境,加密js代码!")
    plugins.push(
        new JavaScriptObfuscator({
            compact: true,//压缩代码
            controlFlowFlattening: true, //是否启用控制流扁平化(降低1.5倍的运行速度)
            controlFlowFlatteningThreshold: 0.75,//应用概率;在较大的代码库中，建议降低此值，因为大量的控制流转换可能会增加代码的大小并降低代码的速度。
            deadCodeInjection: true,//随机的死代码块(增加了混淆代码的大小)
            deadCodeInjectionThreshold: 0.4,//死代码块的影响概率
            debugProtection: false,//此选项几乎不可能使用开发者工具的控制台选项卡
            debugProtectionInterval: false,//如果选中，则会在“控制台”选项卡上使用间隔强制调试模式，从而更难使用“开发人员工具”的其他功能。
            disableConsoleOutput: true,//通过用空函数替换它们来禁用console.log，console.info，console.error和console.warn。这使得调试器的使用更加困难。
            identifierNamesGenerator: 'hexadecimal',//标识符的混淆方式 hexadecimal(十六进制) mangled(短标识符)
            log: false,
            renameGlobals: false,//是否启用全局变量和函数名称的混淆
            rotateStringArray: true,//通过固定和随机（在代码混淆时生成）的位置移动数组。这使得将删除的字符串的顺序与其原始位置相匹配变得更加困难。如果原始源代码不小，建议使用此选项，因为辅助函数可以引起注意。
            selfDefending: true,//混淆后的代码,不能使用代码美化,同时需要配置 cpmpat:true;
            stringArray: true,//删除字符串文字并将它们放在一个特殊的数组中
            stringArrayEncoding: 'base64',
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: false//允许启用/禁用字符串转换为unicode转义序列。Unicode转义序列大大增加了代码大小，并且可以轻松地将字符串恢复为原始视图。建议仅对小型源代码启用此选项。
        }, []),
    )
}

// webpack.config.js模块导出的所有符号（webpack配置信息）
// 参考：https://webpack.js.org/configuration/
module.exports = {
    stats: {
        // 关闭Entrypoint mini-css-extract-plugin = *提示
        entrypoints: false,
        children: false
    },
    devtool: process.env.NODE_ENV === "development" ? 'cheap-module-eval-source-map' : 'cheap-module-source-map',
    // 应用入口
    entry: getEntry(),
    // 编译输出配置
    output: {
        path: path.resolve(__dirname, 'dist'),          // 保存路径
        filename: 'assets/js/[name].[hash:4].js',    // js文件名
        publicPath: '/' //资源的基础路径，设置什么值就会在原来的路径前面加上这个值
    },
    plugins: plugins,
    resolve: {
        extensions: ['.ts', '.js']
    },
    // 模块配置
    module: {

        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            // es6语法转换
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    cacheDirectory: true,
                    presets: ['@babel/preset-env'],
                    plugins: [
                        ["@babel/plugin-transform-runtime"],
                        ["@babel/plugin-proposal-object-rest-spread"]
                    ]
                }
            },
            // css编码与提取
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                    'postcss-loader',
                ],
            },
            // 图片内联与编码
            {
                // 小于1KB的图片使用base64内联
                test: /\.(png|jpg|etc|svg)$/,
                use: [{
                    loader: "url-loader", // or url-loader
                    options: {
                        limit: 1024,
                        name: "assets/image/[name].[hash:4].[ext]",
                        esModule: false,
                    }
                }],
                // use: [
                //     {
                //       loader: 'url-loader',
                //       options: {
                //         limit: 1024,
                //         name:"assets/image/[name].[hash:4].[ext]"
                //       }
                //     }
                //   ]
            },
            // 提取html中直接引用的本地文件
            /* {
                 test: /\.html$/i,
                 loader: 'html-loader',
                 options: {
                      minimize: process.env.NODE_ENV === "development" ? false : false, //是否压缩html
               },
          },*/
        ]
    },
    performance: {
        hints: "warning", // 枚举
        maxAssetSize: 30000000, // 整数类型（以字节为单位）
        maxEntrypointSize: 50000000, // 整数类型（以字节为单位）
        assetFilter: function (assetFilename) {
            // 提供资源文件名的断言函数
            return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        }
    },
    // 提取公共代码
    optimization: {
/*        runtimeChunk: {
            name: 'manifest'
        },*/
        minimizer: [],// [new UglifyJsPlugin({...})]
        splitChunks: {
            cacheGroups: {
                vendor: {   // 抽离第三方插件
                    test: /node_modules/,   // 指定是node_modules下的第三方包
                    chunks: 'initial', // 拆分模块的范围
                    name: 'vendor',  // 打包后的文件名，任意命名
                    // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
                    priority: 10
                },
                utils: { // 抽离自己写的公共代码，common这个名字可以随意起
                    chunks: 'initial',
                    name: 'common',  // 任意命名
                    minSize: 30000,    // 只要超出0字节就生成一个新包
                    minChunks: 2   //
                }
            }
        }
    },

    // 测试服务器配置
    devServer: {
        host: '127.0.0.1',
        port: 8080,             // 监听端口
        //  compress: true,         // gzip压缩
        //  hot:true
    },
};


//插入htmlWebpackPlugin
(function () {
    //取得配置的入口key
    const entryObj = getEntry();
    //存储路径和chunks
    const htmlArray = [];
    for (let key in entryObj) {
        htmlArray.push({
            html: key,
            chunks: ['vendor', 'common', key]
        })
    }
    //自动生成html模板
    htmlArray.forEach((element) => {
        plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element.html, element.chunks)));
    });
})();


//读取所有.js文件,动态设置多入口
function getEntry() {
    var entry = {};
    //读取src目录下page下的所有.js文件
    glob.sync('./src/pages/**/*.js')
        .forEach(function (name) {
            let start = name.indexOf('src/') + 10,
                end = name.length - 3;
            let n = name.slice(start, end);
            let key = n.slice(0, n.lastIndexOf('/')); //保存各个组件的入口
            //console.log(key, name);
            entry[key] = name;
        });
    glob.sync('./src/pages/**/**/*.js')
        .forEach(function (name) {
            let start = name.indexOf('src/') + 10,
                end = name.length - 3;
            let n = name.slice(start, end);
            let key = n.slice(0, n.lastIndexOf('/')); //保存各个组件的入口
            //console.log(key,name);
            entry[key] = name;
        });
    return entry;
};