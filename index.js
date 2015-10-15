var pkg = require('./package.json')
var provider = require('koop-provider')

var github = provider({
  name: 'github',
  version: pkg.version,
  model: require('./model'),
  controller: require('./controller'),
  routes: require('./routes')
})

module.exports = github
