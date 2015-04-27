/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var assert = require('should');
var _ = require('lodash');
var tm = require('../src/tm/tm');
var t = require('../src/tm/type');
var m = require('../src/tm/modifier');

var eptFn = function() {};

describe('tm', function() {
  beforeEach(function() {
    tm.clean();
  });

  context('.type', function() {
    it('should create a new type', function() {
      tm.type('X', function(x) { return x || this.x || 'x'; });
      tm.generator('X')().should.eql('x');
      tm.generator([{name: 'X', ctx: {x: 'ctx'}}])().should.eql('ctx');
      tm.generator([{name: 'X', args: ['args'], ctx: {x: 'ctx'}}])().should.eql('args');
    });


    it('should create alias', function() {
      tm.type('A', 'B', function() { return ''; });
      tm.generator('B')().should.eql('');

      tm.type('C', ['D', 'E'], function() { return 'c'; });
      tm.generator('D')().should.eql('c');
      tm.generator('E')().should.eql('c');
    });

    it('should clean all types', function() {
      tm.type('X', eptFn);
      tm.clean();
      assert.doesNotThrow(function() { tm.type('X', eptFn); });
    });

    it('should throws when type name is invalid', function() {
      assert.throws(function() { tm.type('x', eptFn)});
      assert.throws(function() { tm.type('X-t', eptFn)});
    });

    it('should throws when alias type name is invalid', function() {
      assert.throws(function() { tm.type('X', 'x', eptFn); });
    });

    it('should throws when alias target not exists', function() {
      assert.throws(function() {t.alias('X', 'Y'); });
    });

    it('should not throws when alias source exists', function() {
      tm.type('X', eptFn);
      assert.doesNotThrow(function() { tm.type('XX', 'X', eptFn); }, /Type "X" already exists, can\'t alias from/);
      assert.doesNotThrow(function() { t.alias('X', 'XX'); }, /Type "X" already exists, can\'t alias from/);
    });

    it('should throws when generate a not exists type', function() {
      assert.throws(function() { tm.generator('X'); }, /Type "X" not exists, can\'t generate\./)
    });
  });

  context('.modifier', function() {
    it('should throws when modifier name is invalid', function() {
      assert.throws(function() { tm.modifier('X', eptFn) });
      assert.throws(function() { tm.modifier('x-a', eptFn) });
    });


    it('should throws when modifier filter is invalid', function() {
      (function() {tm.modifier('NoExistFilter', 'cap', eptFn);}).should.throw(/Modifier filter string value should in/);
      (function() {tm.modifier([true, 1], 'cap', eptFn); }).should.throw(/Modifier filter should be String or Function/);
    });

    it('should not throws when modifier exists', function() {
      (function() {
        tm.modifier('y', eptFn);
        tm.modifier('y', eptFn);
      }).should.not.throw('Modifier "y" already exists, can\'t create.');
    });

    it('should actual work', function() {
      tm.modifier('cap', function(str) { return _.capitalize(str); });
      tm.fnGenerator(function() {return 'abc';}, [{name: 'cap'}])().should.eql('Abc');

      m.create('camel', function(str, append) { return _.camelCase(str) + append; });
      tm.fnGenerator(function() {return 'are_you';}, [{name: 'camel', args: ['Ok']}])()
        .should.eql('areYouOk');
    });

    it('should support preHook, prepend ":" before modifier name', function() {
      tm.modifier(':cap', function(fn) { return _.capitalize(fn()) + '_' + fn(); });
      tm.fnGenerator(function() {return 'ab';}, [{name: 'cap'}])().should.eql('Ab_ab');
    });

    it('should support filters', function() {
      tm.modifier('String', 'cap', function(str) { return _.capitalize(str); });
      tm.modifier(['Array', function(a) { return a.length === 0; }], 'noEmpty', function() { return ['X']; });

      var fn1 = tm.fnGenerator(function() { return 'ab'; }, [{name: 'cap'}]);
      var fn2 = tm.fnGenerator(function() { return true; }, [{name: 'cap'}]);

      fn1().should.eql('Ab');
      fn2().should.eql(true);

      var fn3 = tm.fnGenerator(function() { return []; }, [{name: 'noEmpty'}]);
      var fn4 = tm.fnGenerator(function() { return ['A']; }, [{name: 'noEmpty'}]);
      fn3()[0].should.eql('X');
      fn4()[0].should.eql('A');

    });

    it('should support native js function modifier', function() {
      var fn = tm.fnGenerator(function() { return 'abc'; }, [
        {name: 'replace', args: [/ab/, 'c']}
      ]);
      fn().should.eql('cc');

      fn = tm.fnGenerator(fn, [
        {name: 'length'}
      ]);
      fn().should.eql(2);
    });

    it('should throws when no modifier in user defines or system', function() {
      var fn = tm.fnGenerator(function() {return 'a';}, [{name: 'notExistFunctionX'}]);
      fn.should.throw(/Modifier "notExistFunctionX" not exists/);
    });
  });

  context('.fnGenerator', function() {
    it('should support empty modifier', function() {
      tm.fnGenerator(function() {return 'a';})().should.eql('a');
    });

    it('should support obj modifier', function() {
      var fn = tm.fnGenerator(function() { return 'ab'; }, {name: 'replace', args: ['a', 'b']});
      fn().should.eql('bb');

      fn = tm.fnGenerator(function() { return 'ab'; }, [{name: 'replace', args: ['a', 'b']}, {name: 'length'}]);
      fn().should.eql(2);
    });
  });

});
