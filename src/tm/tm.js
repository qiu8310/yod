/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

'use strict';
var _ = require('lodash'),
  type = require('./type'),
  modifier = require('./modifier');

/**
 *
 * Simple group of type and modifier, "t" meaning {@link type}, "m" meaning {@link modifier}.
 *
 * @namespace
 * @type {Object}
 */
var tm = {};


/**
 * Define a new type
 *
 * @param {String} name - type name
 * @param {Array|String} [aliases = []] - type aliases
 * @param {Function} fn - type function
 * @param {*} [ctx = null] - type function's bind target
 *
 * @example
 *
 * // 随机生成布尔值
 * yod.type('Boolean', ['Bool'], function() {
 *   return Date.now() % 2 === 0;
 * });
 *
 */
tm.type = function(name, aliases, fn, ctx) {
  if (_.isFunction(aliases)) {
    ctx = fn;
    fn = aliases;
    aliases = [];
  }

  type.create(name, fn, ctx);

  _.each([].concat(aliases), function(alias) { type.alias(alias, name); });
};


/**
 * Define a new modifier
 * @param {String|Function|Array} [filters = []] - modifier filters
 * @param {String} name - modifier name
 * @param {Function} fn - modifier function
 * @param {*} [ctx = null] - modifier function's bind target
 * @example
 *
 * yod.modifier('String', 'first', function(str) {
 *   return str[0];
 * });
 *
 * @example
 *
 * function isFooBar(arg) {
 *   if (arg === 'foo' || arg === 'bar') { return true; }
 * }
 * yod.hook(['String', isFooBar], 'double', function(fooBarStr) {
 *   return fooBarStr + fooBarStr;
 * });
 */
tm.modifier = function(filters, name, fn, ctx) {
  if (_.isFunction(name)) {
    ctx = fn;
    fn = name;
    name = filters;
    filters = [];
  }

  modifier.create([].concat(filters), name, fn, ctx);
};

/**
 * Clean all defined types and modifiers
 */
tm.clean = function(arg) {
  var obj = {type: type, modifier: modifier};
  _.each([].concat(obj[arg] || _.values(obj)), function(t){
    _.each(t.all, function(v, k) {
      delete t.all[k];
    });
  });
};


/**
 * Function's modifier generator
 * @param {Function} fn
 * @param {Array} modSeries
 * @returns {Function}
 */
tm.fnGenerator = function(fn, modSeries) {
  return _.reduce([].concat(modSeries ? modSeries : []), function(fn, mod) {
    return modifier.generator(fn, mod.name, mod.args, mod.ctx);
  }, fn);
};

/**
 * Generator type and modifier series generator.
 *
 *
 * @param {String} [typeName]
 * @param {Array} [series] - type and modifier arrays, series's first argument is type, and others is modifier
 * @returns {Function}
 * @example
 *
 * yod.generator('Bool');
 *
 * @example
 *
 * yod.generator('Bool', [{name: 'repeat', args: [3, 8]}]);
 *
 * @example
 *
 * yod.generator([ {name: 'Bool', args: [0.6]}, {name: 'repeat', args: [3]} ]);
 */
tm.generator = function(typeName, series) {
  var typ,
    mods;

  if (_.isString(typeName)) {
    typ = {name: typeName};
    mods = series || [];
  } else {
    series = typeName;
    typ = series[0];
    mods = series.slice(1);
  }

  var fn = type.generator(typ.name, typ.args, typ.ctx);

  return tm.fnGenerator(fn, mods);
};

tm.t = type;
tm.m = modifier;

module.exports = tm;

