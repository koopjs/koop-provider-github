const github = {
  type: 'provider',
  name: 'github',
  Model: require('./model'),
  //  Controller: require('./controller'),
  //  routes: require('./routes'),
  version: require('./package.json').version
}

module.exports = github
