import path from "path";
import webpack from "webpack";

export default {
    entry: {
        'app': './app/renderer-process/app.js',
        'image-resizer': './app/renderer-process/worker/image-resizer.js'
    },
    output: {
        filename: '[name]-bundle.js',
        path: path.resolve(__dirname, 'app/bundle'),
        publicPath: './bundle/'
    },
    devtool: '#inline-source-map',
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015'],
                sourceMaps: ['inline']
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
                    // minimize: true
                }
            }],
        }, {
            test: /\.png$|http/,
            use: ["url-loader?mimetype=image/png"]
        }, {
            test: /\.js$/,
            use: ["source-map-loader"],
            enforce: "pre"
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
        })
    ],
    target: 'electron-renderer'
};
