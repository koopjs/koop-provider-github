var should = require('should'),
  config = require('config'),
  koopserver = require('koop-server')(config); 

before(function (done) {
  key = 'test/repo/file';
  snowKey = 'chelm/geodata/snow';
  repoData = require('./fixtures/repo.geojson');
  snowData = require('./fixtures/snow.geojson');
  //PostGIS = require('../../../api/models/PostGIS.js');
  //global['github'] = require('../../../api/providers/github/models/Github.js');
  //Cache = require('../../helpers/Cache.js');
  
  done();
});

describe('Github Model', function(){


    describe('when caching a github file', function(){
      before(function(done ){
        console.log('before', config.db.postgis.conn);
        // connect the cache
        Cache.db = PostGIS.connect( config.db.postgis.conn );
        done();
      });

      afterEach(function(done){
        Cache.remove('repo', key, {layer: 0}, function( err, d ){
          done();
        });
      });
    
      it('should error when missing a key', function(done){
        done();
      });

    });

});

