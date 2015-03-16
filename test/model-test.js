var should = require('should'),
  config = require('config'),
  koop = require('koop/lib');

var repo = 'geodata',
  user = 'chelm',
  file = 'co-river-basin';
  key = [repo, user, file].join('/');

before(function(done){
  // setup koop 
  koop.Cache.db = koop.LocalDB;
  var data_dir = __dirname + '/output/';
  koop.Cache.data_dir = data_dir;
  Github = new require('../models/Github.js')( koop );
  done();
});

describe('Github Model', function(){


    describe('when caching a github file', function(){

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

