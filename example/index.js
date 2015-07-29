var app = require('express')()
var koop = require('koop')({
  'db': {
    'conn': 'postgres://localhost/koopdev'
  },
  'ghtoken': process.env.KOOP_GHTOKEN
})
var github = require('koop-github')
var pgCache = require('koop-pgcache')

koop.register(github)
koop.registerCache(pgCache)

app.use(koop)

app.get('/', function (req, res) {
  res.redirect('/github')
})

app.listen(process.env.PORT || 1337, function () {
  console.log('Koop server listening at %d', this.address().port)
})
