# koop-github

> Github provider for [Koop](https://github.com/koopjs/koop)

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/koop-github.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koop-github
[travis-image]: https://img.shields.io/travis/koopjs/koop-github.svg?style=flat-square
[travis-url]: https://travis-ci.org/koopjs/koop-github

Take GeoJSON from a Github repository and serve it as an ArcGIS Feature Service, CSV, KML, or Shapefile.

## Install

Koop providers require that you first install Koop. For information on using Koop, see https://github.com/koopjs/koop.

You can add `koop-github` to your Koop server's dependencies by installing it with npm and adding it to your package.json like so:

```
npm install koop-github --save
```

## Usage

Make sure your koop configuration includes a `ghtoken` key if you need to access private repositories.

```js
var config = {
  'ghtoken': 'XXXXXX'
};

var koop = require('koop')(config);
var koopGithub = require('koop-github');

koop.register(koopGithub);

var express = require('express');
var app = express();

app.use(koop);

app.listen(process.env.PORT || 1337, function () {
  console.log("Listening at http://%s:%d/", this.address().address, this.address().port);
});
```

Once `koop-github` is registered as provider and you've restarted your Koop server, you can preview GeoJSON files in Github repositories using this pattern:

`/github/{organization name}/{repository name}/{folder::path::to::geojson}/preview`

so for example:

`/github/CityOfPhiladelphia/phl-open-geodata/school_facilities::philadelphiaschool_facilities201302/preview`

## Testing

`koop-github` uses [mocha](http://mochajs.org/) to run tests. Running `npm install` and `npm test` locally should allow you to get the test suite running without any further configuration.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/Esri/contributing).

## License

[Apache 2.0](LICENSE)
