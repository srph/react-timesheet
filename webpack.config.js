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
    }]
  }

  // module: {
  //   loaders: [{
  //     test: /$\.js/,
  //     exclude: /node_modules/,
  //     loader: 'imports-loader?$=jquery,@srph/jqt=>null',
  //   }]
  // },

  // externals: [{
  //   jquery: 'jQuery',
  //   '@srph/jqt': 'jQuery'
  // }]
};