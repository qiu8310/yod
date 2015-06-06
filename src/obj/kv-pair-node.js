/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var _ = require('lodash');
var KVPair = require('./kv-pair');

function parseNodeValue(target, ctx) {
  if (_.isPlainObject(target)) {
    return new KVPairNode(target, ctx);
  } else if (_.isArray(target)) {
    return _.map(target, function(v) {
      return parseNodeValue(v, ctx);
    });
  } else {
    return target;
  }
}

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
    value = parseNodeValue(value, this);
    this.kvPairs.push(new KVPair(key, value, this));
  }, this);

}

/**
 * Node to string
 * @override
 *
 * @returns {String}
 */
KVPairNode.prototype.toString = function() { return 'KVPairNode' + JSON.stringify(this.obj); };


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
 * @param {Array<KVPair>} pairStack - 对象中的数组如果包含一个对象，解析时会传这个 pairStack 过来
 * @returns {Object}
 */
KVPairNode.prototype.getValue = function(pairStack) {
  var obj = {};
  pairStack = pairStack || []; // 空数组用来判断是否有循环依赖，在逐层调用时，这个数组会把先后调用的 pair 放入其中
  _.each(this.kvPairs, function(pair) {
    // key 和 val 的 Stack 必须独立
    var key = pair.getKey([].concat(pairStack));
    var val = pair.getValue([].concat(pairStack));

    if (obj.hasOwnProperty(key)) { throw new Error('Object key "' + pair.key + '" duplicated.'); }

    obj[String(key)] = val;
  });

  return obj;
};


module.exports = KVPairNode;
