'use strict';

let assert = require('chai').assert;
let rethinkDB = require('../../env/rethinkdb');

describe('env/rethinkdb tests', function() {
  it('is an object', function() {
    assert.isObject(rethinkDB);
  });

  it('acquires a valid connection', function(done) {
    rethinkDB.acquire(function(err, conn) {
      if(err) throw err;
      assert.isObject(conn);
      rethinkDB.release(conn);
      done();
    });
  });
});