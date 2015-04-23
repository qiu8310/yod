/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

module.exports = function(yod, assert, _) {

  // Create function type
  yod.type('Range', function(start, end, step) {

    // Use lodash's range
    return _.range.apply(_, arguments);

  });


  assert.deepEqual(yod('@Range'), []);
  assert.deepEqual(yod('@Range(2)'), [0, 1]);
  assert.deepEqual(yod('@Range(3)'), [0, 1, 2]);

  assert.deepEqual(yod('@Range(2, 3)'), [2]);
  assert.deepEqual(yod('@Range(3, 5)'), [3, 4]);

  assert.deepEqual(yod('@Range(1, 3, 1)'), [1, 2]);
  assert.deepEqual(yod('@Range(1, 3, 2)'), [1]);
  assert.deepEqual(yod('@Range(1, 6, 2)'), [1, 3, 5]);


  // Create object type with alias
  yod.type('User', {
    name: 'David',
    age: 20,
    hello: 'Hello @Self.name',
    to50: '@Range(@Self.age, "51", 10).join(",")'
  }, 'U');

  assert.deepEqual(yod('@U'), yod('@User'));

  assert.deepEqual(yod('@U'), {
    name: 'David',
    age: 20,
    hello: 'Hello David',
    to50: '20,30,40,50'
  });
};
