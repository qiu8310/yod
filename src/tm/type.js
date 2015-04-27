/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var _ = require('lodash');

/**
 * @namespace
 * @type {Object}
 */
var type = {};

/**
 * All defined types
 * @memberOf type
 * @type {Object}
 */
var all = type.all = {};

var _reValid = /^[_A-Z]\w*$/;

/**
 * Check if type name is valid
 * @param {String} name
 * @returns {Boolean}
 */
type.isNameValid = function(name) {
  return _.isString(name) && _reValid.test(name);
};

/**
 * Check if type name is exists
 * @param {String} name
 * @returns {Boolean}
 */
type.isNameExists = function(name) {
  return name && (name in all);
};


function _checkCreateName(name) {
  if (type.isNameExists(name)) {
    console.warn('Type "%s" already exists, you are overwriting it!', name);
  }

  if (!type.isNameValid(name)) {
    throw new Error('Type "%s" is not valid, it should match ' + _reValid);
  }
}

/**
 * Create a new type
 * @param {String} name - type name
 * @param {Function} fn - type function
 * @param {*} [ctx = null] - type function context
 */
type.create = function(name, fn, ctx) {

  _checkCreateName(name);

  all[name] = {fn: fn, ctx: ctx};
};

/**
 * Alias a type to an exists type
 * @param {String} from - not exist type
 * @param {String} to - an exist type
 */
type.alias = function(from, to) {

  _checkCreateName(from);

  if (!type.isNameExists(to)) {
    throw new Error('Type "' + to + '" not exists, can\'t alias to.');
  }

  all[from] = all[to];
};

/**
 * Generate the data generator function
 * @param {String} name - type name
 * @param {Array} [args = []] - type function's arguments
 * @param {*} [ctx = null] - type function's context
 * @returns {Function}
 */
type.generator = function(name, args, ctx) {
  var t = all[name];
  if (!t) {
    throw new Error('Type "' + name + '" not exists, can\'t generate.');
  }

  return function() {
    return t.fn.apply(ctx || t.ctx, args || []);
  };
};

module.exports = type;
