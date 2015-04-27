/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */

var scan = require('sscan');

/**
 * 解析 "abc @Caller.filter.foo(are, ok) end" 类似字符中的 @Caller.filter.foo(are, ok)
 *
 * - str 中可能同时存在多个 @Caller，如 "abc @Some.foo(a) def @Other end"
 * - 还需要支持 @Caller 内嵌 @Caller， 如 @Some.foo(@Other.bar(), true)
 * - @ 前面带有转义字符 \ 时，会去掉 \ 并忽略此 Caller，如果其它字符出现转义字符 \，不做任何处理
 * - 支持将一个完整的 @Caller 结构写在${...}中
 * - 支持在 @ 后面直接接一个值，如 @({...}).repeat
 *
 * @param {String} str
 * @returns {Object} - 返回的结果像这个 {tpl: "abc _ def _ end", args: [ [CallerStruct], [CallerStruct] ]}
 *
 * CallerStruct 类似于这种 Array：[{caller: {name: ..., args: []}, index: 4}, ... ]
 * 如果 caller 不带括号，args 为 false，否则是()中的参数，可以是0个参数，即 args 也会是个空数组。
 * args 里面也可能有 caller，但里面的没有 index 属性
 */
function parse (str) {

  var tpl = '';
  var callerStack = [];
  var pairs = {
    '`': '`',   // 用于执行 JS
    '"': '"',   // 双引号字符串
    '\'': '\'', // 单引号字符串
    '[': ']',   // 数组
    '{': '}'    // 对象
  };

  /**
   * 吸收链中的参数，参数中还可以包含 Caller
   *
   * @param {Scanner} s
   * @returns {Array}
   */
  var takeArgs = function(s) {
    var args = [], ch = true;
    while (ch) {
      s.white();
      ch = s.char();
      if (ch in pairs) {
        args.push(s.takePair(ch, pairs[ch]));
        s.white();
      } else if (ch === '@' && /[\w\(]/.test(s.peek())) {
        s.next();
        args.push(takeCaller(s));
      } else {  // 当作字符串处理
        if (ch === '\\' && s.peek() === '@') {
          s.next();
        }
        args.push(s.till(',)').trim());
      }
      s.white();
      if (s.isChar(')')) {
        ch = false; // 退出
      } else {
        s.next(','); // 继续下一个参数
      }
    }
    return args;
  };

  /**
   * 吸收 Caller 中的一条链，如 @Foo.bar 中的 Foo 或 bar
   * @param {Scanner} s
   * @returns {{}}
   */
  var takeOneChain = function(s, isFirst) {
    var obj = {};
    if (isFirst && s.isChar('(')) {
      obj.name = true;
    } else {
      obj.name = s.takeWord();
    }

    if (s.isChar('(')) { // 带有参数
      s.next();
      s.white();
      if (s.isChar(')')) {
        obj.args = []; // 带有 0 个参数，结束
      } else {
        obj.args = takeArgs(s);
      }
      s.next(')');
    }

    return obj;
  };

  var takeCaller = function(s) {
    var stack = []; // caller 中有串式的 stack

    stack.push(takeOneChain(s, true));
    while (s.isChar('.') && /\w/.test(s.peek())) { // 继续串式调用
      s.next();
      stack.push(takeOneChain(s));
    }

    return stack;
  };

  try {
    scan(str, function (done) {

      var s = this, ch = s.char(), left = false, caller, index;

      if (s.eos()) {
        done();
      }

      if (ch === '\\' && /@[\w\(]/.test(s.peek(2))) {
        tpl += s.next();
        ch = s.next();
      } else if (ch === '$' && /\{@[\w\(]/.test(s.peek(3))) {
        left = '${';
        s.next();
        ch = s.next();
      }
      if (ch === '@' && /[\w\(]/.test(s.peek())) {
        s.next(); // 去掉 @

        caller = takeCaller(s);

        if (left) {
          if (s.isChar('}')) {
            s.next();
          } else {
            tpl += left; // 将 ${ 补回去
          }
        }

        index = tpl.length; // 记录 index，到时替换之前的 placeholder
        tpl += '_'; // 只是个 placeholder，恢复时候会被替换了
        callerStack.push({caller: caller, index: index});
      } else {
        tpl += ch;
        s.next();
      }
    });
  } catch (e) { throw new SyntaxError('Parse error on ' + str); }

  return {tpl: tpl, args: callerStack};
}

module.exports = parse;
