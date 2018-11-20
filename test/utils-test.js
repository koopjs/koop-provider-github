var test = require('tape')
var { featureToFeatureCollection, geometryToFeatureCollection, translate } = require('../utils')

test('utils: featureToFeatureCollection', function (t) {
  t.plan(1)
  const result = featureToFeatureCollection('test')

  t.deepEquals(result, {
    type: 'FeatureCollection',
    features: ['test']
  }, 'returns expected result')
})

test('utils: geometryToFeatureCollection', function (t) {
  t.plan(1)
  const result = geometryToFeatureCollection('test')

  t.deepEquals(result, {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: 'test',
      properties: {}
    }]
  }, 'returns expected result')
})

test('utils: translate feature', function (t) {
  t.plan(1)
  const feature = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Point',
      'coordinates': [
        -144,
        62
      ]
    }
  }
  const result = translate(feature)

  t.deepEquals(result, {
    type: 'FeatureCollection',
    features: [feature]
  }, 'returns expected result')
})

test('utils: translate geometry', function (t) {
  t.plan(1)
  const geometry = {
    'type': 'Point',
    'coordinates': [
      -144,
      62
    ]
  }
  const result = translate(geometry)

  t.deepEquals(result, {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry,
      properties: {}
    }]
  }, 'returns expected result')
})

test('utils: translate feature collection', function (t) {
  t.plan(1)
  const featureCollection = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -144,
            62
          ]
        }
      }
    ]
  }
  const result = translate(featureCollection)

  t.deepEquals(result, featureCollection, 'returns expected result')
})
