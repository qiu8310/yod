/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var parse = require('../src/obj/str/engine'),
  assert = require('should');

function matchArgs(args, len) {
  args.should.have.length(len);
  [].slice.call(arguments, 2).forEach(function(parsed, i) {
    if (parsed) {
      if (parsed.index >= 0) {
        assert.deepEqual(args[i], parsed);
      } else {
        assert.deepEqual(args[i].caller, parsed);
      }
    }
  });
}

describe('str parse engine', function() {
  context('no caller', function() {
    it('should parse empty string successfully', function() {
      assert.deepEqual(parse(''), {tpl: '', args: []});
      assert.deepEqual(parse(' \t'), {tpl: ' \t', args: []});
    });

    it('should parse string without caller successfully', function() {
      parse('abc').tpl.should.eql('abc');
      parse('ab\r\n\tc').tpl.should.eql('ab\r\n\tc');
    });

    it('should support use "\\" to escape caller', function() {
      parse('\\@abc').tpl.should.eql('@abc');
      parse('ab\\@abc def').tpl.should.eql('ab@abc def');
    });

    it('should not use "\\" as escape if it is not a caller', function() {
      parse('\\').tpl.should.eql('\\');
      parse('\\@').tpl.should.eql('\\@');
      parse('\\@ abc').tpl.should.eql('\\@ abc');
      parse('\\@-abc').tpl.should.eql('\\@-abc');
    });
  });

  context('one caller', function() {
    it('should not add args when no ()', function() {
      parse('@String').tpl.should.eql('_');
      matchArgs(parse('@String').args, 1, {caller: [{name: 'String'}], index: 0});
    });

    it('should add empty args when with empty arguments', function() {
      parse('@a()').tpl.should.eql('_');
      matchArgs(parse('@a()').args, 1, [{name: 'a', args: []}]);
    });

    it('should add no empty args when with arguments', function() {
      parse('@a(a, 1, "")').tpl.should.eql('_');
      matchArgs(parse('@a(a, 1, "")').args, 1, [{name: 'a', args: ['a', '1', '""']}]);
      matchArgs(parse('@a(true, [ab,"d]e"])').args, 1, [{name: 'a', args: ['true', '[ab,"d]e"]']}]);
      matchArgs(parse('@a({"}}", aks})').args, 1, [{name: 'a', args: ['{"}}", aks}']}]);
    });

  });

  context('caller chain', function() {
    it('should chain', function() {
      matchArgs(parse('@a.b().c(a, d).e').args, 1, [
        {name: 'a'}, {name: 'b', args: []}, {name: 'c', args: ['a', 'd']}, {name: 'e'}
      ]);
    });
  });

  context('one caller & string', function() {
    it('should replace tpl', function() {
      parse('abc @BBQ').tpl.should.eql('abc _');
      parse('abc@BBQ').tpl.should.eql('abc_');
      parse(' @BBQ ').tpl.should.eql(' _ ');
      parse(' @BBQ').tpl.should.eql(' _');
    });

    it('should support ${}', function() {
      parse('${@B}').tpl.should.eql('_');
      parse('a${@B}.d').tpl.should.eql('a_.d');
      parse('a${@B').tpl.should.eql('a${_');
      parse('a${@B a').tpl.should.eql('a${_ a');
      parse('a@B}a').tpl.should.eql('a_}a');
    });

    it('should escape even in ${}', function() {
      parse('${\\@B}').tpl.should.eql('${@B}');
      parse('${\\@B}a').tpl.should.eql('${@B}a');
    });

    it('should parse args', function() {
      matchArgs(parse('a @b').args, 1, [{name: 'b'}]);
      matchArgs(parse('@b b').args, 1, [{name: 'b'}]);
      matchArgs(parse('@b() b').args, 1, [{name: 'b', args: []}]);
      matchArgs(parse('@b(c, 1) b').args, 1, [{name: 'b', args: ['c', '1']}]);
    });
  });

  context('caller in parallel', function() {
    it('should replace tpl', function() {
      parse('@a@b').tpl.should.eql('__');
      parse('@a() @b').tpl.should.eql('_ _');
      parse(' @a @b(sd, sdf, [], [], {}) ').tpl.should.eql(' _ _ ');
      parse(' @a ad() @b ').tpl.should.eql(' _ ad() _ ');
    });

    it('should parse args', function() {
      matchArgs(parse('@a(), @b').args, 2, [{name: 'a', args: []}], [{name: 'b'}]);
      matchArgs(parse('@a@b@c').args, 3, [{name: 'a'}], [{name: 'b'}], [{name: 'c'}]);
      matchArgs(parse('@a, @b(1, 2)').args, 2, [{name: 'a'}], [{name: 'b', args: ['1', '2']}]);
    })
  });

  context('embed caller', function() {
    it('should work when embed one', function() {
      var p = parse('@A(@B)');
      p.tpl.should.eql('_');
      matchArgs(p.args, 1, [{name: 'A', args: [ [{name: 'B'}] ]}]);
    });
    it('should work when embed one with arguments and chain', function() {
      matchArgs(
        parse('@A(@B().b.c)').args, 1,
        [{name: 'A', args: [ [{name: 'B', args: []}, {name: 'b'}, {name: 'c'}] ]}]
      );
    });

    it('should work when embed two', function() {
      matchArgs(
        parse('@A(@B, @C(1))').args, 1,
        [{name: 'A', args: [ [{name: 'B'}], [{name: 'C', args: ['1']}] ]}]
      );
    });
    it('should escape embed caller', function() {
      matchArgs(
        parse('@A(\\@B, @C)').args, 1,
        [{name: 'A', args: [ '@B', [{name: 'C'}] ]}]
      );

      matchArgs(
        parse('@A(\\@B, \\@C)').args, 1,
        [{name: 'A', args: [ '@B', '@C']}]
      );
    });

    it('should work when with other string', function() {
      var p = parse('ab @A.b(@C, def) ha');
      p.tpl.should.eql('ab _ ha');
      matchArgs(p.args, 1, [{name: 'A'}, {name: 'b', args: [ [{name: 'C'}], 'def' ]}])
    });
  });

  context('special', function() {
    it('should parse to empty string argument when with comma', function() {
      matchArgs(parse('@a(,)').args, 1, [{name: 'a', args: ['', '']}]);
      matchArgs(parse('@a(,a)').args, 1, [{name: 'a', args: ['', 'a']}]);
      matchArgs(parse('@a(,a,)').args, 1, [{name: 'a', args: ['', 'a', '']}]);
    });

    it('should support caller without type', function() {
      parse('@()').tpl.should.eql('_');
      matchArgs(parse('@()').args, 1, [{name: true, args: []}]);

      matchArgs(parse('@({a}, @b)').args, 1, [{name: true, args: ['{a}', [{name: 'b'}]]}])
    });
  });

  context('throws', function() {
    it('caller not matched pair', function() {
      (function() { parse('@(@a()'); }).should.throw();
      (function() { parse('@('); }).should.throw();
      (function() { parse('@a('); }).should.throw();
      (function() { parse('@a(")'); }).should.throw();
      (function() { parse('@a(\')'); }).should.throw();
    });

    it('arguments not matched pair', function() {
      (function() { parse('@a([] a,)'); }).should.throw();
      (function() { parse('@a({} a)'); }).should.throw();
      (function() { parse('@a("" a)'); }).should.throw();
    });
  });

  context('all of it', function() {
    it('should work', function() {
      var p = parse('abc @a(@c.f, \\@t, []) @b');
      p.tpl.should.eql('abc _ _');

      matchArgs(p.args, 2,
        {caller: [{name: 'a', args: [ [{name: 'c'}, {name: 'f'}], '@t', '[]' ]}], index: 4},
        {caller: [{name: 'b'}], index: 6}
      )
    });
  });
});
