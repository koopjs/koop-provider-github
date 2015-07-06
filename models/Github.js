var Geohub = require('geohub')

var Github = function (koop) {
  if (!koop.config.ghtoken) {
    console.warn('No Github Token in config. This may cause problems accessing data.')
  }

  var github = new koop.BaseModel(koop)

  // we can easily test calls to the geohub this way
  github.geohub = Geohub

  github.find = function (user, repo, file, options, callback) {
    file = file ? file.replace(/::/g, '/') : null

    var key = [ user, repo, file].join('/')
    var type = 'Github'

    koop.Cache.get(type, key, options, function (err, entry) {
      if (!err) return callback(null, entry)

      github.geohub.repo(user, repo, file, koop.config.ghtoken, function (err, geojson) {
        if (!geojson || err) return callback('No geojson found', null)

        if (!geojson.length) {
          geojson = [geojson]
        }

        var _totalLayer = geojson.length
        var finalJson = []

        // local method to collect layers and send them all
        var _send = function (data) {
          finalJson.push(data)
          if (finalJson.length === _totalLayer) {
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

  // drops the item from the cache
  github.drop = function (user, repo, file, options, callback) {
    var key = [user, repo, file].join('/')
    var type = 'Github'
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

  return github

}

module.exports = Github
