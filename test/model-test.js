const test = require('tape')
const Model = require('../model')
const model = new Model()
const nock = require('nock')

test('should properly fetch from the API and translate features', t => {
  t.plan(7)

  const featureCollection = require('./fixtures/raw.json')
  nock('https://api.github.com')
    .get('/repos/test-org/geodata/contents/?ref=master')
    .reply(200, JSON.stringify(require('./fixtures/contents.json')))

  nock('https://api.github.com')
    .get('/repos/test-org/geodata/contents/map.geojson?ref=master')
    .reply(200, JSON.stringify(require('./fixtures/api.json')))

  nock('https://raw.github.com')
    .get('/test-org/geodata/master/map.geojson?ref=master')
    .reply(200, JSON.stringify(featureCollection))

  model.getData({ params: { id: 'test-org::geodata::map' } }, (err, geojson) => {
    t.notOk(err, 'no error')
    t.deepEquals(geojson.features, featureCollection.features, 'features found')
    t.ok(geojson.metadata, 'metdata added')
    t.equals(geojson.metadata.title, 'map', 'set metadata title')
    t.equals(geojson.metadata.name, 'map', 'set metadata name')
    t.equals(geojson.metadata.description, `GeoJSON from https://raw.github.com/test-org/geodata/master/map.geojson`, 'set metadata description')
    t.equals(geojson.metadata.geometryType, 'Point', 'set metadata geometry')
  })
})
