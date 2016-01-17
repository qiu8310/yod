/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var _ = require('lodash');

var config = require('./config'),
  gen = require('./obj/obj').generator,
  tm = require('./tm/tm');



/**
 * Generate random data according generator.
 *
 * @param {String|Object|Array} generator
 * @returns {*}
 */
function yod(generator) {
  if (arguments.length !== 1) {throw new Error('yod(generator) can only accept one argument.'); }

  if (_.isArray(generator)) {
    return _.map(generator, function(arg) { return yod(arg); });
  }

  return gen(generator)();
}

/**
 * Create new type, and also can create the new type's aliases.
 *
 * @param {String} name
 * @param {*} generator
 * @param {String|Array} aliases
 */
yod.type = function(name, generator, aliases) {
  if (arguments.length < 2) {
    throw new Error('yod.type(name, generator[, aliases...]) need at least two arguments.');
  }

  if (!_.isString(name)) { throw new Error('Type name "' + name + '" should be a string.'); }

  aliases = _.map(_.flattenDeep(_.slice(arguments, 2)), function(alias) {
    if (!_.isString(alias)) { throw new Error('Type alias "' + alias + '" should also be a string.'); }
    return alias;
  });

  tm.type(name, aliases, _.isFunction(generator) ? generator : function() { return yod(generator); });
};


/**
 * Create new modifier.
 *
 * @param {String|Function|Array} [filters = []] - before modifier modify the up value,
 *                                                the filters will filter the value first
 *
 * @param {String} name - modifier's name, if prefix it with ":", modifier will
 *                        become a generator function modifier, default is a value modifier
 *
 * @param {Function} modifierFn - modifier's function, the function's first argument is last generator's value
 *                                or function (depends on if modifier's name is prefix with ":"), other arguments
 *                                is user provided.
 */
yod.modifier = function(filters, name, modifierFn) {
  var len = arguments.length;
  if (len < 2 || len > 3) {
    throw new Error('yod.modifier([filters, ]name, modifierFn) need two or three arguments.');
  }

  if (len === 2) {
    modifierFn = name;
    name = filters;
    filters = [];
  }

  if (!_.isString(name)) { throw new Error('Modifier name "' + name + '" should be a string.'); }
  if (!_.isFunction(modifierFn)) { throw new Error('Modifier function "' + modifierFn + '" should be a function.'); }


  tm.modifier(filters, name, modifierFn);
};

/**
 * Empty all defined types.
 * @type {Function}
 */
yod.emptyTypes = function() { tm.clean('type'); };

/**
 * Empty all defined modifiers.
 * @type {Function}
 */
yod.emptyModifiers = function() { tm.clean('modifier'); };

yod.isTypeNameExists = tm.t.isNameExists;
yod.isTypeNameValid = tm.t.isNameValid;
yod.isModifierNameExists = tm.m.isNameExists;
yod.isModifierNameValid = tm.m.isNameValid;
yod._ = _;

/**
 * Set or get config key.
 *
 * @type {Function}
 * @param {String} key
 * @param {*} [val]
 * @param {Object} [meta]
 * @returns {*}
 */
yod.config = config;

/**
 * all types
 * @type {Object}
 */
yod.types = tm.t.all;

/**
 * all modifiers
 * @type {Object}
 */
yod.modifiers = tm.m.all;

if (typeof window !== 'undefined') { window.yod = yod; }

module.exports = yod;
