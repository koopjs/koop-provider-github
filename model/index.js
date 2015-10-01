var geohub = require('geohub')
var provider = require('koop-provider')

/**
 * creates new github model with access to koop instance
 *
 * @param {Object} koop - instance of koop app
 */
var githubModel = function (koop) {
  var model = provider.createModel(koop)

  model.config = koop.config
  model.config.ghtoken = model.config.ghtoken || process.env.KOOP_GITHUB_TOKEN || null
  model.geohub = geohub

  if (!model.config.ghtoken) {
    koop.log.warn('[github provider] No github access token configured. Github API requests may be rate limited.')
  }

  /**
   * finds an item in the cache or fetches it using geohub
   *
   * @param  {string}   user - github username
   * @param  {string}   repo - github repository
   * @param  {string}   file - path to file in repo
   * @param  {object}   options - cache options
   * @param  {Function} callback - err, geojson
   */
  model.find = function (user, repo, file, options, callback) {
    var type = 'github'
    var key = [user, repo, file].join('/')
    file = file ? file.replace(/::/g, '/') : null

    koop.Cache.get(type, key, options, function (err, entry) {
      if (!err) return callback(null, entry)

      model.geohub.repo({
        user: user,
        repo: repo,
        path: file,
        token: model.config.ghtoken
      }, function (err, geojson) {
        if (err) return callback(err)
        if (!geojson) return callback(null, [])
        if (!geojson.length) geojson = [geojson]

        var totalLayers = geojson.length
        var finalJson = []

        // local method to collect layers and send them all
        function _send (data) {
          finalJson.push(data)
          if (finalJson.length === totalLayers) {
            callback(null, finalJson)
          }
        }

        geojson.forEach(function (layer, i) {
          if (!layer.name) {
            layer.name = file.replace('.geojson', '')
          }

          koop.Cache.insert(type, key, layer, i, function (err, success) {
            if (err) return callback(err)
            if (success) _send(layer)
          })
        })
      })
    })
  }

  /**
   * drops an item from the cache
   *
   * @param  {string}   user - github username
   * @param  {string}   repo - github repository
   * @param  {string}   file - path to file in repo
   * @param  {object}   options - cache options
   * @param  {Function} callback - err, success (boolean)
   */
  model.drop = function (user, repo, file, options, callback) {
    var type = 'github'
    var key = [user, repo, file].join('/')
    var dir = [type.toLowerCase(), user, repo, file].join(':')

    koop.Cache.remove(type, key, options, function (err, res) {
      if (err) return callback(err)
      koop.files.removeDir('files/' + dir, function (err, res) {
        if (err) return callback(err)
        koop.files.removeDir('tiles/' + dir, function (err, res) {
          if (err) return callback(err)
          koop.files.removeDir('thumbs/' + dir, function (err, res) {
            callback(err, true)
          })
        })
      })
    })
  }

  return model
}

module.exports = githubModel
