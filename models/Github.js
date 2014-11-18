var Geohub = require('geohub'),
  BaseModel = require('koop-server/lib/BaseModel.js');

var token;
if (process.env.KOOP_GITHUB_TOKEN){
  token = process.env.KOOP_GITHUB_TOKEN;
}
else {
  token = null;
  console.warn('No KOOP_GITHUB_TOKEN environment variable specified when launching app');
}

var Github = function( koop ){

  var github = {};
  github.__proto__ = BaseModel( koop );

  github.find = function( user, repo, file, options, callback ){
    file = ( file ) ? file.replace(/::/g, '/') : null;

    var key = [ user, repo, file].join('/'),
      type = 'Github';

    koop.Cache.get( type, key, options, function(err, entry ){
      if ( err){
        Geohub.repo( user, repo, file, token, function( err, geojson ){
          if ( !geojson || err ){
            callback( 'No geojson found', null );
          } else {

            if ( !geojson.length ){
              geojson = [ geojson ];
            }

            var _totalLayer = geojson.length,
              finalJson = [];
            // local method to collect layers and send them all
            var _send = function(data){
              finalJson.push(data);
              if ( finalJson.length == _totalLayer ) {
                callback(null, finalJson);
              }
            };

            geojson.forEach(function(layer, i){
              if (!layer.name) {
                layer.name = file.replace('.geojson','');
              }
              koop.Cache.insert( type, key, layer, i, function( err, success){
                if ( success ) {
                  _send(layer);
                } //callback( null, geojson );
              });
            });
          }
        });
      } else {
        callback( null, entry );
      }
    });
  };

  // compares the sha on the cached data and the hosted data
  // this method name is special reserved name that will get called by the cache model
  /*github.checkCache = function(key, data, options, callback){
    var json = data;
    key = key.split('/');
    var user = key.shift();
    var repo = key.shift();
    var path = key.join('/') + '.geojson';

    Geohub.repoSha(user, repo, path, config.token, function(err, sha){

      if ( sha == json[0].sha ){
        callback(null, false);
      } else {
        Geohub.repo( user, repo, path, config.token, function( err, geojson ){
          callback(null, geojson );
        });
      }
    });
  };*/

  return github;

};

module.exports = Github;
