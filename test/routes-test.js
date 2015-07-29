var test = require('tape')
var request = require('supertest')
var koop = require('koop')({
  data_dir: __dirname + '/output/'
})
var kooplib = require('koop/lib')
var provider = require('../index.js')
var model = new provider.model(kooplib) // eslint-disable-line
var controller = new provider.controller(model, kooplib.BaseController) // eslint-disable-line
koop._bindRoutes(provider.routes, controller)

test('routes: invalid URL', function (t) {
  request(koop)
    .get('/github/blarg')
    .end(function (err, res) {
      t.error(err, 'does not error')
      t.equal(res.statusCode, 404, 'returns 404 status code')
      t.end()
    })
})

test('routes: valid URL', function (t) {
  request(koop)
    .get('/github/colemanm/hurricanes/fl_2004_hurricanes')
    .end(function (err, res) {
      t.error(err, 'does not error')
      t.equal(res.statusCode, 200, 'returns 200 status code')
      t.end()
    })
})

test('routes: preview', function (t) {
  request(koop)
    .get('/github/colemanm/hurricanes/fl_2004_hurricanes/preview')
    .end(function (err, res) {
      t.error(err, 'does not error')
      t.equal(res.statusCode, 200, 'returns 200 status code')
      t.end()
    })
})

test('routes: feature server index', function (t) {
  request(koop)
    .get('/github/chelm/geodata/us-states/FeatureServer')
    .end(function (err, res) {
      t.error(err, 'does not error')
      t.equal(res.statusCode, 200, 'returns 200 status code')
      t.end()
    })
})

test('routes: feauture server 0', function (t) {
  request(koop)
    .get('/github/colemanm/hurricanes/fl_2004_hurricanes/FeatureServer/0')
    .end(function (err, res) {
      t.error(err, 'does not error')
      t.equal(res.statusCode, 200, 'returns 200 status code')
      t.end()
    })
})

test('routes: feature server 0 query', function (t) {
  request(koop)
    .get('/github/colemanm/hurricanes/fl_2004_hurricanes/FeatureServer/0/query')
    .end(function (err, res) {
      t.error(err, 'does not error')
      t.equal(res.statusCode, 200, 'returns 200 status code')
      t.end()
    })
})
