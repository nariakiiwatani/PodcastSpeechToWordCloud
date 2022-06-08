import path from 'path';
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack')

module.exports = {
    entry: './src/index.tsx',
	plugins: [
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			template: './src/index.html'
		}),
		new CopyWebpackPlugin({
			patterns: [
	            { from: 'public', to: './' }
    	    ]
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
		new webpack.DefinePlugin({
			'process.env': JSON.stringify(process.env)
		 }),
	],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
				include: path.resolve(__dirname, 'src'),
        		exclude: /node_modules/
            },{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
				],
			}
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
		fallback: { "path": require.resolve("path-browserify") }
    },
};

