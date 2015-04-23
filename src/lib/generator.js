/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var _ = require('lodash');
var KVPairNode = require('./kv-pair-node');
var dep = require('dep.js');
var helper = require('./helper');
var tm = require('./tm');

/**
 * Call a caller.
 * @param {String} caller
 * @param {KVPair} pair
 * @returns {*}
 * @private
 */
function _call(caller, pair) {
  var series = helper.parseCaller(caller);
  var sp = ['Self', 'Parent'];

  // parse series's arguments till end to true.
  _.each(series, function(ser) {
    _.each(ser.args, function(arg, i) {
      var parsedArg = _parseStr(arg, pair);
      if (parsedArg !== arg) { ser.args[i] = parsedArg; }
    });
  });

  if (_.includes(sp, series[0].name)) {
    var depSeres = [], objSeres = [], value;
    var flag = 0;

    _.each(series, function(ser) {
      if (ser.args.length) { flag = 1; }
      if (!flag && _.includes(sp, ser.name)) {
        depSeres.push(ser);
      } else {
        flag = 1;
        objSeres.push(ser);
      }
    });

    // @NOTE objSeres will modified.
    var targetPair = pair.getDependPair(depSeres, objSeres);

    value = targetPair.getValue();
    if (!objSeres.length) { return value; }

    return tm.fnGenerator(function() { return value; }, objSeres)();

  } else {
    return tm.generator(series)();
  }
}

/**
 * Parse str to generated value.
 * @param {String} str
 * @param {KVPair} [pair = null]
 * @returns {String}
 * @private
 */
function _parseStr(str, pair) {
  if (_.isArray(str)) {
    return _.map(str, function(s) { return _parseStr(s, pair); });
  }
  if (!_.isString(str)) { return str; }

  var rtn = helper.explodeCallerStr(str),
    tpl = rtn.tpl,
    args = rtn.args;

  if (tpl === helper.placeholder) {
    return _call(args[0], pair);
  }

  args = _.map(args, function(arg) { return _call(arg, pair); });
  str = helper.implodeCallerStr(tpl, args);

  if (str.charAt(0) === '`' && str.slice(-1) === '`') {
    /* jshint ignore:start */
    try {
      eval('var variable=' + str.substr(1, str.length - 2));
      return variable;
    } catch (e) { throw new Error('Execute script "' + str + '" error.'); }
    /* jshint ignore:end */
  }

  return str;
}

/**
 * Resolve pair.
 * @param {KVPair} pair
 * @private
 */
function _parsePair(pair) {
  if (pair.resolved) { return false; }

  pair.getKey = function() { return _parseStr(this.key, this); };

  pair.getValue = function() {
    if (this.hasChildPairs) {
      return this.value.getValue();
    } else {
      return _parseStr(this.value, this);
    }
  };

  pair.resolved = true;
}

/**
 * Take obj as a object data generator
 * @private
 * @param {Object} obj
 * @returns {Function}
 */
function kv(obj) {
  var rootNode = new KVPairNode(obj);
  var pairs = rootNode.getAllPairs();

  // resolve deepDepends
  _.each(
    dep(_.map(pairs, function(pair) {
      return {value: pair, depends: pair.getDependPairs()};
    })),
    function(it) {
      var pair = it.value;
      pair.deepDepends = it.deepDepends;
    }
  );

  // parse pair
  _.each(pairs, function(pair) {
    _.each(pair.deepDepends, _parsePair);
    _parsePair(pair);
  });

  return rootNode.getValue();
}

/**
 * Generate data generator for anything.
 * @name generator
 * @type {Function}
 * @param {*} anything
 * @returns {Function}
 */
module.exports = function generator (anything) {
  if (_.isPlainObject(anything)) {
    return function () {
      return kv(anything);
    };
  } else if (_.isFunction(anything)) {
    return anything;
  } else {
    return function() { return _parseStr(anything); };
  }
};
