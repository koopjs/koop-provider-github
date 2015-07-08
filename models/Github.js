var Geohub = require('geohub');

var Github = function( koop ){

  if ( !koop.config.ghtoken ){
    console.warn('No Github Token in config. This may cause problems accessing data.');
  }

  github = new koop.BaseModel( koop );

  // we can easily test calls to the geohub this way
  github.geohub = Geohub;
  
  github.find = function( user, repo, file, options, callback ){
    file = ( file ) ? file.replace(/::/g, '/') : null;
  
    var key = [ user, repo, file].join('/'),
      type = 'Github';
    
    koop.Cache.get( type, key, options, function(err, entry) {
      if (err){
        github.geohub.repo( user, repo, file, koop.config.ghtoken, function( err, geojson ){
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
  
    Geohub.repoSha(user, repo, path, koop.config.ghtoken, function(err, sha){
      
      if ( sha == json[0].sha ){
        callback(null, false);
      } else {
        Geohub.repo( user, repo, path, koop.config.ghtoken, function( err, geojson ){
          callback(null, geojson );
        });
      }
    });
  };*/


   // drops the item from the cache
  github.drop = function( user, repo, file, options, callback ){
    var key = [user, repo, file].join('/');
    var type = 'Github';
    var dir = [ type.toLowerCase(), user, repo, file].join(':');
    koop.Cache.remove(type, key, options, function(err, res){
      koop.files.removeDir( 'files/' + dir, function(err, res){
        koop.files.removeDir( 'tiles/'+ dir, function(err, res){
          koop.files.removeDir( 'thumbs/'+ dir, function(err, res){
            callback(err, true);
          });
        });
      });
    });
  };

  return github;

};

module.exports = Github;
