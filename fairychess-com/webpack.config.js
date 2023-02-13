const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//TODO why is our hashed .JS appearing in my HTML? Need to ask why this is happening, doesn't look like it should
//TODO it causes the sevr program to be included. Which I don't want.

const clientconfig = {
    target: 'web',
    mode: 'development',
    entry: { index: './src/index.tsx' },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output',
            template: './src/index.html',
            chunks: ['index']
        }),
    ],

    devtool: 'inline-source-map',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.wasm$/i,
                type: 'asset/resource',
            },
            /*{
                test: /\.html$/i,
                //use: "file-loader",
                type: 'asset/resource',
            },*/
        ],
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        /*fallback: {
            util: require.resolve("bufferutil/")
        }*/
    },

    output: {
        filename: '[name].[contenthash].bundle.js', //filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'build'),
        //clean: true, if this is set to true than it deletes our new server program
    },
}



const serverconfig = {
    target: 'node',
    mode: 'development',
    entry: {
        server: './src/server.ts'
    },

    devtool: 'inline-source-map',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.wasm$/i,
                type: 'asset/resource',
            },
            /*{
                test: /\.html$/i,
                //use: "file-loader",
                type: 'asset/resource',
            },*/
        ],
    },
    externals: [
        {
          'utf-8-validate': 'commonjs utf-8-validate',
          bufferutil: 'commonjs bufferutil',
        },
      ],

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        /*fallback: {
            util: require.resolve("bufferutil/")
        }*/
    },

    output: {
        filename: '[name].[contenthash].bundle.js', //filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'build'),
        clean: true,
    },
}



module.exports = [clientconfig, serverconfig];