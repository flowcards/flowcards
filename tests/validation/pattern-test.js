'use strict';

let assert = require('chai').assert;
let Pattern = require('../../validation/pattern.js');

describe('validation/Pattern tests', function() {
  it('is a function', function() {
    assert.isFunction(Pattern);
  });

  describe('#matches', function() {
    it('matches against string values', function() {
      let namePattern = new Pattern({
        'name': {type: 'string'}
      });
      assert.isTrue(namePattern.matches({'name': 'Luiz'}));
      assert.isFalse(namePattern.matches({'name': 20}));
    });

    it('matches against min string length', function() {
      let namePattern = new Pattern({
        'name': {
          type: 'string',
          minLength: 3
        },
      });

      assert.isTrue(namePattern.matches({'name': 'Luiz'}));
      assert.isTrue(namePattern.matches({'name': 'Lui'}));
      assert.isFalse(namePattern.matches({'name': 'Lu'}));
    });

    it('matches against max string length', function() {
      let namePattern = new Pattern({
        'name': {
          type: 'string',
          maxLength: 4
        }
      });

      assert.isTrue(namePattern.matches({'name': 'Luiz'}));
      assert.isFalse(namePattern.matches({'name': 'Pixel'}));
    });

    it('matches against numeric values', function() {
      let numberPattern = new Pattern({
        'age': {
          type: 'number'
        }
      });
      assert.isTrue(numberPattern.matches({'age': 10}));
    });

    it('matches against numeric with min value', function() {
      let numberPattern = new Pattern({
        'age': {
          type: 'number',
          min: 2
        }
      });
      assert.isTrue(numberPattern.matches({'age': 3}));
      assert.isTrue(numberPattern.matches({'age': 2}));
      assert.isFalse(numberPattern.matches({'age': 1}));
    });

    it('matches against numeric with max value', function() {
      let numberPattern = new Pattern({
        'age': {
          type: 'number',
          max: 10
        }
      });
      assert.isTrue(numberPattern.matches({'age': 9}));
      assert.isTrue(numberPattern.matches({'age': 10}));
      assert.isFalse(numberPattern.matches({'age': 11}));
    });

    it('matches against boolean value', function() {
      let boolPattern = new Pattern({
        'admin': {
          type: 'boolean'
        }
      });

      assert.isTrue(boolPattern.matches({'admin': true}));
      assert.isTrue(boolPattern.matches({'admin': false}));
      assert.isFalse(boolPattern.matches({'admin': 10}));
    });

    it('matches against date value', function() {
      let datePattern = new Pattern({
        'time': {
          type: 'date'
        }
      });

      assert.isTrue(datePattern.matches({'time': new Date()}));
      assert.isFalse(datePattern.matches({'time': 100000}));
      assert.isFalse(datePattern.matches({'time': 'now'}));
    });

    it('matches against date with min value', function() {
      let before = new Date(2015, 6, 10);
      let current = new Date(2015, 6, 11);
      let after = new Date(2015, 6, 12);
      let datePattern = new Pattern({
        'time': {
          type: 'date',
          min: current
        }
      });
      assert.isTrue(datePattern.matches({'time': after}));
      assert.isTrue(datePattern.matches({'time': current}));
      assert.isFalse(datePattern.matches({'time': before}));
    });

    it('matches against date with max value', function() {
      let before = new Date(2015, 6, 10);
      let current = new Date(2015, 6, 11);
      let after = new Date(2015, 6, 12);
      let datePattern = new Pattern({
        'time': {
          type: 'date',
          max: current
        }
      });
      assert.isTrue(datePattern.matches({'time': before}));
      assert.isTrue(datePattern.matches({'time': current}));
      assert.isFalse(datePattern.matches({'time': after}));
    });

    it('matches against object type', function() {
      let objectPattern = new Pattern({
        'properties': {
          type: 'object'
        }
      });
      assert.isTrue(objectPattern.matches({'properties': {}}));
      assert.isTrue(objectPattern.matches({'properties': {
        'name': 'Foo'
      }}));
      assert.isFalse(objectPattern.matches({'properties': []}));
    });

    it('matches against number min/max values using a function', function() {
      let numberPattern = new Pattern({
        'age': {
          type: 'number',
          min: function() { return 2; },
          max: function() { return 3; }
        }
      });

      assert.isFalse(numberPattern.matches({'age': 1}));
      assert.isTrue(numberPattern.matches({'age': 2}));
      assert.isTrue(numberPattern.matches({'age': 3}));
      assert.isFalse(numberPattern.matches({'age': 4}));
    });

    it('matches against date min/max values using a function', function() {
      let before = new Date(2015, 6, 10);
      let current = new Date(2015, 6, 11);
      let after = new Date(2015, 6, 12);
      let datePattern = new Pattern({
        'time': {
          type: 'date',
          min: function() { return current; },
          max: function() { return after; }
        }
      });

      assert.isFalse(datePattern.matches({'time': before}));
      assert.isTrue(datePattern.matches({'time': current}));
      assert.isTrue(datePattern.matches({'time': after}));
    });

    it('matches against string min/max length using functions', function() {
      let stringPattern = new Pattern({
        'name': {
          type: 'string',
          minLength: function() { return '12'.length; },
          maxLength: function() { return '123'.length; }
        }
      });

      assert.isFalse(stringPattern.matches({'name': '1'}));
      assert.isTrue(stringPattern.matches({'name': '12'}));
      assert.isTrue(stringPattern.matches({'name': '123'}));
      assert.isFalse(stringPattern.matches({'name': '1234'}));
    });

    it('matches against nested pattern', function() {
      let nestedPattern = new Pattern({
        'name': {
          type: 'pattern',
          pattern: new Pattern({
            'first': {type: 'string'},
            'last': {type: 'string'}
          })
        }
      });

      assert.isTrue(nestedPattern.matches({
        name: {first: 'Pixel', last: 'Other'}
      }));

      assert.isFalse(nestedPattern.matches({
        name: {first: 10, last: 'Other'}
      }));
    });

    it('returns false if a required key is not present', function() {
      let requiredPattern = new Pattern({
        'name': {
          type: 'string',
          required: true
        }
      });
      assert.isTrue(requiredPattern.matches({name: 'Pixel'}));
      assert.isFalse(requiredPattern.matches({other: 'Pixel'}));
    });

    it('matches against regexp values', function() {
      let regexpPattern = new Pattern({
        'name': {
          type: 'regexp',
          regexp: /[a|b]/
        }
      });
      assert.isTrue(regexpPattern.matches({name: 'a'}));
      assert.isTrue(regexpPattern.matches({name: 'b'}));
      assert.isFalse(regexpPattern.matches({name: 'c'}));
    });

    it('matches against regex using a function', function() {
      let regexpPattern = new Pattern({
        'name': {
          type: 'regexp',
          regexp: function() { return /[a|b]/; }
        }
      });
      assert.isTrue(regexpPattern.matches({name: 'a'}));
      assert.isTrue(regexpPattern.matches({name: 'b'}));
      assert.isFalse(regexpPattern.matches({name: 'c'}));
    });

    it('matches against key regexs', function() {
      let dynamicPattern = new Pattern({
        '@regex [name|fullName]': {
          type: 'string',
          required: true
        }
      });

      assert.isTrue(dynamicPattern.matches({name: 'Pixel'}));
      assert.isTrue(dynamicPattern.matches({fullName: 'Pixel'}));
    });

    it('matches against the first regex found', function() {
      let dynamicPattern = new Pattern({
        '@regex [name|age]': {
          type: 'string',
        },
        '@regex [age|time]': {
          type: 'number'
        }
      });

      assert.isTrue(dynamicPattern.matches({age: 'Pixel'}));
      assert.isFalse(dynamicPattern.matches({age: 20}));
    });

    it('matches against exact value before regexps', function() {
      let pattern = new Pattern({
        '@regexp [age]': {
          type: 'string',
        },
        'age': {
          type: 'number'
        }
      });

      assert.isTrue(pattern.matches({age: 10}));
      assert.isFalse(pattern.matches({age: 'Qux'}));
    });

    it('matches against multiple types when an array is specified', function() {
      let multiplePattern = new Pattern({
        'value': [
          {type: 'string'},
          {type: 'number'}
        ]
      });

      assert.isTrue(multiplePattern.matches({value: 'Pixel'}));
      assert.isTrue(multiplePattern.matches({value: 10.0}));
      assert.isFalse(multiplePattern.matches({value: true}));
    });
  });

  describe('#test', function() {
    it('returns a map of errors from invalid values', function() {
      let pattern = new Pattern({
        name: {
          type: 'string',
          minLength: 3
        },
        age: {
          type: 'number'
        }
      });

      let res = pattern.test({name: 'Pi', age: true});
      assert.isFalse(res.matched);
      assert.property(res.errors, 'name');
      assert.property(res.errors, 'age');
      assert.isTrue(res.errors.name instanceof Error);
      assert.isTrue(res.errors.age instanceof Error);
    });

    it('returns error from properties that doesnt have rules', function() {
      let pattern = new Pattern({
        name: {
          type: 'string'
        }
      });

      let res = pattern.test({name: 'Pixel', age: 10});
      assert.property(res.errors, 'age');
      assert.isTrue(res.errors.age instanceof Error);
    });

    it('returns error from required rules that doesnt have values', function() {
      let pattern = new Pattern({
        name: {
          type: 'string'
        },
        age: {
          type: 'number',
          required: true
        }
      });

      let res = pattern.test({name: 'Pixel'});
      assert.property(res.errors, 'age');
      assert.isTrue(res.errors.age instanceof Error);
    });
  });
});