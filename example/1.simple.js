/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

'use strict';

// Will called by mocha
module.exports = function(yod, assert, _) {

  //# If no '@', every thing should be itself.

  // yod( function )
  yod(function() { return new Date(); }).should.be.instanceof(Date);

  // yod( literal )
  assert.equal(yod('abc'), 'abc');
  assert.equal(yod(true), true);
  assert.equal(yod(null), null);
  assert.equal(yod(123), 123);

  // yod( array )
  assert.deepEqual(yod([]), []);
  assert.deepEqual(yod([1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(yod([1, true, 'a', '']), [1, true, 'a', '']);

  // yod( object )
  assert.deepEqual(yod({}), {});
  assert.deepEqual(yod({a: 'a'}), {a: 'a'});
  assert.deepEqual(yod({a: 'a', b: [123]}), {a: 'a', b: [123]});
  assert.deepEqual(yod({a: 'a', b: [123], c: {d: true}}), {a: 'a', b: [123], c: {d: true}});

};
