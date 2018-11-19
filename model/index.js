const config = require('config')
const _ = require('lodash')
const geohub = require('geohub')
const { translate } = require('../utils')
const ghtoken = config.ghtoken || process.env.KOOP_GITHUB_TOKEN || null

if (!ghtoken) console.log('[github provider] No github access token configured. Github API requests may be rate limited.')

/**
 * Model constructor
 */
function Model () {}

Model.prototype.getData = function (req, callback) {
  // Parse the id param to get user, repo, and path
  const githubPath = req.params.id.split('::')
  const user = githubPath[0]
  const repo = githubPath[1]
  const path = githubPath.slice(2).join('/')

  if (!repo || !path) callback(new Error('The "id" parameter must be of form "user::repo::path::to::file"'))

  // Handle request to github with geohub
  geohub.repo({
    user,
    repo,
    path,
    token: ghtoken
  }, (err, data) => {
    if (err) return callback(err)

    // Translate to uniform GeoJSON Feature Collection
    const geojson = translate(data)

    // Add metadata
    geojson.metadata = geojson.metadata || {}
    geojson.metadata.title = geojson.metadata.name = githubPath[githubPath.length - 1]
    geojson.metadata.description = `GeoJSON from https://raw.github.com/${user}/${repo}/master/${path}.geojson`
    geojson.metadata.geometryType = _.get(geojson, 'features[0].geometry.type')
    callback(null, geojson)
  })
}

module.exports = Model
