/* global before, after, describe, it */

var should = require('should')
var sinon = require('sinon')
var koop = require('koop/lib')
var Model = require('../models/Github.js')
var repo = 'geodata'
var user = 'chelm'
var file = 'co-river-basin'
var github

before(function (done) {
  var config = {}
  config.data_dir = __dirname + '/output/'
  koop.config = config
  koop.log = new koop.Logger({logfile: './test.log'})

  koop.Cache = new koop.DataCache(koop)
  koop.Cache.db = koop.LocalDB
  koop.Cache.db.log = koop.log

  github = new Model(koop)
  done()
})

describe('Github Model', function () {
  describe('when caching a github file', function () {
    before(function (done) {
      sinon.stub(github.geohub, 'repo', function (user, repo, file, token, callback) {
        callback(null, {})
      })

      sinon.stub(koop.Cache, 'get', function (type, id, options, callback) {
        callback(true)
      })

      sinon.stub(koop.Cache, 'insert', function (type, id, geojson, layer, callback) {
        callback(null, true)
      })

      done()
    })

    after(function (done) {
      koop.Cache.get.restore()
      koop.Cache.insert.restore()
      github.geohub.repo.restore()
      done()
    })

    it('should call get, insert and Geohubs repo', function (done) {
      github.find(user, repo, file, {}, function (err, data) {
        should.not.exist(err)
        github.geohub.repo.called.should.equal(true)
        koop.Cache.get.called.should.equal(true)
        koop.Cache.insert.called.should.equal(true)
        done()
      })
    })

  })
})
