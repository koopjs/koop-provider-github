var fs = require('fs')
var crypto = require('crypto')
var merc = require('sphericalmercator')({ size: 256 })
var provider = require('koop-provider')
var request = require('request')
var pkg = require('../package.json')

/**
 * creates new github controller
 *
 * @param {object} model - instance of github model
 */
var Controller = function (Github) {
  var controller = provider.createController()

  /**
   * handles unspecified 404 responses
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.notFound = function (req, res) {
    var opts = {
      code: 404,
      message: 'Must specify a user, repo, and file'
    }

    res.status(opts.code).json(opts)
  }

  //
  /**
   * handles unspecified 500 responses
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.Error = function (req, res) {
    var opts = {
      code: 500,
      message: 'Internal Server Error'
    }

    res.status(opts.code).json(opts)
  }

  /**
   * renders index view
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.index = function (req, res) {
    res.render(__dirname + '/../views/index', {
      baseUrl: req.baseUrl
    })
  }

  /**
   * renders preview route
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.preview = function (req, res) {
    req.params.file = req.params.file.replace('.geojson', '')
    res.render(__dirname + '/../views/demo', {
      user: req.params.user,
      repo: req.params.repo,
      file: req.params.file,
      baseUrl: req.baseUrl
    })
  }

  /**
   * returns current github rate limit
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.rate_limit = function (req, res) {
    var options = {
      url: 'https://api.github.com/rate_limit',
      headers: {
        'User-Agent': 'koop-github/' + pkg.version
      }
    }

    if (Github.config.ghtoken) {
      options.qs = { access_token: Github.config.ghtoken }
    }

    request(options, function (err, response, body) {
      if (err) {
        return res.status(response.statusCode).json({
          code: response.statusCode,
          message: err.message
        })
      }

      res.json(JSON.parse(body))
    })
  }

  /**
   * drops the cache for an item
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.drop = function (req, res) {
    Github.drop(req.params.user, req.params.repo, req.params.file, req.query, function (err, itemJson) {
      if (err) {
        return res.status(400).send({
          code: 400,
          message: err.message
        })
      }

      res.json(itemJson)
    })
  }

  /**
   * handles requests for thumbnail images
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.thumbnail = function (req, res) {
    var key = ['github', req.params.user, req.params.repo, req.params.file].join(':')
    var dir = Github.cacheDir() + '/thumbs/'

    req.query.width = parseInt(req.query.width, 10) || 150
    req.query.height = parseInt(req.query.height, 10) || 150
    req.query.f_base = dir + key + '/' + req.query.width + '::' + req.query.height

    function _reply (err, data) {
      if (err) {
        return res.status(500).json({
          code: 500,
          message: err.message
        })
      }

      if (!data) return controller.Error(req, res)

      Github.generateThumbnail(data[0], key, req.query, function (err, file) {
        if (err) {
          return res.status(500).json({
            code: 500,
            message: err.message
          })
        }

        res.sendFile(file)
      })
    }

    var fileName = Github.thumbnailExists(key, req.query)

    if (fileName) return res.sendFile(fileName)

    var userAndRepoExist = req.params.user && req.params.repo

    if (userAndRepoExist && req.params.file) {
      req.params.file = req.params.file.replace('.geojson', '')
      return Github.find(req.params.user, req.params.repo, req.params.file, req.query, _reply)
    }

    if (userAndRepoExist && req.query) {
      return Github.find(req.params.user, req.params.repo, null, req.query, _reply)
    }

    controller.notFound(req, res)
  }

  /**
   * returns geojson for a specific user/repo/file path
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.getRepo = function (req, res) {
    // method to respond to model finds
    function _send (err, data) {
      if (err) {
        return res.status(500).json({
          code: 500,
          message: err.message
        })
      }

      if (!data) return controller.Error(req, res)

      if (req.params.format) {
        if (!Github.files.localDir) {
          return res.status(501).json({
            code: 501,
            message: 'No file system configured for exporting data'
          })
        }

        if (req.params.format === 'png') {
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
                if (err) {
                  return res.status(500).json({
                    code: 500,
                    message: err.message
                  })
                }

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
      return Github.find(req.params.user, req.params.repo, req.params.file, req.query, _send)
    }

    controller.notFound(req, res)
  }

  /**
   * handles FeatureServer requests
   *
   * TODO: refactor, this deleting stuff off of req left and right is very bad
   *       unfortunately requires a deep refactor as it's going on inside koop too
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.featureservice = function (req, res) {
    var userAndRepoExist = req.params.user && req.params.repo

    // yuck
    var callback = req.query.callback
    delete req.query.callback

    if (!userAndRepoExist) return controller.notFound(req, res)

    if (req.params.file) {
      // ew
      req.params.file = req.params.file.replace('.geojson', '')

      return Github.find(req.params.user, req.params.repo, req.params.file, req.query, function (err, data) {
        // no
        delete req.query.geometry
        delete req.query.where

        controller.processFeatureServer(req, res, err, data, callback)
      })
    }

    return Github.find(req.params.user, req.params.repo, null, req.query, function (err, data) {
      // why
      delete req.query.geometry
      delete req.query.where

      controller.processFeatureServer(req, res, err, data, callback)
    })
  }

  /**
   * handles tile requests
   *
   * TODO: refactor/remove... does this even work?
   *
   * @param {object} req - incoming request object
   * @param {object} res - outgoing response object
   */
  controller.tiles = function (req, res) {
    if (!Github.files.localDir) {
      return res.status(501).json({
        code: 501,
        message: 'Local Filesystem not configured. Please add a "data_dir" to the server config to support tiles'
      })
    }

    // aaugh
    var callback = req.query.callback
    delete req.query.callback

    var layer = req.params.layer || 0
    var file, jsonFile, key

    function _send (err, data) {
      if (err) {
        return res.status(400).json({
          code: 400,
          message: err.message
        })
      }

      req.params.key = key + ':' + layer

      if (req.query.style) {
        req.params.style = req.query.style
      }

      req.params.name = req.params.file

      Github.tileGet(req.params, data[layer], function (err, tile) {
        if (err) {
          var opts = {
            code: err.code || 500,
            message: err.message || 'Unknown error while creating the tile'
          }

          return res.status(opts.code).json(opts)
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

    function _sendImmediate (file) {
      if (req.params.format === 'pbf') {
        res.setHeader('content-encoding', 'deflate')
      }

      if (req.params.format === 'png' || req.params.format === 'pbf') {
        res.sendFile(file)
      } else {
        fs.readFile(file, function (err, data) {
          if (err) {
            return res.status(500).json({
              code: 500,
              message: err.message
            })
          }

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

      file = Github.files.localDir + '/tiles/'
      file += key + ':' + layer + '/' + req.params.format
      file += '/' + req.params.z + '/' + req.params.x + '/'
      file += req.params.y + '.' + req.params.format

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

      file = Github.files.localDir + '/tiles/'
      file += key + ':' + layer + '/' + req.params.format
      file += '/' + req.params.z + '/' + req.params.x + '/'
      file += req.params.y + '.' + req.params.format

      jsonFile = file.replace(/png|pbf|utf/g, 'json')

      // if the json file already exists, don't hit the db, just send the data
      if (fs.existsSync(jsonFile) && !fs.existsSync(file)) {
        _send(null, fs.readFileSync(jsonFile))
      } else if (!fs.existsSync(file)) {
        Github.find(req.params.user, req.params.repo, req.params.file, req.query, _send)
      } else {
        _sendImmediate(file)
      }
    } else {
      res.status(404).json({
        code: 404,
        message: 'Must specify at least a user and a repo'
      })
    }
  }

  return controller
}

module.exports = Controller
