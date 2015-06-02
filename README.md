# koop-github

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/koop-github.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koop-github
[travis-image]: https://img.shields.io/travis/koopjs/koop-github.svg?style=flat-square
[travis-url]: https://travis-ci.org/koopjs/koop-github

Github provider for [Koop](https://github.com/esri/koop).

Take GeoJSON from a Github repository and serve it as an ArcGIS Feature Service, CSV, KML, or Shapefile.

# Install

Source providers such as `koop-github` require that you first install koop. For information on using Koop, see https://github.com/esri/koop.

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

## License

Copyright 2015 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](license.txt) file.

[](Esri Language: JavaScript)
