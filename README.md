# koop-github

`koop-github` is an input source provider for the [Koop](https://github.com/esri/koop) server. It can connect to GitHub repositories serving GeoJSON as well as Gists which are then output in other formats such as GeoServices (FeatureServices), CSV, KML, or Shapefile.


## To install

Source providers such as `koop-github` require that you first install koop:

```bash
git clone git@github.com:Esri/koop.git
cd koop
npm install
```

you can then install `koop-github`.

```bash
npm install https://github.com/chelm/koop-github/tarball/master

# start the koop server
node server.js
```

in order to avoid hitting cap on amount of anonymous requests that can be made to Github, create a [token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) and supply it as an environment variable when launching koop

```bash
# start the koop server
KOOP_GITHUB_TOKEN=xxx node server.js
```

## Usage

Once installed, you can then visit Github repositories using the pattern:

`/github/{organization name}/{repository name}/{folder::path::to::geojson}/preview`

so for example:

`/github/CityOfPhiladelphia/phl-open-geodata/school_facilities::philadelphiaschool_facilities201302/preview`

## Licensing
Copyright 2014 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt]( https://raw.github.com/Esri/koop/master/LICENSE) file.

[](Esri Language: JavaScript)