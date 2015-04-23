/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var assert = require('should');
var _ = require('lodash');
var helper = require('../src/lib/helper');


describe('helper', function() {

  context('.generator', function() {
    it('should return function', function() {
      assert(_.isFunction(helper.generator(function() {})));
    });

    it('should return function relative with input function', function() {
      var fn = function(a) { return (_.isUndefined(a) ? '' : a) + (_.isUndefined(this.a) ? '' : this.a); };
      var newFn = helper.generator(fn);
      newFn().should.eql('');

      newFn = helper.generator(fn, ['arg']);
      newFn().should.eql('arg');

      newFn = helper.generator(fn, null, {a: 'ctx'});
      newFn().should.eql('ctx');

      newFn = helper.generator(fn, ['arg'], {a: 'ctx'});
      newFn().should.eql('argctx');
    });
  });

  context('.backupInnerQuote', function() {
    it('should replaced by default empty string', function() {
      var str = 'x"abc"x';
      helper.backupInnerQuote(str).result.should.eql('x"   "x');
    });

    it('should replaced by specified string', function() {
      var str = 'x"abc"x';
      helper.backupInnerQuote(str, '').result.should.eql('x""x');
      helper.backupInnerQuote(str, 'xx').result.should.eql('x"xxxxxx"x');
    });

    it('should replaced by specified function', function() {
      var str = 'x"abc"x';
      helper.backupInnerQuote(str, function() { return ''; }).result.should.eql('xx');
      helper.backupInnerQuote(str, function() { return '\'\''}).result.should.eql('x\'\'x');
    });
  });

  context('.recoverInnerQuote', function() {
    it('should recover backed string', function() {
      var str = 'x"abc"x';
      var back = helper.backupInnerQuote(str, '');
      helper.recoverInnerQuote(back.result, back.backup).should.eql(str);
    });

    it('should recover function backed string', function() {
      var str = 'x"abc"x';
      var back = helper.backupInnerQuote(str, function() { return 'xxxxxxxx'; });
      helper.recoverInnerQuote(back.result, back.backup).should.eql(str);
    });
  });

  context('.getCallers', function() {
    it('should return empty array, if no arguments is string', function() {
      helper.getCallers().should.have.length(0);
      helper.getCallers(1).should.have.length(0);
      helper.getCallers(true).should.have.length(0);
      helper.getCallers(true, {a: 'aa'}, []).should.have.length(0);
      helper.getCallers(true, {a: 'aa'}, undefined).should.have.length(0);
    });

    it('should match caller struct', function() {
      assert.deepEqual(helper.getCallers('@Ab'), ['@Ab']);
      assert.deepEqual(helper.getCallers('@Ab().cd'), ['@Ab().cd']);
      assert.deepEqual(helper.getCallers('xx@Ab("ab").cd are'), ['@Ab("ab").cd']);
    });

    it('should match caller struct between "${" and "}"', function() {
      assert.deepEqual(helper.getCallers('@A}'), ['@A']);
      assert.deepEqual(helper.getCallers('{@A}'), ['@A']);
      assert.deepEqual(helper.getCallers('${@A'), ['@A']);
      assert.deepEqual(helper.getCallers('${@A.b}.cd'), ['@A.b']);
    });

    it('should match deep flatten arguments', function() {
      assert.deepEqual(helper.getCallers('@A', ['@B'], ['@C']), ['@A', '@B', '@C']);
    });

    it('should not have duplicated values', function() {
      assert.deepEqual(helper.getCallers('@A', '@B', '@A'), ['@A', '@B']);
      assert.deepEqual(helper.getCallers('@AA', '@AA'), ['@AA']);
    });

    xit('should not impacted by ")" when inside quotes (Not Supported)', function() {
      assert.deepEqual(helper.getCallers('@String.replace(")", "")'), ['@String.replace(")", "")']);
      assert.deepEqual(helper.getCallers('@String.replace("(", "")'), ['@String.replace("(", "")']);
      assert.deepEqual(helper.getCallers('@String.replace("(", ")")'), ['@String.replace("(", ")")']);
    });

    it('should support single quote in double quotes or double quote in single quotes', function() {
      assert.deepEqual(helper.getCallers('@S("\'","\'")'), ['@S("\'","\'")']);
      assert.deepEqual(helper.getCallers('@S(\'"\', \'"\')'), ['@S(\'"\', \'"\')']);
    });
  });

  context('.getDepends', function() {
    it('should return callers that start with @Self. or @Parent', function() {
      assert.deepEqual(helper.getDepends('@Self.a.b.c', '@Sel.f'), ['@Self.a.b.c']);
      assert.deepEqual(helper.getDepends('@Parent.a.b.c', '@Pare.nt'), ['@Parent.a.b.c']);
    });
  });

  context('.explodeCallerStr', function() {
    var ph;
    before(function() { ph = helper.placeholder; });
    it('should explode caller string', function() {
      assert.deepEqual(helper.explodeCallerStr('A @B(x).c({a: aa}).d'), {tpl: 'A ' + ph, args: ['@B(x).c({a: aa}).d']});
      assert.deepEqual(helper.explodeCallerStr('A @A A'), {tpl: 'A ' + ph + ' A', args: ['@A']});
      assert.deepEqual(helper.explodeCallerStr('@A@B@C'), {tpl: ph + ph + ph, args: ['@A', '@B', '@C']});
      assert.deepEqual(helper.explodeCallerStr('@A@A'), {tpl: ph + ph, args: ['@A', '@A']});
    });

    it('should explode caller string inside "${", "}"', function() {
      helper.explodeCallerStr('{@A}').tpl.should.eql('{' + ph + '}');
      helper.explodeCallerStr('$@A}').tpl.should.eql('$' + ph + '}');
      helper.explodeCallerStr('@A}').tpl.should.eql(ph + '}');
      helper.explodeCallerStr('${@A').tpl.should.eql('${' + ph);
      helper.explodeCallerStr('${@A}').tpl.should.eql(ph);
    });

    it('should support update placeholder', function() {
      var nph = 'xxxxx';
      helper.placeholder = nph;
      helper.explodeCallerStr('@A').tpl.should.eql(nph);

      nph = 'yyyyy';
      helper.placeholder = nph;
      helper.explodeCallerStr('@A').tpl.should.eql(nph);

      // recover
      helper.placeholder = ph;
      helper.explodeCallerStr('@A').tpl.should.eql(ph);
    });
  });

  context('.implodeCallerStr', function() {
    var ph;
    before(function() { ph = helper.placeholder; });
    it('should implode caller string parts', function() {
      helper.implodeCallerStr(ph, ['are you ok']).should.eql('are you ok');
      helper.implodeCallerStr('A ' + ph + 't', ['B']).should.eql('A Bt');

      helper.implodeCallerStr(_.repeat(ph+',', 3), ['A', 'B', 'C']).should.eql('A,B,C,');
    });
  });

  context('.parseArgsStrToArray', function() {
    var fn;
    before(function() { fn = helper.parseArgsStrToArray; });
    it('should parse string arguments', function() {
      assert.deepEqual(fn('a, b, c'), ['a', 'b', 'c']);
      assert.deepEqual(fn(' a , b , c '), ['a', 'b', 'c']);
      assert.deepEqual(fn('"a ","b" , \'c '), ['a ', 'b', '\'c']);
    });

    it('should parse other literal value', function() {
      assert.deepEqual(fn('1, 2, 3'), [1, 2, 3]);
      assert.deepEqual(fn('1, "3"'), [1, '3']);
      assert.deepEqual(fn('null, false'), [null, false]);
    });

    it('should parse object values', function() {
      assert.deepEqual(fn('{a: aa, b: true}'), [{a: 'aa', b: true}]);
      assert.deepEqual(fn('{b: 123}, {t: {c: {d: d}}}'), [{ b: 123}, {t: {c: {d: 'd'}}}]);
    });

    it('should parse array values', function() {
      assert.deepEqual(fn('[1, true, null, "3"]'), [[1, true, null, '3']]);
      assert.deepEqual(fn('[1, true, null, "3"], 4'), [[1, true, null, '3'], 4]);
    });

    it('should fall back to string when can not parse', function() {
      assert.deepEqual(fn('{a,b'), ['{a,b']);
      assert.deepEqual(fn('"{a",b'), ['{a','b']);
    });
  });

  context('.parseCaller', function() {
    it('should parse caller string', function() {
      assert.deepEqual(
        helper.parseCaller('@String(abc).repeat(3).title'),
        [
          {name: 'String', args: ['abc']},
          {name: 'repeat', args: [3]},
          {name: 'title', args: []}
        ]
      )
    });
  });

  context('.reCaller', function() {
    it('should be a RegExp', function() {
      helper.reCaller.should.be.a.instanceof(RegExp);
    });
  });

  context('.placeholder', function() {
    it('should be a String', function() {
      helper.placeholder.should.be.a.String;
    });
  });
});
