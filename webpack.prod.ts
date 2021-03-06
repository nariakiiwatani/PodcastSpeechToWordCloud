import path from 'path';
import merge from 'webpack-merge';
const common = require('./webpack.common.ts')

const config = merge(common, {
	mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
  })

export default config;