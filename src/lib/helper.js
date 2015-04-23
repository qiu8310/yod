/*
 * yod
 * https://github.com/qiu8310/yod
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */
var jsonfy = require('jsonfy');
var _ = require('lodash');
var alter = require('alter');


/**
 * The regexp for parse depends
 * @type {RegExp}
 * @private
 */
var _reCaller = /(\$\{)?(@[A-Z]\w*(?:\([^\)]*\))?(?:\.\w+(?:\([^\)]*\))?)*)(\})?/g;
var _reCallerPart = /[@|\.](\w+)(?:\(([^\)]*)\))?/g;


/**
 *
 * helper functions
 *
 * @namespace helper
 * @type {Object}
 */
var helper = {

  /**
   *
   * Wrap the function which can generate data
   *
   * @param {Function} fn - function which can generate data
   * @param {Array} args - fn arguments
   * @param {*} [context = null] - fn context
   * @returns {Function}
   *
   *
   * @example
   *
   * helper.generator(function() {
   *   return 'a';
   * });
   */
  generator: function(fn, args, context) {
    return function() {
      return fn.apply(context || null, args || []);
    };
  },

  /**
   * Replace inner quote string
   * @param {String} str
   * @param {String|Function} replacer
   * @returns {{result: String, backup: Array}}
   *
   * @example
   *
   * helper.backupInnerQuote('Are "mora" ok?', '_');
   *
   * // => {result: 'Are "____" ok?', backup: [{start: 5, end: 10, str: 'mora'}]}
   */
  backupInnerQuote: function(str, replacer) {
    replacer = _.isUndefined(replacer) ? ' ' : replacer;
    var backup = [];
    var handler = function(raw, index) {
      var ch = raw.charAt(0);
      var str = _.isFunction(replacer) ?
        replacer.apply(null, arguments) :
        ch + _.repeat(String(replacer), raw.length - 2) + ch;
      backup.push({start: index, end: index + str.length, str: raw});
      return str;
    };
    str = str.replace(/'[^']+'/g, handler).replace(/"[^"]+"/g, handler);
    return {
      result: str,
      backup: backup
    };
  },

  /**
   * Recover inner quote string
   * @param {String} str
   * @param {Array} backup
   * @returns {String}
   *
   * @example
   *
   * helper.recoverInnerQuote('Are "____" ok?', [{start: 5, end: 10, str: 'mora'}]);
   *
   * // => 'Are "mora" ok?'
   */
  recoverInnerQuote: function(str, backup) {
    return alter(str, backup);
  },


  /**
   *
   * Parse all arguments and get the callers
   *
   * @param {*} param - parameter that you want parse
   * @param {*} [...others = null] - other parameters
   * @returns {Array} returns all callers
   *
   * @example
   *
   * helper.getCaller(234);
   * // => []
   *
   * helper.getCaller('@Bool is true or false.');
   * // => ['@Bool']
   *
   *
   * helper.getDepends(['@Self.baby is a baby', '@String.upper is a random uppercase string'])
   * // => ['@Self.baby', '@String.upper']
   */
  getCallers: function() {
    var result = _.reduce(_.flattenDeep(_.slice(arguments)), function(result, param) {
      var matches;
      if (!_.isString(param)) { return result; }

      // @TODO: 引号中可能会含有括号 "(", ")"，它们会影响正则的匹配，所以先保存括号中的引号内的字符
      // @TODO: e.g: @String.replace('(', ')')

      while ((matches = _reCaller.exec(param))) {
        result.push(matches[2]);
      }
      return result;
    }, []);

    // @FIXED : Caller 中包含其它 caller， e.g @Range(@Self.age, 50)
    _.each([].concat(result), function(caller) {
      var str = caller.substr(1);
      if (str.indexOf('@') > 0) {
        result.unshift.apply(result, helper.getCallers(str));
      }
    });
    return _.uniq(result);
  },

  /**
   *
   * Get the depends from a param
   *
   * @param {*} param - parameter that you want parse
   * @param {*} [...others = null] - other parameters
   * @returns {Array} returns the depends
   *
   * @example
   *
   * helper.getDepends(234);
   * // => []
   *
   * helper.getDepends('@Self.name is my sister.');
   * // => ['@Self.name']
   *
   * helper.getDepends('You can call ${@Parent.target.repeat}.name')
   * // => ['@Parent.target.repeat']
   *
   * helper.getDepends(['@Self.baby is a baby', '@Self.young is a young man'])
   * // => ['@Self.baby', '@Self.young']
   */
  getDepends: function() {
    return _.filter(helper.getCallers(arguments), function(caller) {
      return caller.indexOf('@Self') === 0 || caller.indexOf('@Parent') === 0;
    });
  },


  /**
   * Make sure placeholder is unique, used by {@link helper.explodeCallerStr} and {@link helper.implodeCallerStr}
   */
  placeholder: '%__<_>__s',

  /**
   * Parser string to template, and it's arguments
   * @param {String} str
   * @returns {Object} - include tpl and args
   *
   * @example
   *
   * helper.explodeCallerStr('Are @SomeName ok?');
   *
   * // => {tpl: 'Are %__<_>__s ok?', args: ['@SomeName']}
   */
  explodeCallerStr: function(str) {
    var args = [];
    var tpl = str.replace(_reCaller, function(raw, left, caller, right) {
      if (left === '${' && right === '}') {
        left = '';
        right = '';
      }
      args.push(caller);
      return (left || '') + helper.placeholder + (right || '');
    });
    return {tpl: tpl, args: args};
  },

  /**
   * Join helper.explodeCallerStr parts
   * @param {String} tpl
   * @param {Array} args
   * @returns {String}
   *
   * @example
   *
   * helper.implodeCallerStr('Are %__<_>__s ok?', ['David']);
   *
   * // => 'Are David ok?'
   */
  implodeCallerStr: function(tpl, args) {
    _.each(args, function(arg) {
      tpl = tpl.replace(helper.placeholder, String(arg));
    });
    return tpl;
  },

  /**
   * Parse arguments string to array.
   *
   * @param {String} args
   * @returns {Array}
   *
   * @example
   *
   * helper.parseArgsStrToArray('a, b, c')
   * // => ['a', 'b', 'c']
   *
   * @example
   *
   * helper.parseArgsStrToArray('{a: aa, b: true}, "I'm fine"')
   *
   * // => ['{a: aa, b: true}', 'I\'m fine']
   */
  parseArgsStrToArray: function(args) {
    var argsChars = args.split('');
    var result = [], len = argsChars.length, i, ch, start, arg,
      state = 0, left, right, count, next;

    var nextTo = function(target) {
      var result = [];
      while (i + 1 < len && argsChars[i + 1] !== target) {
        result.push(argsChars[i + 1]);
        i++;
      }
      return result.join('');
    };

    var endArg = function() {
      next = nextTo(',');
      arg = _.trim(args.substring(start, ++i));

      //var left = arg.charAt(0), right = arg.slice(-1);
      //if (
      //  arg.length > 1 &&
      //  left === '{' && right === '}' ||
      //  left === '[' && right === ']' ||
      //  left === right && _.includes(['"', '\''], left)
      //) {
      //  arg = jsonfy(arg);
      //} else {
      //  try {
      //    arg = jsonfy(arg);
      //  } catch (e) {}
      //}

      try {
        arg = jsonfy(arg);
      } catch (e) {}

      result.push(arg);
      state = 0;
    };

    for (i = 0; i < len; i++) {
      ch = argsChars[i];
      if (state === 0) {
        if (!_.trim(ch)) { continue; }
        start = i;
        if (ch === '[' || ch === '{') {
          state = 1;

          left = ch;
          right = ch === '[' ? ']' : '}';
          count = 1;
        } else if (ch === '\'' || ch === '"') {
          state = 2;
          right = ch;
        } else {
          endArg();
        }
      } else {
        if (state === 1) {
          count += left === ch ? 1 : (right === ch ? -1 : 0);
          if (count === 0) {
            endArg();
          }
        } else { // state === 2
          if (ch === right) {
            endArg();
          }
        }
      }
    }

    if (state > 0) { endArg(); }

    return result;
  },

  /**
   * Parse caller to {@link tm.generator}'s arguments
   * @param {String} caller
   * @returns {Array}
   *
   * @example
   *
   * helper.parseCaller('@String(abc).repeat(3).title')
   *
   * // => [ {name: 'String', args: ['abc']}, {name: 'repeat', args: [3]}, {name: 'title', args: []} ]
   */
  parseCaller: function(caller) {
    var result = [];
    caller.replace(_reCallerPart, function(raw, name, args) {
      args = args ? helper.parseArgsStrToArray(_.trim(args)) : [];
      result.push({name: name, args: args});
    });
    return result;
  },

  /**
   * A RegExp used for match callers in string.
   * @type {RegExp}
   */
  reCaller: _reCaller
};

module.exports = helper;
