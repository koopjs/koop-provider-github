var pkg = require('./package')

var provider = {
  name: 'Github',
  model: require('./models/Github'),
  controller: require('./controller'),
  routes: require('./routes'),
  status: {
    version: pkg.version
  }
}

module.exports = provider
