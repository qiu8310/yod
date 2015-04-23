/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var _ = require('lodash');
var sprintf = require('sprintf-js').sprintf;
var helper = require('./helper');


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

  /**
   * If key and value are resolved
   * @type {Boolean}
   */
  this.resolved = false;

  /**
   * Depends on other pairs, order is sorted by {@link https://github.com/qiu8310/dep dep.js}
   * @type {Array}
   */
  this.deepDepends = [];
}

/**
 * Pair to string
 *
 * @returns {String}
 */
KVPair.prototype.toString = function() {
  return sprintf('{"key": "%s", "value": "%s"}', this.key, this.value);
};

/**
 * Find depend pair base on depKeys and objKeys
 * @param {String|Object} depKeys
 * @param {String|Object} objKeys
 * @returns {KVPair}
 */
KVPair.prototype.getDependPair = function(depKeys, objKeys) {
  var node = this.node;
  var depPair = false;
  _.each(depKeys, function(k) {
    var name = k.name || k;
    if (name === 'Parent') {
      if (!node.parent) { throw new Error(sprintf('Not found parent for "%s".', node.toString())); }
      node = node.parent;
    }
  });

  // Use cloned objKeys
  _.each([].concat(objKeys), function(k) {
    var name = k.name || k;
    var pair = node.findPairByKey(name);
    if (pair) {
      depPair = pair;
      objKeys.shift();
    }
    if (pair && pair.hasChildPairs) {
      node = pair.value;
    } else {
      return false;
    }
  });

  if (!depPair) { throw new Error(sprintf('Not found depend pair for %s.', this.toString())); }

  return depPair;
};

/**
 * Get depends KVPairs
 * @returns {Array} - KVPair's array
 * @private
 */
KVPair.prototype.getDependPairs = function() {
  var self = this;
  var depends = helper.getDepends(this.key, this.value);

  return _.uniq(_.map(depends, function(dep) {
    var depPair;
    dep.replace(/^@((?:Self\.|Parent\.)+)(\w+(?:\.\w+)*)/, function(raw, depKeys, objKeys) {
      depPair = self.getDependPair(depKeys.split('.').slice(0, -1), objKeys.split('.'));
    });

    // @NOTE Can't happen
    //if (self.isParentOf(depPair)) {
    //  throw new Error(sprintf('Pair "%s" can not depend direct child node.', self));
    //}

    if (depPair.isParentOf(self)) {
      throw new Error(sprintf('Pair "%s" can not depend direct parent node.', self.toString()));
    }

    return depPair;
  }));
};

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
 * Get the resolved key
 * @returns {String}
 */
KVPair.prototype.getKey = function() { throw new Error(sprintf('Pair "%s" not resolved yet.', this)); };

/**
 * Get the resolved value
 * @returns {*}
 */
KVPair.prototype.getValue = function() { throw new Error(sprintf('Pair "%s" not resolved yet.', this)); };

module.exports = KVPair;
