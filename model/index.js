var debug = require('debug')('koop:github:model')
var geohub = require('geohub')
var provider = require('koop-provider')

/**
 * creates new github model with access to koop instance
 *
 * @param {Object} koop - instance of koop app
 */
var githubModel = function (koop) {
  var model = provider.model(koop)

  model.config = koop.config
  model.config.ghtoken = model.config.ghtoken || process.env.KOOP_GITHUB_TOKEN || null
  model.geohub = geohub

  if (!model.config.ghtoken) {
    koop.log.warn('[github provider] No github access token configured. Github API requests may be rate limited.')
  }

  /**
   * finds an item in the cache or fetches it using geohub
   *
   * @param  {object}   options - user, repo, file, query
   * @param  {Function} callback - err, geojson
   */
  model.find = function (options, callback) {
    var user = options.user
    var repo = options.repo
    var file = options.file ? options.file.replace(/::/g, '/') : null
    var query = options.query || {}
    var type = 'github'
    var key = [user, repo, file].join('/')

    koop.Cache.get(type, key, query, function (err, entry) {
      if (!err) {
        debug('retrieved data from cache', options)
        return callback(null, entry)
      }

      debug('fetching data from Github API (cache error: %s)', err.message, options)

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
   * @param  {object}   options - user, repo, file, query
   * @param  {Function} callback - err, success (boolean)
   */
  model.drop = function (options, callback) {
    var user = options.user
    var repo = options.repo
    var file = options.file
    var query = options.query || {}
    var type = 'github'
    var key = [user, repo, file].join('/')
    var dir = [type.toLowerCase(), user, repo, file].join(':')

    koop.Cache.remove(type, key, query, function (err, res) {
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
