module.exports = {
  publicPath: './',
  pwa: {
    workboxOptions: {
      exclude: [/\.map$/],
    },
  },
}
