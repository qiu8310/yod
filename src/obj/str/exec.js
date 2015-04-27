/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

/**
 * 调用 eval 去执行 str，str 两端需要带有 `
 * @param {String} str
 * @returns {*}
 */
function exec(str) {
  /* jshint ignore:start */
  if (str[0] === '`' && str.slice(-1) === '`') {
    try {
      var evalStr = 'data = ' + str.substr(1, str.length - 2);
      eval('eval')(evalStr);
      return data;
    } catch (e) {
      // 执行错误返回原字符串
    }
  }
  return str;
  /* jshint ignore:end */
}

module.exports = exec;
