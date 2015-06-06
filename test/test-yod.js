'use strict';


/*
 ASSERT:
 ok(value, [message]) - Tests if value is a true value.
 equal(actual, expected, [message]) - Tests shallow, coercive equality with the equal comparison operator ( == ).
 notEqual(actual, expected, [message]) - Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
 deepEqual(actual, expected, [message]) - Tests for deep equality.
 notDeepEqual(actual, expected, [message]) - Tests for any deep inequality.
 strictEqual(actual, expected, [message]) - Tests strict equality, as determined by the strict equality operator ( === )
 notStrictEqual(actual, expected, [message]) - Tests strict non-equality, as determined by the strict not equal operator ( !== )
 throws(block, [error], [message]) - Expects block to throw an error.
 doesNotThrow(block, [error], [message]) - Expects block not to throw an error.
 ifError(value) - Tests if value is not a false value, throws if it is a true value. Useful when testing the first argument, error in callbacks.

 SHOULD.JS:
 http://shouldjs.github.io/

 Some test frameworks:
 sinon:  function spy
 nock: mock http request
 supertest: test http server
 rewire: modify the behaviour of a module such that you can easily inject mocks and manipulate private variables

 More on http://www.clock.co.uk/blog/tools-for-unit-testing-and-quality-assurance-in-node-js
 */

var fs = require('fs');
var path = require('path');

var assert = require('should');
var _ = require('lodash');

var yod = require('../');


describe('yod', function () {

  context('example', function () {
    var only, dir = path.join(__dirname, '..', 'example');

    //only = '3';

    _.each(fs.readdirSync(dir), function (basename) {
      var fn = function () {
        yod.emptyModifiers();
        yod.emptyTypes();
        require(path.resolve(dir, basename))(yod, assert, _);
      };
      if (basename.indexOf(only) === 0) {
        it.only(basename, fn);
      } else {
        it(basename, fn);
      }
    });
  });

  context('arguments check', function () {
    it('throws', function () {
      // yod
      yod.should.throw('yod(generator) can only accept one argument.');

      // type
      (function () {
        yod.type();
      }).should.throw('yod.type(name, generator[, aliases...]) need at least two arguments.');

      (function () {
        yod.type(1, '2');
      }).should.throw('Type name "1" should be a string.');

      (function () {
        yod.type('A', '2', 1);
      }).should.throw('Type alias "1" should also be a string.');

      // modifier

      (function () {
        yod.modifier();
      }).should.throw('yod.modifier([filters, ]name, modifierFn) need two or three arguments.');
      (function () {
        yod.modifier(123, function () {
        });
      }).should.throw('Modifier name "123" should be a string.');
      (function () {
        yod.modifier('a', '123');
      }).should.throw('Modifier function "123" should be a function.');
    });
  });

  context('parse error check', function () {
    it('recycle depend', function () {
      (function () {
        yod({a: '@Self.b', b: '@Self.a'})
      }).should.throw(/Recycle depends found/);
      (function () {
        yod({a: '@Self.b.c', b: {c: '@Parent.a'}})
      }).should.throw(/Recycle depends found/);
    });

    it('depend on parent', function () {
      (function () {
        yod({a: {b: '@Parent.a'}})
      }).should.throw(/depend on it.s direct parent node/);
      (function () {
        yod({a: {b: {c: '@Parent.Parent.a'}}})
      }).should.throw(/depend on it.s direct parent node/);
    });

    it('not object', function () {
      (function () {
        yod('@Parent.a')
      }).should.throw(/not a object/);
      (function () {
        yod('@Self.a')
      }).should.throw(/not a object/);
    });

    it('no parent', function () {
      (function () {
        yod({a: '@Parent.b'})
      }).should.throw(/Not found parent for/);
      (function () {
        yod({a: {b: '@Parent.Parent.b'}})
      }).should.throw(/Not found parent for/);
    });

    it('object key duplicated', function () {
      (function () {
        yod({a: 'c', c: 't', '@Self.a': 'x'})
      }).should.throw(/duplicated/);
    });

    it('not found depend on', function () {
      (function () {
        yod({a: 'a', b: '@Self()'})
      }).should.throw(/resolved error/);
      (function () {
        yod({a: 'a', b: '@Parent()'})
      }).should.throw(/resolved error/);
      (function () {
        yod({a: 'a', b: '@Self.c'})
      }).should.throw(/resolved error/);
    });
  });


  // burgleaf 提出的 bug: http://v2ex.com/t/186871#;
  context('object in array', function () {
    it('should parse object value in array', function () {
      yod.type('OiA', function () {
        return 'o';
      });

      assert.deepEqual(
        yod({
          a: [1, {o: '@OiA', b: '@Parent.b'}],
          b: 'b'
        }),
        {a: [1, {o: 'o', b: 'b'}], b: 'b'}
      );
    });

    it('should throw when recycle depends', function() {
      (function() {
        yod({
          a: [1, {o: '@OiA', b: '@Parent.b'}],
          b: '@Self.a'
        });
      }).should.throw(/Recycle depends found/);
    });
  });

});
