/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var _ = require('lodash');
var sprintf = require('sprintf-js').sprintf;
var KVPair = require('./kv-pair');

/**
 *
 * @param {Object} obj
 * @param {KVPairNode} [parent = null]
 * @constructor
 */
function KVPairNode(obj, parent) {

  /**
   * Original object
   * @type {Object}
   */
  this.obj = obj;

  /**
   * {@link KVPair}'s array
   * @type {Array}
   */
  this.kvPairs = [];

  /**
   * Parent {@link KVPairNode}
   * @type {KVPairNode}
   */
  this.parent = parent || null;

  // parse
  _.each(obj, function(value, key) {
    if (_.isPlainObject(value)) {
      value = new KVPairNode(value, this);
    }

    this.kvPairs.push(new KVPair(key, value, this));
  }, this);
}

/**
 * Node to string
 * @override
 *
 * @returns {String}
 */
KVPairNode.prototype.toString = function() { return JSON.stringify(this.obj); };

/**
 * Get all pairs, include the sub object's pairs.
 * @returns {Array}
 */
KVPairNode.prototype.getAllPairs = function() {
  var result = [];
  _.each(this.kvPairs, function(pair) {
    result.push(pair);
    if (pair.hasChildPairs) {
      result.push.apply(result, pair.value.getAllPairs());
    }
  });
  return result;
};

/**
 * Find a pair in current object by pair's key
 * @param {String} key
 * @returns {KVPair}
 */
KVPairNode.prototype.findPairByKey = function(key) {
  return _.find(this.kvPairs, function(pair) {
    return pair.key === key;
  });
};

/**
 * Get a generated object value.
 * @returns {Object}
 */
KVPairNode.prototype.getValue = function() {
  var obj = {};
  _.each(this.kvPairs, function(pair) {
    var key = pair.getKey();
    var val = pair.getValue();

    if (!_.isString(key)) { throw new Error(sprintf('Object key "%s" should be String.', pair.key)); }
    if (obj.hasOwnProperty(key)) { throw new Error(sprintf('Object key "%s" duplicated on "%s"', pair.key, key)); }

    obj[key] = val;
  });

  return obj;
};

module.exports = KVPairNode;
