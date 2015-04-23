/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */
var assert = require('should');
var _ = require('lodash');
var tm = require('../src/lib/tm');
var gen = require('../src/lib/generator');


describe('generator', function() {
  before(function() {
    tm.type('X', function(a) { return a || 'X'; });
    tm.type('Y', function() { return true; });
    tm.type('Z', function() { return [1, true, 'z']; });

    tm.modifier('add', function(str, other) { return str + (other || ''); });
    tm.modifier('repeat', function(str, times) { return _.repeat(str, times || 2); });
  });
  after(function() {
    tm.clean();
  });

  it('should generate string argument', function() {
    gen('abc')().should.eql('abc');
    gen('')().should.eql('');
    gen('@X')().should.eql('X');
    gen('@Y')().should.eql(true);
    gen('ab @Y cd')().should.eql('ab true cd');
    assert.deepEqual(gen('@Z')(), [1, true, 'z']);
  });

  it('should return origin when argument is not String|Array|Object|Function', function() {
    [true, false, 123, 0, null, /abc/, function() {}].forEach(function(k) {
      assert(gen(k)() === k);
    });
  });

  it('should execute str as javascript when str is wrapped in `...`', function() {
    gen('`"abc" + 456`')().should.eql('abc456');
    gen('`1 + 456`')().should.eql(457);
    gen('`(function() { return true; })()`')().should.eql(true);
  });

  it('should throws when execute javascript error', function() {
    gen('`abc`').should.throw(/^Execute script .* error\.$/);
    gen('`3 -*( 5`').should.throw(/^Execute script .* error\.$/);
  });

  it('should deep parse each item in array', function() {
    assert.deepEqual(gen([1, 2])(), [1, 2]);
    assert.deepEqual(gen(['`3 + 1`', 2])(), [4, 2]);
    assert.deepEqual(gen(['@X', '@Y'])(), ['X', true]);
  });

  context('object', function() {
    var obj;
    before(function() {
      obj = {
        arr: ['@Self.k.repeat(3)', '@Self.a'],
        a: '@Self.b',
        b: 'b',
        c: {
          pa: '@Parent.a',
          //pe: '@Parent.c', // trigger error
          spa: '@Self.pa'
        },
        '@Self.k': 'k_value',
        X: '@X.slice(1)',
        Y: '@X(Y)',
        add: '@X.add(Y).repeat(2)',
        k: '`(function() { return "d"; })()`'
      };
    });

    it('should generate object argument', function() {
      var fn = gen(obj);
      assert.deepEqual(fn(), {
        arr: ['ddd', 'b'],
        a: 'b',
        b: 'b',
        c: {
          pa: 'b',
          spa: 'b'
        },
        X: '',
        Y: 'Y',
        add: 'XYXY',
        d: 'k_value',
        k: 'd'
      });
    });

    it('should throws when child object rely on it parent', function() {
      gen({
        a: {
          b: {
            c: '@Parent.Parent.a'
          }
        }
      }).should.throw(/^Pair ".*?" can not depend direct parent node\.$/);
    });

    it('should throws when key is duplicated', function() {
      gen({a: 'a', '@Self.a' : 'b'}).should.throw(/^Object key ".*?" duplicated on ".*?"$/);
      gen({a: 'a', c: {'@Parent.a' : 'b'}}).should.not.throw(/^Object key ".*?" duplicated on ".*?"$/);
    });

    it('should throws when key is not string', function() {
      gen({a: [1,2,3], '@Self.a': 'b'}).should.throw(/^Object key ".*?" should be String.$/);
      gen({a: [1,2,3], b: {'@Parent.a': 'c'}}).should.throw(/^Object key ".*?" should be String.$/);
    });

    it('should throws when parent node not found', function() {
      gen({a: '@Parent.a'}).should.throw(/^Not found parent for ".*?".$/);
      gen({a: {b: '@Parent.Parent.a'}}).should.throw(/^Not found parent for ".*?".$/);
    });

    it('should throws when not found depend pair', function() {
      gen({a: '@Self.b'}).should.throw(/^Not found depend pair for .*?\.$/);
      gen({a: {b: '@Self.Parent.b'}}).should.throw(/^Not found depend pair for .*?\.$/);
    });
  });
});
