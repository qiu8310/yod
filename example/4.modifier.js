/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

module.exports = function(yod, assert, _) {

  // Function modifier
  yod.modifier(':repeat', function(fn, repeatNumber) {
    var result = [];
    for (var i = 0; i < repeatNumber; i++) {
      result.push(fn());
    }
    return result;
  });

  // Value modifier
  yod.modifier(
    function(arg) { return _.isString(arg); }, // Filter, only modifier string value
    'camel',          // Modifier name
    function(arg) {   // Modifier process
      return _.camelCase(arg);
    }
  );

  // Create a type for test
  yod.type('Pass', function(all) { return all; });

  // Test function modifier
  assert.deepEqual(yod('@Pass("a").repeat(3)'), ['a', 'a', 'a']);

  // Test value modifier
  assert.equal(yod('@Pass("good-dog").camel'), 'goodDog');
  assert.deepEqual(yod('@Pass(["a", "b"]).camel'), ['a', 'b']);

};