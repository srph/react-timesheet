module.exports = {
  entry: './lib/index.js',

  output: {
    path: './dist',
    filename: process.env.NODE_ENV === 'production'
      ? 'react-timesheet.min.js'
      : 'react-timesheet.js',
    libraryTarget: 'umd',
    library: 'ReactTimesheet'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'buble',
      query: {
        transforms: {
          modules: false
        }
      }
    }, {
      test: /$\.js/,
      exclude: /node_modules/,
      loader: 'imports-loader?react=React,react-dom=ReactDOM',
    }]
  },

  externals: [{
    'react': 'React',
    'react-dom': 'ReactDOM'
  }]
};