'use strict';
let genericPool = require('generic-pool');
let r = require('rethinkdb');

function createConnection(callback) {
  r.connect({
    host: 'localhost',
    port: 28015,
    db: 'rethink_analytics'
  }, callback);
}

function destroyConnection(conn) {
  conn.close();
}

module.exports = genericPool.Pool({
  name: 'rethinkdb',
  create: createConnection,
  destroy: destroyConnection,
  max: 12,
  min: 2,
  idleTimeoutMillis: 30000
});