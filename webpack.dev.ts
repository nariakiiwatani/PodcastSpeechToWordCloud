import path from 'path';
import merge from 'webpack-merge';
const common = require('./webpack.common.ts')

const config = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
    devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
    	compress: true,
    	port: 3000,
	},
  })

export default config;