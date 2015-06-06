/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */
var _ = require('lodash');
var jsonfy = require('jsonfy');
var tm = require('../../tm/tm');
var allConfig = require('../../config').all;
var exec = require('./exec');

function Caller(series) {

  this.series = series;
  this.first = series[0];
  this.hasDepend = _.includes(['Parent', 'Self'], this.first.name);

  _.each(series, function(ser) {
    if (ser.args && ser.args.length) {
      _.each(ser.args, function(arg, i) {
        if (_.isArray(arg)) {
          ser.args[i] = new Caller(arg);
        }
      });
    }
  });
}

function _callConfig(caller) {
  var series = caller.series.slice(1); // Shift '@Config'
  var ser = series[0];
  var value = allConfig;
  if (!ser || ser.args || !value.hasOwnProperty(ser.name)) {
    throw new Error('Config key "' + (ser && ser.name || '') + '" not found.');
  }
  while (ser && !ser.args && value.hasOwnProperty(ser.name)) {
    value = value[ser.name];
    ser = series.shift();
  }
  return tm.fnGenerator(function () {
    return value;
  }, series)();
}

function _callDepend(caller, pairStack) {
  var pair = _.last(pairStack);

  if (!pair) { throw new Error(caller + ' not a object.'); }
  var node = pair.node;
  var tempPair, depPair;
  var inSelfOrParent = true, series = [];

  _.each(caller.series, function(ser, i) {
    if (ser.args) { series = caller.series.slice(i); return false; } // Self 或 Parent 及其 keys 调用时不能带括号

    if (!_.includes(['Parent', 'Self'], ser.name)) { inSelfOrParent = false; }

    if (inSelfOrParent) {
      if (ser.name === 'Parent') {
        if (!node.parent) { throw new Error('Not found parent for ' + node + '.'); }
        node = node.parent;
      }
    } else {
      tempPair = node.findPairByKey(ser.name);
      if (tempPair) {
        depPair = tempPair;

        if (tempPair.hasChildPairs) {
          node = tempPair.value;
        }
      } else {
        series = caller.series.slice(i);
        return false;
      }
    }
  });

  if (!depPair) {
    throw new Error(caller + ' resolved error.');
  }

  if (depPair.isParentOf(pair)) {
    throw new Error(pair + ' can not depend on it\'s direct parent node.');
  }

  return tm.fnGenerator(function() { return depPair.getValue(pairStack); }, series)();
}

/**
 * 先把它内部的子 Caller 解析了
 * @param {Array<KVPair>} pairStack
 */
Caller.prototype.getValue = function(pairStack) {
  // 解析每个 Caller 中的参数的值
  _.each(this.series, function(ser) {
    _.each(ser.args || [], function(arg, i) {
      if (arg instanceof Caller) {
        ser.args[i] = arg.getValue([].concat(pairStack));
      } else {
        ser.args[i] = exec(arg);
        try {
          ser.args[i] = jsonfy(arg);  // 解析值失败则就把它当作字符串用，减少过多的异常
        } catch (e) {}
      }
    });
  });

  // 每个参数都解析完成了，现在是解析整个 Caller 的时候了

  if (this.hasDepend) { // @Self.Parent.someKey 的形式

    return _callDepend(this, pairStack);

  } else if (this.first.name === true) {  // @(something).process...

    var val = this.first.args.length ? this.first.args[0] : ''; // 用户没传数据就返回一个空字符串吧
    return tm.fnGenerator(function() { return val; }, this.series.slice(1))();

  } else if (this.first.name === 'Config') {  // @Config.key.foo 的形式

    return _callConfig(this);

  } else {  // 其它情况
    return tm.generator(this.series)();
  }

};


/**
 * To string
 * @returns {String}
 */
Caller.prototype.toString = function() {
  var result = '@', flag;
  _.each(this.series, function(ser) {
    if (ser.name !== true) { result += (result === '@' ? '' : '.') + ser.name; }

    if (ser.args) {
      result += '(';
      flag = '';
      _.each(ser.args, function(arg, i) {
        result += arg.toString() + flag;
        flag = ', ';
      });
      result += ')';
    }
  });
  return result;
};

module.exports = Caller;
