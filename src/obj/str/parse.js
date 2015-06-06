/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var Caller = require('./caller');
var engine = require('./engine');
var _ = require('lodash');
var exec = require('./exec');

/**
 * 解析字符串中的 Caller 调用，如果是数组，则遍历数组中的字符串，如果是其它类型，则直接返回
 * @param {String|Array|*} any
 * @param {Array<KVPair>} pairStack
 * @returns {*}
 */
function parse (any, pairStack) {
  if (_.isArray(any)) {
    return _.map(any, function(k) { return parse(k, [].concat(pairStack)); });
  }

  // 数组中有可能包含一个 Object，所以还要用下 any.getValue
  //if (!_.isString(any)) { return any && any.getValue ? any.getValue([].concat(pairStack)) : any; }
  if (!_.isString(any)) { return any; }

  var parsedStr = engine(any),
    tpl = parsedStr.tpl,
    tplArgs = parsedStr.args;

  _.each(parsedStr.args, function(arg) {
    arg.caller = new Caller(arg.caller);
  });

  if (tpl === '_' && tplArgs.length === 1) {
    return tplArgs[0].caller.getValue(pairStack);
  }

  var start = 0, result = '';

  _.each(tplArgs, function(arg) {
    result += tpl.substring(start, arg.index) + arg.caller.getValue([].concat(pairStack));
    start = arg.index + 1;
  });

  result += tpl.substr(start);

  return exec(result);
}

module.exports = parse;
