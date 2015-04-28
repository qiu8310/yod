/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var assert = require('should');
var _ = require('lodash');

var yod = require('../');
var cfg = yod.config;


describe('config', function () {

  before(function() {
    cfg('test.a.b', 'ab');
    cfg('test.b.d', {c: 'cc'}, [1, 2, 3]);
  });

  context('get', function() {
    it('should get what you have set', function() {
      assert.deepEqual(cfg('test.a'), {b: 'ab'});
      assert.deepEqual(cfg('test.a.b'), 'ab');
      assert.deepEqual(cfg('test.b.d'), {c: 'cc'});
      assert.deepEqual(cfg('test.b.d.c'), 'cc');
    });

    it('should return undefined when key not exists', function() {
      assert.equal(cfg('a.b.c'), undefined);
      assert.equal(cfg('xx'), undefined);
    });

    it('should get meta with value', function() {
      assert.deepEqual(cfg('test.a:meta'), {val: {b: 'ab'}, meta: undefined});
      assert.deepEqual(cfg('test.a.b:meta'), {val: 'ab', meta: undefined});
      assert.deepEqual(cfg('test.b:meta'), {val: {d: {c: 'cc'}}, meta: undefined});
      assert.deepEqual(cfg('test.b.d:meta'), {val: {c: 'cc'}, meta: [1, 2, 3]});
    });

  });

  context('set', function() {
    it('should settable', function() {
      [false, true, 12, 0, function() {}].forEach(function(settable) {
        cfg('test.s.b', settable);
        cfg('test.s.b').should.eql(settable);
      });
    });

    it('should settable meta', function() {
      [false, true, 12, 0, function() {}].forEach(function(settable) {
        cfg('test.s.d', 'd', settable);
        cfg('test.s.d:meta').meta.should.eql(settable);
      });
    });

  });

  context('yod caller', function() {
    it('should callable', function() {
      assert.deepEqual(yod('@Config.test.a'), {b: 'ab'});
      assert.deepEqual(yod('@Config.test.a.b'), 'ab');
    });

    it('should modifiable', function() {
      assert.deepEqual(yod('@Config.test.a.b.length'), 2);

      yod.modifier('sample', function(d) { return _.sample(d); });
      yod.config('test.a', {aa: ['c', 'd']});
      ['c', 'd'].should.containEql(yod('@Config.test.a.aa.sample'));
    });

    it('should throws', function() {
      (function() { yod('@Config'); }).should.throw(/Config key "" not found./);
      (function() { yod('@Config.notExist'); }).should.throw(/Config key "notExist" not found./);
    });

  });

});
