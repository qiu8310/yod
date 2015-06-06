/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var _ = require('lodash');
var parse = require('./str/parse');


/**
 * Object's key value pair
 *
 * @param {String} key
 * @param {*} value
 * @param {KVPairNode} node
 * @constructor
 */
function KVPair(key, value, node) {
  /**
   * Object's key, can depends on Self, Parent object.
   * @type {String}
   */
  this.key = key;

  /**
   * Object's value, can depends on Self, Parent object.
   * @type {*}
   */
  this.value = value;

  /**
   * If the value is a KVPairNode.
   * @type {Boolean}
   */
  this.hasChildPairs = value instanceof node.constructor;

  /**
   * Object's reference.
   *
   * @type {KVPairNode}
   */
  this.node = node;

  this.resolvedKey = null;
  this.resolvedValue = null;
}

/**
 * Pair to string
 *
 * @returns {String}
 */
KVPair.prototype.toString = function() {
  return 'KVPair{"key": "' + this.key + '", "value": "' + this.value + '"}';
};


/**
 * 判断 pair 是否是当前 pair 的 父级元素
 * @param {KVPair} pair
 * @returns {boolean}
 */
KVPair.prototype.isParentOf = function(pair) {
  var node = pair.node;
  if (this.hasChildPairs) {
    while (node) {
      if (node === this.value) {
        return true;
      }
      node = node.parent;
    }
  }
  return false;
};

/**
 * 循环依赖检查
 * @param {KVPair} current
 * @param {Array<KVPair>} stack
 * @private
 */
function _recycleCheck(current, stack) {
  var index = stack.indexOf(current);
  if (index >= 0) {
    var s = _.map(stack.slice(index).concat(current), function(it) { return it.toString(); });
    throw new Error('Recycle depends found. ' + s.join(' -> '));
  }
}


/**
 * Get the resolved key
 * @param {Array} stack
 * @returns {String}
 */
KVPair.prototype.getKey = function(stack) {
  _recycleCheck(this, stack);
  stack.push(this);
  if (this.resolvedKey === null) {
    this.resolvedKey = parse(this.key, stack);
  }
  return this.resolvedKey;
};

/**
 * Get the resolved value
 * @param {Array} stack
 * @returns {*}
 */
KVPair.prototype.getValue = function(stack) {
  _recycleCheck(this, stack);
  stack.push(this);
  var val = this.value;

  if (this.resolvedValue === null) {
    if (this.hasChildPairs) {
      this.resolvedValue = val.getValue(); // 调用 node 的 getValue
    } else {
      if (_.isArray(val)) {
        this.resolvedValue = _.map(val, function(v) {
          return v && v.getValue ? v.getValue(stack) : parse(v, [].concat(stack));
        });
      } else {
        this.resolvedValue = parse(this.value, stack);
      }
    }
  }
  return this.resolvedValue;
};

module.exports = KVPair;
