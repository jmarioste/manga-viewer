const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: './docs/scripts/main.js',
    output: {
        filename: './bundle.js',
        path: path.resolve(__dirname, './docs-generated')
    },
    devtool: '#inline-source-map',
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                // presets: ['es2015'],
                sourceMaps: ['inline']
            }
        }, {
            test: /\.s?css$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader?sourceMap" // translates CSS into CommonJS
            }, {
                loader: "sass-loader", // compiles Sass to CSS
                // options: {
                //     includePaths: [
                //         path.resolve(__dirname, "node_modules/roboto-fontface/fonts")
                //     ]
                // }
            }]
        },
        {
            test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
            use: [{
                loader: "file-loader",
                options: {
                    name: '[path][name].[ext]'
                }
            }]
        },
        {
            test: /\.html$/,
            use: [{
                loader: 'html-loader',
                options: {
                    // minimize: true
                }
            }],
        },
        // {
        //     test: /\.png$|http/,
        //     use: ["url-loader?mimetype=image/png"]
        // }, 
        {
            test: /\.js$/,
            use: ["source-map-loader"],
            enforce: "pre"
        }, {
            // Exposes jQuery for use outside Webpack build
            test: require.resolve('jquery'),
            use: [{
                loader: 'expose-loader',
                options: 'jQuery'
            }, {
                loader: 'expose-loader',
                options: '$'
            }]
        }]

    },
    plugins: [
        new webpack.ProvidePlugin({
            'window.jQuery': 'jquery',
            $: 'jquery'
        }),
        new CopyWebpackPlugin([{
            from: './docs/index.html',
            to: './'
        }, {
            from: './docs/icons/',
            to: './icons/'
        },
        {
            from: './docs/screenshots',
            to: './screenshots'
        },
        {
            from: './docs/css',
            to: './css'
        },
        {
            from: './docs/webfonts',
            to: './webfonts'
        }
        ])
    ],
    devServer: {
        contentBase: path.join(__dirname, 'docs-generated')
    }
};
