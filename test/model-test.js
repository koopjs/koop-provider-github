var should = require('should'),
  config = require('config'),
  koopserver = require('koop-server')(config); 

global.config = config;

var repo = 'geodata',
  user = 'chelm',
  file = 'co-river-basin';
  key = [repo, user, file].join('/');

before(function (done) {
  global['Github'] = require('../models/Github.js');
  done();
});

describe('Github Model', function(){


    describe('when caching a github file', function(){
      before(function(done ){
        // connect the cache
        Cache.db = PostGIS.connect( config.db.postgis.conn );
        done();
      });

      afterEach(function(done){
        done();
      });
    
      it('should find the repo and return the data', function(done){
        Github.find(user, repo, file, {}, function(err, data){
          should.not.exist(err);
          should.exist(data);
          data.length.should.equal(1);
          done();
        });
      });

    });

});

