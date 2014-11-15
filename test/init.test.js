var Application = require('../lib/application');
var async = require('async');
var path = require('path');
var app;

before(function(done) {
  Application.bootstrap(path.join(__dirname, '/applications/test-app'), 3200, function (testApp) {
    app = testApp;
    done();
  });

  this.getApp = function() {
    return app;
  };
});

beforeEach(function(done) {
  var app = this.getApp();

  var droppers = Object.keys(app.collections).map(function (collection) {
    return function (next) {
      app.collections[collection].drop(next);
    };
  });

  async.parallel(droppers, function () {
    done();
  });
});
