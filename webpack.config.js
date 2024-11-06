const path = require("path")
const os = require("os")
const EsLintPlugin = require("eslint-webpack-plugin")
const HtmlPlugin = require("html-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const RefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");            //js热模块更新
const TerserPlugin = require("terser-webpack-plugin")                             // js代码压缩
const CopyPlugin = require("copy-webpack-plugin");                                // 用于复制
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const Webpack = require('webpack')                                                // 解决 process is not defined 的问题
const Dotenv = require('dotenv-webpack');                                         // 读取.env文件
const EncodingPlugin = require('webpack-encoding-plugin');
// const HappyPack = require('happypack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');


const threads = os.cpus().length

console.log("process.env.NODE_ENV ---", process.env.NODE_ENV)

const isDevelopmentMode = process.env.NODE_ENV === "development"

/**
生产模式下：
    1.不需要热更新
    2.不需要devServer
    3.需要进行js代码的压缩
    4.需要进行css代码的压缩
    5.需要一个CopyPlugin，可以把public目录下的文件进行复制
    6.filename或者chunkFilename设置的时候加上 [contenthash:5] 用来进行资源的缓存对比
 */

module.exports = {
    entry: "./src/index.tsx",

    output: {
        path: isDevelopmentMode ? undefined : path.resolve(__dirname, "dist"),
        filename: isDevelopmentMode ? "js/[name].js" : "static/js/[name].[contenthash:5].js",
        chunkFilename: isDevelopmentMode ? "js/[name].chunk.js" : "static/js/[name].[contenthash:5].chunk.js",        // import 动态导入的 或者 node_modules
        assetModuleFilename: "static/[name].[hash:5][ext]",
        publicPath: isDevelopmentMode ? undefined : "/intel-bench-anlysis/",
        clean: true
    },

    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.css$/,
                        use: [
                            isDevelopmentMode ? "style-loader" : MiniCssExtractPlugin.loader,           // 生产模式下 把css单独提取为一个文件
                            "css-loader"
                        ]
                    },
                    {
                        test: /\.less$/,
                        use: [
                            isDevelopmentMode ? "style-loader" : MiniCssExtractPlugin.loader,
                            "css-loader",
                            {
                                loader: "less-loader",
                                options: {
                                    lessOptions: {                           // antd自定义主题
                                        modifyVars: {
                                            'primary-color': '#697DFF',
                                        },
                                        javascriptEnabled: true,
                                    }
                                }
                            }


                        ]
                    },
                    {
                        test: /\.(jpe?g|png|gif|webp|svg)$/,
                        type: "asset",                                      //  asset可以原封不动输出，也可转为data uri
                        parser: {
                            dataUrlCondition: {
                                maxSize: 30 * 1024
                            }
                        }
                    },
                    {
                        test: /\.(mp3|mp4|avi|ttf)$/,
                        type: "asset/resource"            //asset/resource相当于file-loader，只会原封不动输出
                    },

                    {
                        test: /\.(jsx?)$/,
                        include: path.resolve(__dirname, "./src"),
                        use: [
                            {
                                loader: "thread-loader",                // 放在babel-loader的前面
                                options: {
                                    workers: threads                      //  确定进程数量
                                }
                            },
                            {
                                loader: 'babel-loader',
                                options: {
                                    // presets: ['@babel/preset-env'],      // 智能预设，在babel.config.js中指定
                                    cacheDirectory: true,                   // 开启babel缓存
                                    cacheCompression: false,                // 关闭缓存文件压缩
                                    plugins: isDevelopmentMode ? ["react-refresh/babel"] : []     // 生产模式下关闭 react 的 js 模块热更新
                                }
                            },
                        ]

                    },
                    {
                        test: /\.tsx?$/,
                        exclude: /node_modules/,
                        use: [
                            // 'happypack/loader?id=ts'

                            /**
                             * TypeScript 的类型检查过程通常是单线程的，因此可能会导致类型检查与多线程构建之间存在冲突
                             * 将 TypeScript 的类型检查与构建过程分开，使用fork-ts-checker-webpack-plugin插件来单独进行 TypeScript 的类型检查。
                             * 这样可以确保类型检查不会阻塞构建过程，并且可以利用多线程进行构建。
                             */
                            {
                                loader: "thread-loader",                  // 放在babel-loader的前面
                                options: {
                                    workers: threads - 1                  //  确定进程数量
                                }
                            },

                            {
                                loader: 'babel-loader',
                                options: {
                                    // presets: ['@babel/preset-env'],      // 智能预设，在babel.config.js中指定
                                    cacheDirectory: true,                   // 开启babel缓存
                                    cacheCompression: false,                // 关闭缓存文件压缩
                                    plugins: isDevelopmentMode ? ["react-refresh/babel"] : []       // 生产模式下关闭 react 的 js 模块热更新
                                }
                            },

                            {
                                loader: "ts-loader",
                                options: {
                                    compilerOptions: { noEmit: false },
                                    happyPackMode: true,                        // This implicitly sets "transpileOnly" to be true anyway

                                    // projectReferences: true,
                                    
                                    // transpileOnly: true,
                                    // cacheDirectory: true
                                }
                            }
                        ]
                    }

                ]
            }
        ]
    },

    plugins: [
        // new ForkTsCheckerWebpackPlugin({
        //     typescript: {
        //         diagnosticOptions: {
        //             semantic: true,
        //             syntactic: true,
        //         },
        //     },
        // }),

        new Webpack.ProvidePlugin({
            // process: 'process/browser',
            process: require.resolve('process/browser')
        }),

        new Dotenv({
            path: isDevelopmentMode ? "./.env.development" : './.env.production'                                       // 指定你的.env.production文件路径
        }),

        new ForkTsCheckerWebpackPlugin(), // 使用 ForkTsCheckerWebpackPlugin 插件.Webpack构建过程中单独进行TypeScript的类型检查，而不会阻塞构建线程，从而提高构建性能。

        new EncodingPlugin({
            encoding: 'UTF-8'
        }),

        new EsLintPlugin({
            context: path.resolve(__dirname, "./src"),

            exclude: "node_modules",

            cache: true,
            cacheLocation: path.resolve(__dirname, "./node_modules/.cache/.eslintcache"),

            threads: threads        //确定开启的内核数量
        }),

        // 如果使用了devServer，一定不能再HtmlWebpackPlugin中设置filename属性。否则打开后的页面不显示内容
        new HtmlPlugin(isDevelopmentMode ? {
            template: path.resolve(__dirname, "public/index.html"),
        } : {
            template: path.resolve(__dirname, "public/index.html"),
            filename: isDevelopmentMode ? "" : "./index.html"
        }),




        // 只有在开发模式下才有热更新
        isDevelopmentMode ? new RefreshPlugin() : null,

        // 只有在生产环境下才把css单独提取成一个文件
        isDevelopmentMode ? null : new MiniCssExtractPlugin({
            filename: "static/css/[name].[contenthash:5].css",
            chunkFilename: "static/css/[name].[contenthash:5].chunk.css"
        }),

        isDevelopmentMode ? new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerHost: '127.0.0.1',
            analyzerPort: 8888,
            openAnalyzer: true, // 构建完打开浏览器
            reportFilename: path.resolve(__dirname, `analyzer/index.html`),
        }) : null,

        // 将public下面的资源复制到dist目录去（除了index.html）
        isDevelopmentMode ? null : new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "./public"),
                    to: path.resolve(__dirname, "./dist"),
                    toType: "dir",
                    noErrorOnMissing: true, // 不生成错误
                    globOptions: {
                        // 忽略文件 index.html
                        ignore: ["**/index.html"],
                    },
                    info: {
                        // 跳过terser压缩js
                        minimized: true,
                    },
                },
            ],
        }),

        // 解决 process is not define 报错
        new Webpack.ProvidePlugin({
            // process: 'process/browser',
            process: require.resolve('process/browser')
        }),

    ].filter(Boolean),

    optimization: {
        minimize: !isDevelopmentMode,                                   // 控制是否压缩， 开发模式不需要压缩 生产模式下需要压缩  
        minimizer: [
            new CssMinimizerPlugin(),                                   // css 代码压缩
            new TerserPlugin({ parallel: threads })                    // js 代码压缩
        ],

        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}`
        },

        // 代码分割
        splitChunks: {
            chunks: "all",

            cacheGroups: {
                // 如果项目中使用antd，此时将所有node_modules打包在一起，那么打包输出文件会比较大。
                // 所以我们将node_modules中比较大的模块单独打包，从而并行加载速度更好

                // 将react相关的库单独打包，减少node_modules的chunk体积。
                react: {
                    name: "react-chunk",
                    test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
                    chunks: "initial",
                    priority: 30,
                },

                antd: {
                    name: "antd-chunk",
                    test: /[\\/]node_modules[\\/]antd(.*)/,
                    priority: 25,
                },


                echarts: {
                    name: "echarts-chunk",
                    test: /[\\/]node_modules[\\/]echarts(.*)/,
                    priority: 20
                },

                libs: {
                    name: "libs-chunk",
                    test: /[\\/]node_modules[\\/]/,
                    priority: 10, // 权重最低，优先考虑前面内容
                    chunks: "initial",
                },

            },
        },

    },

    mode: isDevelopmentMode ? "development" : "production",

    devtool: isDevelopmentMode ? "cheap-module-source-map" : "source-map",

    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]            // 自动补全文件扩展名
    },

    devServer: {
        host: "localhost",
        port: 3002,
        open: true,
        hot: true,
        historyApiFallback: true,                       // 解决react-router刷新404问题
    },
}