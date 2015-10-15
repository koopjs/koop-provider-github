module.exports = {
  'get /github': 'index',
  'get /github/rate_limit': 'rate_limit',
  'get /github/:user': 'notFound',
  'get /github/:user/:repo': 'getRepo',
  'get /github/:user/:repo/FeatureServer': 'featureservice',
  'get /github/:user/:repo/FeatureServer/:layer': 'featureservice',
  'get /github/:user/:repo/FeatureServer/:layer/:method': 'featureservice',
  'get /github/:user/:repo/:file.:format': 'getRepo',
  'get /github/:user/:repo/:file': 'getRepo',
  'get /github/:user/:repo/:file/preview': 'preview',
  'get /github/:user/:repo/:file/FeatureServer': 'featureservice',
  'get /github/:user/:repo/:file/FeatureServer/:layer': 'featureservice',
  'get /github/:user/:repo/:file/FeatureServer/:layer/:method': 'featureservice',
  'get /github/:user/:repo/:file/tiles/:z/:x/:y.:format': 'tiles',
  'get /github/:user/:repo/:file/:layer/tiles/:z/:x/:y.:format': 'tiles',
  'get /github/:user/:repo/:file/drop': 'drop'
}
