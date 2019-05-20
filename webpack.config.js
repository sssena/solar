const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = path.resolve(__dirname, 'src')

module.exports = {
    module: {
        rules: [
            {
                test: /\.(css|style)$/, // loader CSS
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
                include: [defaultInclude, path.join( __dirname, 'node_modules' )]
            },
            {
                test: /\.jsx?$/, // loader for react
                use: [{ loader: 'babel-loader' }],
                include: defaultInclude
            },
            {
                test: /\.(jpe?g|png|gif)$/, // loader for images
                //use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }, { loader: 'url-loader' }],
                use: [{ 
                    loader: 'url-loader',
                    options: {
                        basePath: path.resolve( __dirname ),
                        rewritePath: './'
                    }
                }],
                include: [defaultInclude, path.join( __dirname, 'public', 'imgs' )]
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|mp3)$/, // loader for custom fonts
                use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
                include: [defaultInclude, path.join( __dirname, 'public' ), path.join( __dirname, 'modules' )]
            },
            {
                type: 'javascript/auto',
                test: /\.json$/, // loader for custom fonts
                use: [{ loader: 'file-loader' }],
                include: [defaultInclude, path.join( __dirname, 'modules/crp-dapp/api/args' )]
            }
        ]
    },
    target: 'electron-renderer',
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new CopyWebpackPlugin([
            //            { from: path.join( __dirname, 'modules/crp-web3'), to: 'crp-web3'},
            { from: path.join( 'modules/crp-dapp/api/args'), to: 'args'},
            { from: path.join( __dirname, 'modules/crp-dapp/api/abi'), to: 'abi'},
            { from: path.join( __dirname, 'modules/crp-dapp/api/data'), to: 'data'}
        ])
    ],
    output: {
        path: path.resolve( __dirname, 'dist' ),
        publicPath: path.resolve( __dirname, 'dist' ),
        filename: 'bundle.js'
    },
    node: {
        __dirname: false,
        __filename: false,
    }
}
