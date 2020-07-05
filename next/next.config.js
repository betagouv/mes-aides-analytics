const isProduction = 'production' === process.env.NODE_ENV

module.exports = {
  assetPrefix: isProduction ? '/mes-aides-analytics' : ''
}
