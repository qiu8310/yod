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
    o: {x: 'x', y: 'y', z: '@Parent.c'},

    x: '@Self.o.x',
    y: '@Self.o.y@Self.o.y',
    z: '`"@Self.o.z" + "@Self.o.z"`',

    l: '@Self.a.length'
  });


  assert.deepEqual(data, {
    a: ['a'],
    b: 'b',
    c: 'c',
    o: {x: 'x', y: 'y', z: 'c'},

    x: 'x',
    y: 'yy',
    z: 'cc',

    l: 1
  });

};
