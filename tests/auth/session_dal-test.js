'use strict';

let assert = require('chai').assert;
let sessionDAL = require('../../auth/session_dal');
let _ = require('underscore');
let config = require('../../config');

describe('auth/session', function() {
  it('is an object', function() {
    assert.isObject(sessionDAL);
  });

  describe('.create', function() {
    it('assigns an id and timestamp to the session', function(done) {
      sessionDAL.create({userId: '123'}).then(function(res) {
        assert.equal(1, res.result.inserted);
        assert.equal(1, res.result.generated_keys.length);
        assert.deepEqual({userId: '123'}, res.session.data);
        assert.isTrue(_.isDate(res.session.timestamp));
        assert.equal(res.session.id, res.result.generated_keys[0]);
        done();
      }).catch(done);
    });
  });

  describe('.isExpired', function() {
    it('returns false if the diff is less than expire timeout', function() {
      let currentTime = new Date(1400);
      let session = {
        'timestamp': new Date(1000)
      };
      assert.isFalse(sessionDAL.isExpired(session, 500, currentTime));
    });

    it('returns false if the diff is equal than the expire timeout', function() {
      let currentTime = new Date(1400);
      let session = {
        'timestamp': new Date(900)
      };
      assert.isFalse(sessionDAL.isExpired(session, 500, currentTime));
    });

    it('returns true if the diff is greater than the expire timeout', function() {
      let currentTime = new Date(1400);
      let session = {
        'timestamp': new Date(899)
      };
      assert.isTrue(sessionDAL.isExpired(session, 500, currentTime));
    });
  });

  describe('.touch', function() {
    it('rejects an error if no session is found', function(done) {
      sessionDAL.touch('123').then(function(result) {
        assert.isTrue(false);
      }).catch(function(err) {
        try {
          assert.isTrue(err instanceof sessionDAL.errors.SessionNotFoundError);
        } catch(err) {
          done(err);
        } finally {
          done();
        }
      });
    });

    it('rejects an error if the session has expired', function(done) {
      let currentTime = new Date(1000);
      sessionDAL.create({userId: '123'}, currentTime)
        .then(function(res) {
          let sessionId = res.session.id;
          return sessionDAL.touch(sessionId, 
            new Date(currentTime.getTime() + config.sessionTimeout + 1));
        })
        .catch(function(err) {
          try {
            assert.isTrue(err instanceof sessionDAL.errors.SessionExpiredError);
          } catch(err) {
            done(err);
          } finally {
            done();
          }
        });
    });

    it('removes the session from the database if it has expired', function() {
      
    });

    it('resolves to rethinkdb result if the session is updated', function() {
    });
  });
});