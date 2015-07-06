var SM = require('sphericalmercator')
var merc = new SM({size: 256})
var crypto = require('crypto')
var fs = require('fs')

// inherit from base controller
var Controller = function (Github, BaseController) {
  var controller = BaseController()

  // general helper for not found repos
  controller.notFound = function (req, res) {
    res.status(404).send('Must specify a user, repo, and file')
  }

  // general helper for error'd requests
  controller.Error = function (req, res) {
    res.status(500).send('There was a problem accessing this repo')
  }

  // renders an empty map with a text input
  controller.index = function (req, res) {
    res.render(__dirname + '/../views/index')
  }

  // drops the cache for an item
  controller.drop = function (req, res) {
    Github.drop(req.params.user, req.params.repo, req.params.file, req.query, function (err, itemJson) {
      if (err) return res.status(400).send(err)
      res.json(itemJson)
    })
  }

  controller.thumbnail = function (req, res) {
    // check the image first and return if exists
    var key = ['github', req.params.user, req.params.repo, req.params.file].join(':')
    var dir = Github.cacheDir() + '/thumbs/'
    req.query.width = parseInt(req.query.width, 10) || 150
    req.query.height = parseInt(req.query.height, 10) || 150
    req.query.f_base = dir + key + '/' + req.query.width + '::' + req.query.height

    var _reply = function (err, data) {
      if (err) return res.json(err, 500)
      if (!data) controller.Error(req, res)

      // generate a thumbnail
      Github.generateThumbnail(data[0], key, req.query, function (err, file) {
        if (err) {
          res.status(500).send(err)
        } else {
          // send back image
          res.sendFile(file)
        }
      })
    }

    var fileName = Github.thumbnailExists(key, req.query)
    if (fileName) {
      res.sendFile(fileName)
    } else {
      if (req.params.user && req.params.repo && req.params.file) {
        req.params.file = req.params.file.replace('.geojson', '')
        Github.find(req.params.user, req.params.repo, req.params.file, req.query, _reply)
      } else if (req.params.user && req.params.repo && req.query) {
        Github.find(req.params.user, req.params.repo, null, req.query, _reply)
      } else {
        controller.notFound(req, res)
      }
    }
  }

  controller.getRepo = function (req, res) {
    // method to respond to model finds
    var _send = function (err, data) {
      if (err) return res.json(err, 500)
      if (!data) return controller.Error(req, res)

      var len = data.length
      var allTopojson = []

      var processTopojson = function (topology) {
        allTopojson.push(topology)
        if (allTopojson.length === len) {
          res.json(allTopojson[0])
        }
      }

      if (req.query.topojson) {
        data.forEach(function (d) {
          Topojson.convert(d, function (err, topology) {
            if (err) return res.json(err, 500)
            processTopojson(topology)
          })
        })
      } else if (req.params.format) {
        if (!Github.files.localDir) {
          res.status(501).send('No file system configured for exporting data')
          return
        }

        if (req.params.format === 'png') {
          // res.redirect(req.url.replace('.png', '')+'/thumbnail')
          controller.thumbnail(req, res)
        } else {
          // change geojson to json
          req.params.format = req.params.format.replace('geojson', 'json')

          var dir = ['github', req.params.user, req.params.repo, req.params.file].join(':')
          // build the file key as an MD5 hash that's a join on the paams and look for the file
          var toHash = JSON.stringify(req.params) + JSON.stringify(req.query)
          var key = crypto.createHash('md5').update(toHash).digest('hex')

          var path = ['files', dir].join('/')
          var fileName = key + '.' + req.params.format

          Github.files.exists(path, fileName, function (exists, path) {
            if (exists) {
              if (path.substr(0, 4) === 'http') {
                res.redirect(path)
              } else {
                res.sendFile(path)
              }
            } else {
              Github.exportToFormat(req.params.format, dir, key, data[0], {}, function (err, file) {
                if (err) return res.status(500).send(err)
                res.sendFile(file)
              })
            }
          })
        }
      } else {
        res.json(data)
      }
    }

    if (req.params.user && req.params.repo && req.params.file) {
      req.params.file = req.params.file.replace('.geojson', '')
      Github.find(req.params.user, req.params.repo, req.params.file, req.query, _send)
    } else {
      controller.notFound(req, res)
    }
  }

  controller.featureservice = function (req, res) {
    var callback = req.query.callback
    delete req.query.callback

    if (req.params.user && req.params.repo && req.params.file) {
      req.params.file = req.params.file.replace('.geojson', '')
      Github.find(req.params.user, req.params.repo, req.params.file, req.query, function (err, data) {
        delete req.query.geometry
        delete req.query.where
        controller.processFeatureServer(req, res, err, data, callback)
      })
    } else if (req.params.user && req.params.repo && !req.params.file) {
      Github.find(req.params.user, req.params.repo, null, req.query, function (err, data) {
        delete req.query.geometry
        delete req.query.where
        controller.processFeatureServer(req, res, err, data, callback)
      })
    } else {
      controller.notFound(req, res)
    }
  }

  // Handle the preview route
  // renders views/demo/github
  controller.preview = function (req, res) {
    req.params.file = req.params.file.replace('.geojson', '')
    res.render(__dirname + '/../views/demo', { locals: { user: req.params.user, repo: req.params.repo, file: req.params.file } })
  }

  // Handle the tile preview route
  controller.tile_preview = function (req, res) {
    req.params.file = req.params.file.replace('.geojson', '')
    res.render('demo/github_tiles', { locals: { user: req.params.user, repo: req.params.repo, file: req.params.file } })
  }

  controller.topojson_preview = function (req, res) {
    req.params.file = req.params.file.replace('.geojson', '')
    res.render('demo/github_topojson', { locals: {
        user: req.params.user,
        repo: req.params.repo,
        file: req.params.file
      }
    })
  }

  controller.tiles = function (req, res) {
    if (!Github.files.localDir) {
      res.status(501).send('Local Filesystem not configured. Please add a "data_dir" to the server config to support tiles')
      return
    }

    var callback = req.query.callback
    delete req.query.callback

    var layer = req.params.layer || 0
    var file, jsonFile, key

    var _send = function (err, data) {
      if (err) return res.status(400).send(err)

      req.params.key = key + ':' + layer

      if (req.query.style) {
        req.params.style = req.query.style
      }

      req.params.name = req.params.file

      Github.tileGet(req.params, data[layer], function (err, tile) {
        if (err) {
          return res.status(err.code || 500).send(err.message || 'Unknown error while creating the tile')
        }

        if (req.params.format === 'pbf') {
          res.setHeader('content-encoding', 'deflate')
        }

        if (req.params.format === 'png' || req.params.format === 'pbf') {
          return res.sendFile(tile)
        }

        if (callback) {
          res.send(callback + '(' + JSON.stringify(tile) + ')')
        } else {
          if (typeof tile === 'string') {
            res.sendFile(tile)
          } else {
            res.json(tile)
          }
        }
      })
    }

    // build the geometry from z,x,y
    var bounds = merc.bbox(req.params.x, req.params.y, req.params.z)

    req.query.geometry = {
      xmin: bounds[0],
      ymin: bounds[1],
      xmax: bounds[2],
      ymax: bounds[3],
      spatialReference: { wkid: 4326 }
    }

    var _sendImmediate = function (file) {
      if (req.params.format === 'pbf') {
        res.setHeader('content-encoding', 'deflate')
      }
      if (req.params.format === 'png' || req.params.format === 'pbf') {
        res.sendFile(file)
      } else {
        fs.readFile(file, function (err, data) {
          if (err) return res.status(500).json(err)

          var json = JSON.parse(data)

          if (callback) {
            res.send(callback + '(' + JSON.stringify(json) + ')')
          } else {
            res.json(json)
          }
        })
      }
    }

    if (req.params.user && req.params.repo && req.params.file) {
      req.params.file = req.params.file.replace('.geojson', '')
      key = ['github', req.params.user, req.params.repo, req.params.file].join(':')

      file = Github.files.localDir + '/tiles/' +
        key + ':' + layer + '/' + req.params.format +
        '/' + req.params.z + '/' + req.params.x + '/' +
        req.params.y + '.' + req.params.format

      jsonFile = file.replace(/png|pbf|utf/g, 'json')

      // if the json file alreadty exists, dont hit the db, just send the data
      if (fs.existsSync(jsonFile) && !fs.existsSync(file)) {
        _send(null, fs.readFileSync(jsonFile))
      } else if (!fs.existsSync(file)) {
        var factor = 0.35
        req.query.simplify = ((Math.abs(req.query.geometry.xmin - req.query.geometry.xmax)) / 256) * factor
        Github.find(req.params.user, req.params.repo, req.params.file, req.query, _send)
      } else {
        _sendImmediate(file)
      }
    } else if (req.params.user && req.params.repo) {
      key = ['github', req.params.user, req.params.repo].join(':')

      file = Github.files.localDir + '/tiles/' +
        key + ':' + layer + '/' + req.params.format +
        '/' + req.params.z + '/' + req.params.x + '/' +
        req.params.y + '.' + req.params.format

      jsonFile = file.replace(/png|pbf|utf/g, 'json')

      // if the json file alreadty exists, dont hit the db, just send the data
      if (fs.existsSync(jsonFile) && !fs.existsSync(file)) {
        _send(null, fs.readFileSync(jsonFile))
      } else if (!fs.existsSync(file)) {
        Github.find(req.params.user, req.params.repo, req.params.file, req.query, _send)
      } else {
        _sendImmediate(file)
      }

    } else {
      res.send('Must specify at least a user and a repo', 404)
    }
  }

  return controller
}

module.exports = Controller
