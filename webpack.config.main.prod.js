import path from "path";
import webpack from "webpack";

export default {
    entry: './src/main.js',
    target: 'electron-main',
    output: {
        filename: './src/main.prod.js',
        path: __dirname,
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },
    resolve: {
        modules: [
            path.resolve("./src"),
            path.resolve("./node_modules")
        ]
    },

    // node: {
    //     __dirname: false,
    //     __filename: false
    // },
    node: {
        __dirname: false,
        __filename: false
    },
};
