module.exports = {
  'get /github/': 'index',
  'get /github': 'index',
  'get /github/:user': 'notFound',
  'get /github/:user/:repo': 'getRepo',
  'get /rest/info': 'featureservice',
  'post /rest/info': 'featureservice',
  'get /rest/services/github/:user/:repo/FeatureServer': 'featureservice',
  'get /rest/services/github/:user/:repo/FeatureServer/:layer': 'featureservice',
  'get /rest/services/github/:user/:repo/FeatureServer/:layer/:method': 'featureservice',
  'post /rest/services/github/:user/:repo/FeatureServer/:layer/:method': 'featureservice',
  'get /github/:user/:repo/:file.:format': 'getRepo',
  'get /github/:user/:repo/:file': 'getRepo',
  'get /github/:user/:repo/:file/preview': 'preview',
  'get /rest/services/github/:user/:repo/:file/FeatureServer': 'featureservice',
  'get /rest/services/github/:user/:repo/:file/FeatureServer/:layer': 'featureservice',
  'get /rest/services/github/:user/:repo/:file/FeatureServer/:layer/:method': 'featureservice',
  'post /rest/services/github/:user/:repo/:file/FeatureServer/:layer/:method': 'featureservice',
  'get /github/:user/:repo/:file/thumbnail' : 'thumbnail',
  'get /github/:user/:repo/:file/tiles/:z/:x/:y.:format': 'tiles',
  'get /github/:user/:repo/:file/:layer/tiles/:z/:x/:y.:format': 'tiles'
}