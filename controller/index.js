var fs = require('fs')
const path = require('path')
var crypto = require('crypto')
var Sm = require('sphericalmercator')
var merc = new Sm({ size: 256 })
var provider = require('koop-provider')
var request = require('request')
var pkg = require('../package.json')

/**
 * creates new github controller
 *
 * @param {object} model - instance of github model
 */
function githubController (model) {
  var ctrl = provider.controller()

  /**
   * handles unspecified 404 responses
   *
   * @param {object} req - incoming request
   * @param {object} res - outgoing response
   */
  ctrl.notFound = function (req, res) {
    ctrl.errorResponse({
      code: 404,
      message: 'Must specify a user, repo, and file'
    }, res)
  }

  /**
   * renders index view
   *
   * @param {object} req - incoming request
   * @param {object} res - outgoing response
   */
  ctrl.index = function (req, res) {
    res.render(path.join(__dirname, '/../views/index'), {
      baseUrl: req.baseUrl
    })
  }

  /**
   * renders preview route
   *
   * @param {object} req - incoming request
   * @param {object} res - outgoing response
   */
  ctrl.preview = function (req, res) {
    req.params.file = req.params.file.replace('.geojson', '')
    res.render(path.join(__dirname, '/../views/demo'), {
      user: req.params.user,
      repo: req.params.repo,
      file: req.params.file,
      baseUrl: req.baseUrl
    })
  }

  /**
   * returns current github rate limit
   *
   * @param {object} req - incoming request
   * @param {object} res - outgoing response
   */
  ctrl.rate_limit = function (req, res) {
    var options = {
      url: 'https://api.github.com/rate_limit',
      headers: {
        'User-Agent': 'koop-github/' + pkg.version
      }
    }

    if (model.config.ghtoken) {
      options.qs = { access_token: model.config.ghtoken }
    }

    request(options, function (err, response, body) {
      if (err) {
        return ctrl.errorResponse({
          code: response.statusCode,
          message: err.message
        }, res)
      }

      res.jsonp(JSON.parse(body))
    })
  }

  /**
   * drops the cache for an item
   *
   * @param {object} req - incoming request
   * @param {object} res - outgoing response
   */
  ctrl.drop = function (req, res) {
    model.drop({
      user: req.params.user,
      repo: req.params.repo,
      file: req.params.file,
      query: req.query
    }, function (err, itemJson) {
      if (err) {
        return res.status(400).send({
          code: 400,
          message: err.message
        })
      }

      res.jsonp(itemJson)
    })
  }

  /**
   * returns geojson for a specific user/repo/file path
   *
   * @param {object} req - incoming request
   * @param {object} res - outgoing response
   */
  ctrl.getRepo = function (req, res) {
    // method to respond to model finds
    function _send (err, data) {
      if (err) return ctrl.errorResponse({ message: err.message }, res)
      if (!data) return ctrl.errorResponse(null, res)
      if (!req.params.format) return res.jsonp(data)
      if (!model.files.localDir) {
        return ctrl.errorResponse({
          code: 501,
          message: 'No file system configured for exporting data'
        }, res)
      }

      if (req.params.format === 'png') {
        return ctrl.errorResponse({ message: 'Thumbnail generation no longer supported' }, res)
      }

      // change geojson to json - wat
      req.params.format = req.params.format.replace('geojson', 'json')

      var dir = ['github', req.params.user, req.params.repo, req.params.file].join(':')
      // build the file key as an MD5 hash that's a join on the params and look for the file
      var toHash = JSON.stringify(req.params) + JSON.stringify(req.query)
      var key = crypto.createHash('md5').update(toHash).digest('hex')
      var path = ['files', dir].join('/')
      var fileName = key + '.' + req.params.format

      return model.files.exists(path, fileName, function (exists, path) {
        if (exists) {
          if (path.substr(0, 4) === 'http') {
            return res.redirect(path)
          }
          return res.sendFile(path)
        }

        model.exportToFormat(req.params.format, dir, key, data[0], {}, function (err, file) {
          if (err) return ctrl.errorResponse({ message: err.message }, res)
          res.sendFile(file)
        })
      })
    }

    if (req.params.user && req.params.repo && req.params.file) {
      // argh
      req.params.file = req.params.file.replace('.geojson', '')
      return model.find({
        user: req.params.user,
        repo: req.params.repo,
        file: req.params.file,
        query: req.query
      }, _send)
    }

    ctrl.notFound(req, res)
  }

  /**
   * handles FeatureServer requests
   *
   * TODO: refactor, this deleting stuff off of req left and right is very bad
   *       unfortunately requires a deep refactor as it's going on inside koop too
   *
   * @param {object} req - incoming request
   * @param {object} res - outgoing response
   */
  ctrl.featureservice = function (req, res) {
    var userAndRepoExist = req.params.user && req.params.repo
    if (!userAndRepoExist) return ctrl.notFound(req, res)

    if (req.params.file) {
      // ew
      req.params.file = req.params.file.replace('.geojson', '')
    }

    return model.find({
      user: req.params.user,
      repo: req.params.repo,
      file: req.params.file,
      query: req.query
    }, function (err, data) {
      if (err) return ctrl.errorResponse({ message: err.message }, res)

      // grumble
      delete req.query.geometry
      delete req.query.where

      ctrl.processFeatureServer(req, res, data)
    })
  }

  /**
   * handles tile requests
   *
   *
   * @param {object} req - incoming request
   * @param {object} res - outgoing response
   */
  ctrl.tiles = function (req, res) {
    if (!model.files.localDir) {
      return ctrl.errorResponse({
        code: 501,
        message: 'Local filesystem not configured. Please add "data_dir" property to koop config to support tiles'
      }, res)
    }

    var layer = req.params.layer || 0
    var file, jsonFile, key

    function _send (err, data) {
      if (err) {
        return ctrl.errorResponse({
          code: 400,
          message: err.message
        }, res)
      }

      req.params.key = key + ':' + layer

      if (req.query.style) {
        req.params.style = req.query.style
      }

      req.params.name = req.params.file

      model.tileGet(req.params, data[layer], function (err, tile) {
        if (err) {
          return ctrl.errorResponse({
            code: err.code || 500,
            message: err.message || 'Unknown error while creating the tile'
          }, res)
        }

        if (req.params.format === 'pbf') {
          res.setHeader('content-encoding', 'deflate')
        }

        if (req.params.format === 'png' ||
            req.params.format === 'pbf' ||
            typeof tile === 'string') {
          return res.sendFile(tile)
        }

        res.jsonp(tile)
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
        return res.sendFile(file)
      }

      fs.readFile(file, function (err, data) {
        if (err) return ctrl.errorResponse({ message: err.message }, res)
        var json = JSON.parse(data)
        res.jsonp(json)
      })
    }

    if (req.params.user && req.params.repo && req.params.file) {
      req.params.file = req.params.file.replace('.geojson', '')
      key = ['github', req.params.user, req.params.repo, req.params.file].join(':')

      file = model.files.localDir + '/tiles/'
      file += key + ':' + layer + '/' + req.params.format
      file += '/' + req.params.z + '/' + req.params.x + '/'
      file += req.params.y + '.' + req.params.format

      jsonFile = file.replace(/png|pbf|utf/g, 'json')

      // if the json file alreadty exists, dont hit the db, just send the data
      if (fs.existsSync(jsonFile) && !fs.existsSync(file)) {
        _send(null, [JSON.parse(fs.readFileSync(jsonFile))])
      } else if (!fs.existsSync(file)) {
        var factor = 0.35
        req.query.simplify = ((Math.abs(req.query.geometry.xmin - req.query.geometry.xmax)) / 256) * factor
        model.find({
          user: req.params.user,
          repo: req.params.repo,
          file: req.params.file,
          query: req.query
        }, _send)
      } else {
        _sendImmediate(file)
      }
    } else if (req.params.user && req.params.repo) {
      key = ['github', req.params.user, req.params.repo].join(':')

      file = model.files.localDir + '/tiles/'
      file += key + ':' + layer + '/' + req.params.format
      file += '/' + req.params.z + '/' + req.params.x + '/'
      file += req.params.y + '.' + req.params.format

      jsonFile = file.replace(/png|pbf|utf/g, 'json')

      // if the json file already exists, don't hit the db, just send the data
      if (fs.existsSync(jsonFile) && !fs.existsSync(file)) {
        _send(null, fs.readFileSync(jsonFile))
      } else if (!fs.existsSync(file)) {
        model.find({
          user: req.params.user,
          repo: req.params.repo,
          file: req.params.file,
          query: req.query
        }, _send)
      } else {
        _sendImmediate(file)
      }
    } else {
      ctrl.errorResponse({
        code: 404,
        message: 'Must specify at least a user and a repo'
      }, res)
    }
  }

  return ctrl
}

module.exports = githubController
