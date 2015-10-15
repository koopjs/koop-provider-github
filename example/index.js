var app = require('express')()
var koop = require('koop')({
  'db': {
    'conn': 'postgres://localhost/koopdev'
  },
  'ghtoken': process.env.KOOP_GITHUB_TOKEN
})
var github = require('../')

koop.register(github)

app.set('json spaces', 2)
app.use('/koop/', koop)

app.get('/', function (req, res) {
  res.redirect('/koop/github')
})

app.listen(process.env.PORT || 1337, function () {
  console.log('Koop Github example server listening at %d', this.address().port)
})
