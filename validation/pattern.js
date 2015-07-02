'use strict';
let _ = require('underscore');
let customErrors = require('../errors/custom_errors');

// The pattern class is the validation library used in this software. It is
// used to match against known and unknown unstrucuters.
// See tests/validation/pattern-test.js for examples.
class Pattern {
  // Stores the specified rules to the instance. There is no preprocessing
  // in the rules in order to match a object.
  constructor(rules) {
    this.requiredRules = [];
    this.regexRules = [];
    // Caching required rules to check when matching objects.
    _.each(rules, function(config, name) {
      if(config.required)
        this.requiredRules.push(name);

      // The key is a regexp
      if(name.indexOf('@regex ') === 0) {
        // Flag it to check in the matches method.
        config.__hasRegexpKey = true;
        // Cache the regexp definition in config.
        config.__regexpDef = name;
        // And then compile it.
        config.__keyRegexp = new RegExp(name.replace('@regex ', ''));
        this.regexRules.push(config);
      }
    }, this);
    this.rules = rules;
  }

  // Returns true if the object complies to the rules specified in the
  // constructor.
  // See tests/validation/pattern-test.js for examples.
  matches(obj) {
    return this.test(obj).matched
  }

  // The test method returns a summary about the match of this pattern
  // and the specified object
  test(obj) {
    let res = {
      matched: false,
      errors: {}
    };
    let keys = Object.keys(obj);
    let requiredMatched = [];
    for(let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let rule = this.ruleForKey(key);
      if(!rule) {
        res.errors[key] = new Pattern.errors.InvalidKeyError(key);
        continue;
      }
      let result = this.matchValue(rule, obj[key]);
      if(result !== true) res.errors[key] = result;

      if(rule.__hasRegexpKey)
        requiredMatched.push(rule.__regexpDef);
      else
        requiredMatched.push(key);
    }
    var diff = _.difference(this.requiredRules, requiredMatched);
    if(diff.length > 0) {
      _.each(diff, function(key) {
        res.errors[key] = new Pattern.errors.RequiredNotMatchedError(key);
      });
    }
    res.matched = _.isEmpty(res.errors);
    return res;
  }

  // Returns the rule associated with the key.
  // It first tries to find a rule with the exact key. Then it checks in the
  // list of regexs if there are a matching rule. If so, the rule is returned.
  ruleForKey(key) {
    let rule = this.rules[key];
    if(rule) return rule;
    return _.find(this.regexRules, function(config) {
      return config.__keyRegexp.test(key);
    });
  }

  // Called by `matches`. Returns true if the value complies to the rules found.
  matchValue(rule, value) {
    let matchers = this.matchersForValue(rule, value);
    var res;
    for(var i = 0; i < matchers.length; i++) {
      res = matchers[i](rule, value);
      if(res === true) return true;
    }
    return res;
  }

  // Rule can either an object describing the value or an array of objects
  // describing the value. If it is an array, if one of the pattern matches
  // for the value, the value is considered valid (like an "or" expression)
  matchersForValue(rule, value) {
    if(_.isArray(rule)) {
      return _.map(rule, function(r) {
        return Pattern.matchers[r.type];
      });
    }
    return [Pattern.matchers[rule.type]];
  }
}

// Helper functions to generate errors.
// An error is just a message string that explains why the validation failed.
// Those errors are returned from matchers in Pattern.matchers.
// TODO: Update with customErrors library.
Pattern.errors = customErrors({
  InvalidTypeError: function(expected, value) {
    return `Invalid type: expected (${expected}) - value is (${value})`;
  },
  InvalidMinLengthError: function(minLength, value) {
    return `Invalid minimum length: expected (${minLength}) - value is (${value})`;
  },
  InvalidMaxLengthError: function(maxLength, value) {
    return `Invalid maximum length: expected (${maxLength}) - value is (${value})`;
  },
  InvalidMinValueError: function(min, value) {
    return `Invalid minimum value: expected (${min}) - value is (${value})`;
  },
  InvalidMaxValueError: function(max, value) {
    return `Invalid maximum value: expected (${max}) - value is (${value})`;
  },
  InvalidRegexpError: function(regex, value) {
    return `Invalid regexp: expected (${regex}) - value is (${value})`;
  },
  InvalidKeyError: function(key) {
    return `Invalid key: no rule found for the key (${key})`;
  },
  RequiredNotMatchedError: function(key) {
    return `Required pattern not matched for the key (${key})`;
  }
});

// Since it's possible to specify a function that returns the expected value as
// well as the raw value, matcherRuleValue normalizes this by converting to
// raw values. For example, val itself is returned if it's a string, number,
// boolean or date. If val is a function, the result returned from the function
// is returned.
function matcherRuleValue(val) {
  if(_.isFunction(val)) {
    return val();
  }
  return val;
}

// Helper constants to define rules using the Pattern class.
Pattern.matchers = {
  // The string matcher checks the following properties
  // * minLength
  // * maxLength
  // * empty
  string: function(rule, value) {
    if(!_.isString(value))
      return new Pattern.errors.InvalidTypeError('string', value);
    if(rule.minLength && !(value.length >= matcherRuleValue(rule.minLength)))
      return new Pattern.errors.InvalidMinLengthError(rule.minLength, value);
    if(rule.maxLength && !(value.length <= matcherRuleValue(rule.maxLength)))
      return new Pattern.errors.InvalidMaxLengthError(rule.maxLength, value);
    return true;
  },

  // The number matcher checks the following properties
  // * min
  // * max
  number: function(rule, value) {
    if(!_.isNumber(value))
      return new Pattern.errors.InvalidTypeError('number', value);
    if(rule.min && !(value >= matcherRuleValue(rule.min)))
      return new Pattern.errors.InvalidMinValueError(rule.min, value);
    if(rule.max && !(value <= matcherRuleValue(rule.max)))
      return new Pattern.errors.InvalidMaxValueError(rule.max, value);
    return true;
  },

  boolean: function(rule, value) {
    if(!_.isBoolean(value))
      return new Pattern.errors.InvalidTypeError('boolean', value);
    return true;
  },

  date: function(rule, value) {
    if(!_.isDate(value))
      return new Pattern.errors.InvalidTypeError('date', value);
    if(rule.min && !(value >= matcherRuleValue(rule.min)))
      return new Pattern.errors.InvalidMinValueError(rule.min, value);
    if(rule.max && !(value <= matcherRuleValue(rule.max)))
      return new Pattern.errors.InvalidMaxValueError(rule.max, value);
    return true;
  },

  // Used when declaring nested patterns
  pattern: function(rule, value) {
    if(!_.isObject(value))
      return new Pattern.errors.InvalidTypeError('object', value);
    return rule.pattern.matches(value);
  },

  regexp: function(rule, value) {
    if(!_.isString(value))
      return new Pattern.errors.InvalidTypeError('string', value);
    let matched = matcherRuleValue(rule.regexp).test(value);
    if(!matched)
      return new Pattern.errors.InvalidRegexpError(rule.regexp, value);
    return true;
  },

  object: function(rule, value) {
    if(Object.prototype.toString.call(value) !== '[object Object]')
      return new Pattern.errors.InvalidTypeError('object', value);
    return true;
  }
};

// Public API
module.exports = Pattern;