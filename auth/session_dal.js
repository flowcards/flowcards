'use strict';

let rethinkDB = require('../env/rethinkdb');
let r = require('rethinkdb');

// Object holding the DAL for interacting with sessions
var sessionDAL = {};

sessionDAL.create = function createSession(sessionData) {
  let timestamp = new Date();
  return new Promise(function(resolve, reject) {
    rethinkDB.acquire(function(err, conn) {
      if(err) return reject(err);
      r.table('sessions').insert({
        'timestamp': timestamp,
        'data': sessionData
      }).run(conn, function(err, result) {
        rethinkDB.release(conn);
        if(err) return reject(err);
        resolve(result);
      });
    });
  });
};

sessionDAL.touch = function touchSession(sessionId) {
};

sessionDAL.delete = function deleteSession(sessionId) {
};

sessionDAL.deleteAll = function deleteAllSessions() {
};

module.exports = sessionDAL;