'use strict';

let rethinkDB = require('../env/rethinkdb');
let r = require('rethinkdb');
let config = require('../config.json');
let customErrors = require('../errors/custom_errors');

// Object holding the DAL for interacting with sessions
let sessionDAL = {};

sessionDAL.errors = customErrors({
  SessionExpiredError: function(sessionId) {
    return `Session (${sessionId}) expired.`;
  },
  SessionNotFoundError: function(sessionId) {
    return `Session (${sessionId}) not found.`;
  }
});

// Inserts the sessionData in the database resolving to a map with
// 'result' -> result returned from rethinkdb
// 'session' -> document stored in the database with the id
sessionDAL.create = function createSession(sessionData, currentTimestamp) {
  return new Promise(function(resolve, reject) {
    rethinkDB.acquire(function(err, conn) {
      if(err) return reject(err);
      let session = {
        'timestamp': currentTimestamp || new Date(),
        'data': sessionData
      };
      r.table('sessions').insert(session).run(conn)
        .then(function(result) {
          rethinkDB.release(conn);
          session.id = result.generated_keys[0];
          resolve({
            'result': result,
            'session': session
          });
        })
        .catch(function(err) {
          rethinkDB.release(conn);
          reject(err);
        });
    });
  });
};

// touch updates the session timestamp to the current time if the session
// found hasn't expired yet. If it is expired, the session is deleted from
// the database and the promise rejects.
// 
// This function should be used to extend the user login period. If the user
// keep accessing the application it will be authenticated for ever.
sessionDAL.touch = function touchSession(sessionId, currentTimestamp) {
  return new Promise(function(resolve, reject) {
    rethinkDB.acquire(function(err, conn) {
      // If there is an error with the connection, there is no need to release
      // it. Just reject the promise.
      if(err) 
        return reject(err);

      r.table('sessions').get(sessionId).run(conn)
        .then(function(session) {
          if(!session) {
            throw new sessionDAL.errors.SessionNotFoundError(sessionId);
          }
          if(sessionDAL.isExpired(session, config.sessionTimeout, currentTimestamp)) {
            throw new sessionDAL.errors.SessionExpiredError(sessionId);
          }
          return r.table('sessions').get(sessionId).update({
            timestamp: currentTimestamp
          }).run(conn);
        })
        .then(function(result) {
          rethinkDB.release(conn);
          resolve(result);
        })
        .catch(function(err) {
          rethinkDB.release(conn);
          return reject(err);
        });
    });
  });
};

sessionDAL.delete = function deleteSession(sessionId) {
};

sessionDAL.deleteAll = function deleteAllSessions() {
};

// This function returns true if the session has expired and false if not.
// An expired session is no longer valid and should be deleted from the database
sessionDAL.isExpired = function isSessionExpired(session, maxDiff, currentTime) {
  currentTime = currentTime || new Date();
  let diff = currentTime.getTime() - session.timestamp.getTime();
  return diff > maxDiff;
};

module.exports = sessionDAL;