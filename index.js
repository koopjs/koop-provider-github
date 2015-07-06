var provider = {
  name: 'Github',
  model: require('./models/Github'),
  controller: require('./controller'),
  routes: require('./routes')
}

module.exports = provider
