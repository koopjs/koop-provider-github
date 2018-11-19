const github = {
  type: 'provider',
  name: 'github',
  Model: require('./model'),
  version: require('./package.json').version
}

module.exports = github
