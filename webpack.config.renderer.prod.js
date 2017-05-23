import path from "path";
import webpack from "webpack";
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
export default {
    entry: './app/renderer-process/app.js',
    output: {
        filename: 'app-bundle.js',
        path: path.resolve(__dirname, 'app/bundle'),
        publicPath: './bundle/'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }],
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader?sourceMap" // translates CSS into CommonJS
            }, {
                loader: "sass-loader", // compiles Sass to CSS
                options: {
                    includePaths: [
                        path.resolve(__dirname, "node_modules/roboto-fontface/fonts")
                    ]
                }
            }]
        }, {
            test: /\.woff2?$|\.ttf$|\.eot$|\.svg$|\.jpg$/,
            use: [{
                loader: "file-loader"
            }]
        }, {
            test: /\.html$/,
            use: [{
                loader: 'html-loader',
                options: {
                    minimize: true
                }
            }],
        }, {
            test: /\.png$|http/,
            use: ["url-loader?mimetype=image/png"]
        }]
    },
    resolve: {
        modules: [
            path.resolve("./app"),
            path.resolve("./app/node_modules")
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            'window.jQuery': 'jquery',
            $: 'jquery'
        }),
        new UglifyJSPlugin()
    ],
    target: 'electron-renderer'
};
