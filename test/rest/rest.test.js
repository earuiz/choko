var assert = require('assert');
var request = require('supertest');
var userHelper = require('../lib/userHelper');

// Util variables.
var testingUrl = 'http://localhost:3200';

describe('REST extension', function(done) {

  it('should create an item via POST', function(done) {
    var application = this.getApp();
    userHelper.createUser(application, ['test-role'], function(error, user, credentials) {
      request(testingUrl)
        .post('/rest/testType')
        .auth(credentials.username, credentials.password)
        .send({
          name: 'a-test',
          title: 'A test'
        })
        .expect(200, done);
    });
  });

  it('should update an item via POST', function(done) {
    var application = this.getApp();
    userHelper.createUser(application, ['test-type-manager'], function(error, user, credentials) {
      // Create item.
      request(testingUrl)
        .post('/rest/testType')
        .auth(credentials.username, credentials.password)
        .send({
          name: 'a-test',
          title: 'A test'
        })
        .expect(200, function(error, response) {
          if (error) {
            throw error;
          }
          var result = response.body.data;

          // Update item.
          request(testingUrl)
            .post('/rest/testType/' + result.id)
            .auth(credentials.username, credentials.password)
            .send({
              name: 'a-test-edited',
              title: 'A test updated'
            })
            .expect(200, done);
        });
    });
  });

  it('shouldn\'t update an item via POST on main endpoint', function(done) {
    var application = this.getApp();
    userHelper.createUser(application, ['test-type-manager'], function(error, user, credentials) {
      // Create item.
      request(testingUrl)
        .post('/rest/testType')
        .auth(credentials.username, credentials.password)
        .send({
          name: 'a-test',
          title: 'A test'
        })
        .expect(200, function(error, response) {
          if (error) {
            throw error;
          }
          var result = response.body.data;

          // Attempt to create an item passing the key property.
          request(testingUrl)
            .post('/rest/testType')
            .auth(credentials.username, credentials.password)
            .send({
              id: result.id,
              name: 'a-test-edited',
              title: 'A test updated'
            })
            .expect(200, function(error, response) {
              // Make sure a new item was created.
              assert.notEqual(result.id, response.body.data.id);
              done();
            });
        });
    });
  });

  it('should return 404 error if type does not exist', function(done) {
    request(testingUrl)
      .get('/rest/inexistentType')
      .expect(404, done);
  });

  it('shouldn\'t create an item with fields not in type schema', function(done) {
    var application = this.getApp();
    userHelper.createUser(application, ['test-role'], function(error, user, credentials) {
      request(testingUrl)
        .post('/rest/testType')
        .auth(credentials.username, credentials.password)
        .send({
          name: 'a-test',
          title: 'A test',
          outOfSchema: 'A value for a field not in type schema.'
        })
        .expect(200, function(error, response) {
          assert.ok(!('outOfSchema' in response.body.data));
          done();
        });
    });
  });

  it('should authenticate on REST with Basic authentication', function(done) {
    var application = this.getApp();
    var User = application.type('user');

    var userData = userHelper.sample();
    userData['roles'].push('test-role');

    User.validateAndSave(userData, function(error, newAccount) {
      if (error) {
        return assert.fail('error saving');
      }

      request(testingUrl)
        .get('/rest/testType')
        .auth(userData.username, userData.password)
        .expect(200, done);
    });
  });

  it('should not be able to run denied REST requests', function(done) {
    var application = this.getApp();
    var User = application.type('user');

    var userData = userHelper.sample();
    userData['roles'].push('test-role');

    User.validateAndSave(userData, function(error, newAccount) {
      if (error) {
        return assert.fail('error saving');
      }

      request(testingUrl)
        .delete('/rest/testType')
        .auth(userData.username, userData.password)
        .expect(403, done);
    });
  });

  it('should be able to run allowed REST requests as anonymous', function(done) {
    request(testingUrl)
      .get('/rest/testType')
      .expect(200, done);
  });

  it('should not be able to run denied REST requests as anonymous', function(done) {
    request(testingUrl)
      .post('/rest/testType')
      .send({name: 'test'})
      .expect(403, done);
  });

});
