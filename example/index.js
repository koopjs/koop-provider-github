var morgan = require('morgan')
var errorHandler = require('errorhandler')
var app = require('express')()
var koop = require('koop')({
  'ghtoken': process.env.KOOP_GITHUB_TOKEN
})
var github = require('../')

koop.register(github)

app.set('port', process.env.PORT || 1337)
app.set('json spaces', 2)

if (app.get('env') === 'production') {
  app.use(morgan())
} else {
  app.use(morgan('dev'))
  app.use(errorHandler())
}

app.use('/koop/', koop)

app.get('/', function (req, res) {
  res.redirect('/koop/github')
})

app.listen(app.get('port'), function () {
  console.log('koop-github example server listening at %d', this.address().port)
})
