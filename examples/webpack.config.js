module.exports = {
  entry: './examples/script.js',
  output: { filename: './examples/bundle.js' },

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
};