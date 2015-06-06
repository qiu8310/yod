/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

module.exports = function (yod, assert, _) {

  yod.type('All', function() { return 'all'; });

  var data = yod({
    "a": "a",
    "b": false,
    "n": 3,
    d: '@Self.a.replace(@Self.a, @Self.n)',
    "useParentAndSelf": {
      "arr": [
        1,
        "@Parent.b",
        "@Parent.n",
        {
          t: "@All @All",
          d: "@Parent.aa"
        }
      ],
      "a": "@Parent.a",
      "aa": "@Self.a@Self.a"
    },
    "modifier": "@Self.a.replace(a, hack)",
    "execScript": "` 2 + 1 `",
    "@Self.useParentAndSelf.aa": "hack key"
  });


  assert.deepEqual(data, {
    a: 'a',
    b: false,
    n: 3,
    d: "3",
    useParentAndSelf: {arr: [1, false, 3, {t: 'all all', d: 'aa'}], a: 'a', aa: 'aa'},
    modifier: 'hack',
    execScript: 3,
    aa: 'hack key'
  });

};
