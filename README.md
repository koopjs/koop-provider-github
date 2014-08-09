# koop-github

`koop-github` is an source provider for the [Koop](https://github.com/esri/koop) server. It can connect to GitHub repositories serving GeoJSON as well as Gists. 


## To install

Source providers such as `koop-github` require that you first install koop:

```bash
git clone git@github.com:Esri/koop.git
cd koop
npm install 
# copy and edit the config file
cp config/default.yml.example config/default.yml
```

you can then install `koop-github`. 

```bash
npm install https://github.com/chelm/koop-github/tarball/master

# start the koop server
node server.js 
```

## Usage

Once installed, you can then visit Github repositories using the pattern:

`/github/{organization name}/{repository name}/{folder::path::to::geojson}/preview`

so for example:

`/github/CityOfPhiladelphia/phl-open-geodata/school_facilities::philadelphiaschool_facilities201302/preview`
