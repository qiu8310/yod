/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var assert = require('should');
var KVPair = require('../src/lib/kv-pair');

describe('KVPair', function() {
  context('getKey & getValue', function() {
    it('should throws when not resolved', function() {
      var pair = new KVPair('k', 'v', {});
      (function() {pair.getKey();}).should.throw(/^Pair ".*?" not resolved yet.$/);
      (function() {pair.getValue();}).should.throw(/^Pair ".*?" not resolved yet.$/);
    });
  });
});

