/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

module.exports = function(yod, assert, _) {

  var data = yod({
    a: ['a'],
    b: 'b',
    c: 'c',
    d: '@(dd)',
    e: '@()',
    o: {x: 'x', y: 'y', z: '@Parent.c', deep: { u: 'u', v: '@Parent.Parent.s' }},
    s: {s: 's'},
    x: '@Self.o.x',
    y: '@Self.o.y@Self.o.y',
    z: '`"@Self.o.z" + "@Self.o.z"`',

    deep: '@Self.o.deep.u',

    l: '@Self.a.length'
  });


  assert.deepEqual(data, {
    a: ['a'],
    b: 'b',
    c: 'c',
    d: 'dd',
    e: '',
    o: {x: 'x', y: 'y', z: 'c', deep: { u: 'u', v: {s: 's'}}},
    s: {s: 's'},
    x: 'x',
    y: 'yy',
    z: 'cc',

    deep: 'u',

    l: 1
  });

};
