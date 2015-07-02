'use strict';

let assert = require('chai').assert;
let _ = require('underscore');
let customErrors = require('../../errors/custom_errors');

describe('customErrors', function() {
  it('is a function', function() {
    assert.isTrue(_.isFunction(customErrors));
  });

  it('returns an object with same keys as the specified one', function() {
    var errs = customErrors({
      'Pixel': function() {
      },
      'Other': function() {
      }
    });

    assert.property(errs, 'Pixel');
    assert.property(errs, 'Other');
  });

  it('returns functions associated with the keys', function() {
    var errs = customErrors({
      'Pixel': function() {
      },
      'Other': function() {
      }
    });

    assert.isFunction(errs.Pixel);
    assert.isFunction(errs.Other);
  });

  it('has throwable functions', function() {
    var errs = customErrors({
      'Pixel': function() {
      }
    });

    try {
      throw new errs.Pixel();
      assert.isTrue(false);
    } catch(err) {
      assert.isTrue(err instanceof errs.Pixel);
    }
  });

  it('has the same output as the specified functions', function() {
    var errs = customErrors({
      Pixel: function() {
        return "cats";
      }
    });

    try {
      throw new errs.Pixel();
      assert.isTrue(false);
    } catch(err) {
      assert.equal("cats", err.message);
    }
  });

  it('generates outputs with custom arguments', function() {
    var errs = customErrors({
      Pixel: function(num) {
        return "The number is: " + num;
      }
    });

    try {
      throw new errs.Pixel(5);
    } catch(err) {
      assert.equal("The number is: 5", err.message);
    }
  });
});