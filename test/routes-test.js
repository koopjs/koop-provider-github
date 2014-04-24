var should = require('should'),
  request = require('supertest'),
  config = require('config'),
  koop = require('koop-server')(config);

global.config = config;

before(function (done) {
    Cache.db = PostGIS.connect( config.db.postgis.conn );
    try { koop.register(require("../index.js")); } catch(e){ console.log('Error require ../index', e); }
    //console.log(koop)
    done(); 
});

describe('Koop Routes', function(){

    describe('/github/colemanm/hurricanes/fl_2004_hurricanes', function() {
      it('should return 200', function(done) {
        request(koop)
          .get('/github/colemanm/hurricanes/fl_2004_hurricanes')
          .end(function(err, res){
            res.should.have.status(200);
            done();
          });
      });
    });

    describe('/github/blarg/', function() {
      it('should return 404', function(done) {
        request(koop)
          .get('/github/blarg')
          .end(function(err, res){
            res.should.have.status(404);
            done();
        });
      });
    });

    describe('/github/preview', function() {
      it('should return 200', function(done) {
        request(koop)
          .get('/github/colemanm/hurricanes/fl_2004_hurricanes/preview')
          .end(function(err, res){
            res.should.have.status(200);
            done();
        });
      });
    });

    describe('/github/colemanm/hurricanes/fl_2004_hurricanes', function() {
      it('should return 200', function(done) {
        request(koop)
          .get('/github/colemanm/hurricanes/fl_2004_hurricanes')
          .end(function(err, res){
            res.should.have.status(200);
            done();
        });
      });
    });

    describe('/github/colemanm/hurricanes/fl_2004_hurricanes/FeatureServer', function() {
      it('should return 200', function(done) {
        request(koop)
          .get('/github/colemanm/hurricanes/fl_2004_hurricanes/FeatureServer')
          .end(function(err, res){
            res.should.have.status(200);
            done();
        });
      });
    });

    describe('/github/colemanm/hurricanes/fl_2004_hurricanes/FeatureServer/0', function() {
      it('should return 200', function(done) {
        request(koop)
          .get('/github/colemanm/hurricanes/fl_2004_hurricanes/FeatureServer/0')
          .end(function(err, res){
            res.should.have.status(200);
            done();
        });
      });
    });

    describe('/github/colemanm/hurricanes/fl_2004_hurricanes/FeatureServer/0/query', function() {
      it('should return 200', function(done) {
        request(koop)
          .get('/github/colemanm/hurricanes/fl_2004_hurricanes/FeatureServer/0/query')
          .end(function(err, res){
            res.should.have.status(200);
            done();
        });
      });
    });

});

