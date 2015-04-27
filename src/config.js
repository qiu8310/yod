/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var _ = require('lodash');

var _meta = {};
var _all = {};


var _reMeta = /:meta$/;


/**
 * Set or get config key.
 *
 * @param {String} key
 * @param {*} [val]
 * @param {Object} [meta]
 * @returns {*}
 */
function config(key, val, meta) {

  var keys, lastKey, addMeta;

  addMeta = _reMeta.test(key);
  key = key.replace(_reMeta, '');
  keys = key.split('.');

  // get
  if (_.isUndefined(val)) {
    meta = _meta[key];
    val = _.reduce(keys, function(ref, k) {
      if (ref && ref.hasOwnProperty && ref.hasOwnProperty(k)) {
        ref = ref[k];
        return ref;
      }
    }, _all);

  } else { // set
    if (!_.isUndefined(meta)) { _meta[key] = meta; }
    lastKey = keys.pop();

    var prevVal = _.reduce(keys, function(ref, k) {
      if (!_.isObject(ref[k])) { ref[k] = {}; }

      ref = ref[k];

      return ref;
    }, _all);

    prevVal[lastKey] = val;
  }

  return addMeta ? {meta: meta, val: val} : val;
}


config.all = _all;
config.meta = _meta;

module.exports = config;
