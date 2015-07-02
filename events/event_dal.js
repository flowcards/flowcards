'use strict';

// Event Data Access Layer is responsible for tracking events in
// RethinkAnalytics. Events are the core of most analysis (with the exception
// of profile searching), and must be stored in the most efficient way, since
// it's most used resource in this software.

let rethinkDB = require('../env/rethinkdb');
let r = require('rethinkdb');
let Pattern = require('../validation/pattern');

// Object holding the DAL for interacting with events
let eventDAL = {};

// Pattern used to validate events before tracking them. No invalid event
// can be tracked (would screw up the reports).
eventDAL.eventPattern = new Pattern({
  'event_type': {
    requried: true,
    type: 'string'
  },
  'profile_id': {
    required: true,
    type: 'string'
  },
  // Timestamp is not required (the server generates one if it isn't specified).
  'timestamp': {
    required: false,
    type: 'number'
  },
  // Since properties can be empty, they're not required 
  'properties': {
    required: false,
    type: 'pattern',
    pattern: new Pattern({
      // Basically, any property in the event can be either a string, number or 
      // boolean.
      // TODO: add support for tags (arrays of string)
      // TODO: add support for dates
      '@regex .+': [
        {type: 'string'},
        {type: 'number'},
        {type: 'boolean'}
      ]
    })
  }
});


// Returns true if the event is valid, false if not. The validation uses the
// validation/pattern.js library (developed for this software), and the pattern
// is defined in eventDAL.eventPattern
eventDAL.isValid = function isEventValid(event) {
};

// Stores the event
eventDAL.track = function trackEvent(event) {
  r.table('events').insert({})
};

module.exports = eventDAL;
