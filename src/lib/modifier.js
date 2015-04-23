/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var sprintf = require('sprintf-js').sprintf;
var _ = require('lodash');

/**
 * @namespace
 * @type {Object}
 */
var modifier = {};

/**
 * All defined modifiers
 * @memberOf modifier
 * @type {Object}
 */
var all = modifier.all = {};

var _reValid = /^[a-z]\w*$/,
  _msgNoValid = 'Modifier "%s" is not a valid modifier name, it should match /^[a-z]\\w*$/',
  _allowedFilterStrings = ['String', 'Array', 'Object', 'PlainObject', 'Number', 'Boolean'];

/**
 * Check if modifier name is valid
 * @param {String} name
 * @returns {Boolean}
 * @private
 */
function _isValidModifierName(name) {
  return _reValid.test(name);
}

/**
 * Create a new modifier
 *
 * @param {Array} [filters = []]
 * @param {String} name - if name start with ':', then it is a pre hook modifier
 * @param {Function} fn
 * @param {*} [ctx = null]
 */
modifier.create = function(filters, name, fn, ctx) {
  if (_.isString(filters)) {
    ctx = fn;
    fn = name;
    name = filters;
    filters = [];
  }

  if (!_.isFunction(fn)) {
    throw new Error(sprintf('Argument "%s" should be a function.', fn));
  }

  var isPreHook = false;

  if (name.charAt(0) === ':') {
    isPreHook = true;
    name = name.substr(1);
  }

  if (all[name]) {
    console.warn('Modifier "%s" already exists, you are overwriting it!', name);
    //throw new Error(sprintf('Modifier "%s" already exists, can\'t create.', name));
  }

  if (!_isValidModifierName(name)) {
    throw new Error(sprintf(_msgNoValid, name));
  }

  filters = _.map(filters, function(filter) {
    if (_.isString(filter)) {
      if (!_.includes(_allowedFilterStrings, filter)) {
        throw new Error(sprintf('Modifier filter string value should in "%s"', _allowedFilterStrings.join('", "')));
      }
      return _['is' + filter];
    } else if (_.isFunction(filter)) {
      return filter;
    } else {
      throw new Error(sprintf('Modifier filter should be String or Function, not %s', typeof filter));
    }
  });

  all[name] = {
    isPreHook: isPreHook,
    filters: filters,
    fn: fn,
    ctx: ctx
  };
};


/**
 * According to modifier filters, decide should apply modifier function to this value
 * @param {*} val
 * @param {Array} filters - filter function array
 * @returns {Boolean}
 * @private
 */
function _shouldApplyModifier(val, filters) {
  if (filters.length) {
    return _.all(filters, function(filter) { return filter(val); });
  }
  return true;
}

/**
 * Generate the modifier data generator function
 * @param {Function} prevGenerator
 * @param {String} name - modifier name
 * @param {Array} [args = []]
 * @param {*} [ctx = null]
 * @returns {Function}
 */
modifier.generator = function(prevGenerator, name, args, ctx) {
  var mod = all[name],
    fn;

  args = args || [];

  if (mod) { // Use defined generator
    ctx = ctx || mod && mod.ctx;

    if (mod.isPreHook) {
      fn = function() {
        return mod.fn.apply(ctx, [prevGenerator].concat(args));
      };
    } else {
      fn = function() {
        var rtn = prevGenerator();
        if (_shouldApplyModifier(rtn, mod.filters)) {
          return mod.fn.apply(ctx, [rtn].concat(args));
        } else {
          return rtn;
        }
      };
    }
  } else { // Use js system call
    fn = function() {
      var rtn = prevGenerator();
      if (_.isUndefined(rtn[name])) {
        throw new Error(sprintf('Modifier "%s" not exists.', name));
      }

      if (_.isFunction(rtn[name])) {
        return rtn[name].apply(ctx || rtn, args);
      } else {
        return rtn[name];
      }
    };
  }

  return fn;
};


module.exports = modifier;
