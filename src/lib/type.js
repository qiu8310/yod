/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var sprintf = require('sprintf-js').sprintf;
var _ = require('lodash');
var helper = require('./helper');

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


var _reValid = /^[A-Z]\w*$/,
  _msgNoValid = 'Type "%s" is not a valid type name, it should match /^[A-Z]\\w*$/';

/**
 * Check the type name's validation
 *
 * @param {String} name - type name
 * @returns {Boolean}
 * @private
 */
function _isTypeNameValid (name) {
  return _reValid.test(name);
}

/**
 * Create a new type
 * @param {String} name - type name
 * @param {Function} fn - type function
 * @param {*} [ctx = null] - type function context
 */
type.create = function(name, fn, ctx) {
  if (!_.isFunction(fn)) {
    throw new Error(sprintf('Argument "%s" should be a function.', fn));
  }

  if (all[name]) {
    console.warn('Type "%s" already exists, you are overwriting it!', name);
    //throw new Error(sprintf('Type "%s" already exists, can\'t create.', name));
  }

  if (!_isTypeNameValid(name)) {
    throw new Error(sprintf(_msgNoValid, name));
  }

  all[name] = {fn: fn, ctx: ctx};
};

/**
 * Alias a type to an exists type
 * @param {String} from - not exist type
 * @param {String} to - an exist type
 */
type.alias = function(from, to) {
  if (all[from]) {
    console.warn('Type "%s" already exists, you are overwriting it!', from);
    //throw new Error(sprintf('Type "%s" already exists, can\'t alias from.', from));
  }

  if (!_isTypeNameValid(from)) {
    throw new Error(sprintf(_msgNoValid, from));
  }

  if (!all[to]) {
    throw new Error(sprintf('Type "%s" not exists, can\'t alias to.', to));
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
    throw new Error(sprintf('Type "%s" not exists, can\'t generate.', name));
  }

  return helper.generator(t.fn, args || [], ctx || t.ctx);
};

module.exports = type;
