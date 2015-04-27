/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var KVPairNode = require('./kv-pair-node');
var parse = require('./str/parse');
var _ = require('lodash');

module.exports = {
  generator: function(obj) {
    return function() {
      if (_.isPlainObject(obj)) {
        return (new KVPairNode(obj)).getValue();
      } else if (_.isFunction(obj)) {
        return obj();
      } else {
        return parse(obj);
      }
    };
  }
};
