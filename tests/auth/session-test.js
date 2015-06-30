'use strict';

let assert = require('chai').assert;
let sessionDAL = require('../../auth/session_dal');

describe('auth/session', function() {
  it('is an object', function() {
    assert.isObject(sessionDAL);
  });

  describe('.create', function() {
    it('assigns an id and timestamp to the session', function(done) {
      sessionDAL.create({userId: '123'}).then(function(result, session) {
        assert.equal(1, result.inserted);
        assert.deepEqual(sessionData, session.data);
        assert.isString(session.id);
        assert.isDate(session.timestamp);
        done();
      }, function(err) {
        throw err;
        done();
      });
    });
  });
});