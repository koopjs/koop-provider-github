/**
 * GeoJSON to convert into required Koop format
 * @param {object} input GeoJSON
 * @returns {object} standardized feature collection
 */
function translate (input) {
  // If input type is Feature, wrap in Feature Collection
  if (!input || input.type === 'Feature') return featureToFeatureCollection(input)

  // If it's neither a Feature or a FeatureCollection its a geometry.  Wrap in a Feature Collection
  if (input.type !== 'FeatureCollection') return geometryToFeatureCollection(input)

  // Or it is already a feature collection, so just return
  return input
}

/**
 * Wrap a GeoJSON feature in a feature collection
 * @param {object} feature
 */
function featureToFeatureCollection (feature) {
  return {
    type: 'FeatureCollection',
    features: [feature]
  }
}

/**
 * Convert a GeoJSON to geometry to a single-feature feature collection
 * @param {*} geometry
 */
function geometryToFeatureCollection (geometry) {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry,
      properties: {}
    }]
  }
}

module.exports = { translate, featureToFeatureCollection, geometryToFeatureCollection }
