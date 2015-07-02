'use strict';

// customErrors is a tiny library to provide error definitions inside an object.
// The user provides an object with each error name being the key, and a function
// that returns the message that describes the error

let _ = require('underscore');

module.exports = function(userErrors) {
  let errors = {};
  _.each(userErrors, function(val, key) {
    var err = function() {
      this.name = key;
      this.message = val.apply(userErrors, arguments);
    };
    err.prototype = Object.create(Error.prototype);
    errors[key] = err;
  });
  return errors;
};