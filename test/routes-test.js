var should = require('should'),
  request = require('supertest'),
  config = require('config'),
  koop = require('koop')(config),
  kooplib = require('koop/lib');

before(function(done){
  var provider = require('../index.js');
  var model = new provider.model( kooplib );
  var controller = new provider.controller( model, kooplib.BaseController );
  koop._bindRoutes( provider.routes, controller );
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
          .get('/github/chelm/geodata/us-states/FeatureServer')
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

