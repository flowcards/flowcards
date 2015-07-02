'use strict';

let assert = require('chai').assert;
let eventDAL = require('../../events/event_dal');
let config = require('../../config');

describe('eventDAL test', function() {
  it('is an object', function() {
    assert.isObject(eventDAL);
  });

  describe('.isValid', function() {
    it('returns true for a valid event');
    it('returns false if there are no profile_id');
    it('returns false if there are no event_type');
    it('returns false if a propery is not string, number or boolean');
  });

  describe('.track', function() {
    it('rejects if the event is not valid');
    it('returns the generated id for the event');
    it('assigns the current timestamp if none is specified');
    it('copies the properties from the profile if the profile exists');
    it('issue a cache operation for the properties');
  });
});
