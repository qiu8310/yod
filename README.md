# yod
[![NPM version](https://badge.fury.io/js/yod.svg)](https://npmjs.org/package/yod)
[![GitHub version][git-tag-image]][project-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]
[![Inline docs][doc-image]][doc-url]
[![Code Climate][climate-image]][climate-url]
[![Coverage Status][coveralls-image]][coveralls-url]


Fantasy data generator.

Use [yod-mock](https://github.com/qiu8310/yod-mock) for more pre-defined types and modifiers..

[Online Object Data Generator](http://qiu8310.github.io/yod)


## Usage

__Create a String type to generate random string.__

```javascript
yod.type('String', function(len) {
  len = len || Math.round(Math.random() * 10);
  var pool = 'abcdefghigklmnopqrstuvwxyz';
  var poolLen = pool.length;
  var result = '';
  for (var i = 0; i < poolLen; i++) {
    result += pool[Math.round(Math.random() * (poolLen - 1))]
  }
  return result;
});
```

__Create a Int type to generate random integer.__

```javascript
yod.type('Int', function() {
  return Math.round(Math.random() * 100);
});
```

__Create a User type.__

```javascript
yod.type('User', {
  name: '@String(5)',
  age: '@Int'
});
```

__And then you can generate random User by calling `yod('@User')`.__

```javascript
yod('@User'); 

// Will create a random object like: `{name: 'atx', age: 30}`.
```

## Terminology

* __Caller__: Prepend with a `"@"` character, follow by series string which like function calling.
  
  e.g: `@Bool`, `@String.repeat(3).join(",")`, `@Self.someKey`.

* __Generator__: The source that can generate other thing, in `yod`, generator can be anything.


## API


### yod(generator)

Parameter: `generator`, Type: `*`

Use the `generator` as a generator to get other generated value.

In `generator`, you can use caller string, you can execute javascript, you can get config value.

#### Yod example:

```javascript
// Execute javascript, wrapped in "`" (just calling `eval` to get the result)
yod("` 1 + 3 `");     // => 4
yod("` 'a' + 3 `");   // => 'a3'


// Use caller string
yod({ a: "a", b: "a's value is @Self.a" });   // => {a: "a", b: "a's value is a"}


// get config value
yod.config("a.b", "1"); // At first, use yod.config set a value
yod("@Config.a"); // => {b: "1"}

```

### yod.type(name, generator [, aliases...])

Parameter: `name`, Type: `String`

Parameter: `generator`, Type: `*`

Parameter: `aliases`, Type: `String` or `String Array`, optional

Create a new type, so that you can use it in caller string.

#### Type example:

```javascript
// Create a Bool type, and alias Boolean. it will random return true or false.
yod.type('Bool', function() {

  return Math.round(Math.random() * 100) % 2 === 0;

}, 'Boolean');



// Call your new type.
yod('@Bool');     // return true or false.
yod('@Boolean');  // return true or false.

```

### yod.types

All defined types.


### yod.isTypeNameExists(name)

Check if the type name exists.

### yod.isTypeNameValid(name)

Check if the type name is a valid.


### yod.emptyTypes()

Remove all defined types.

### yod.modifier([filters,] name, modifierFn)

Parameter: `filters`, Type: `String` or `Function` or `Array of String/Function`, optional

Parameter: `name`, Type: `String`

Parameter: `modifierFn`, Type: `Function`

Create a new modifier. 

__There are two type or modifier__

* Value modifier: modifier generator value.
* Function modifier: modifier generator function. Create it with ":" prepend to `name` 


#### Modifier example:

__Create a value modifier: index —— Get array's index item__

```javascript
yod.modifier('Array', 'index', function(val, index) {
  return val[index];
});


// Use it

yod({
  a: ['a', 'b', 'c']
  b: '@Self.a.index[1]'
});
// => {a: ['a', 'b', 'c'], b: 'b'}

```

__Create a function modifier: repeat —— Generate value array using generator function__

```javascript
yod.modifier('repeat', function(generatorFn, times) {
  var result = [];
  for (var i = 0; i < times; i++) {
    result.push(generatorFn());
  }
  return result;
});


// Use it (@Bool is defined in yod.type area)

yod('@Bool.repeat(3)');
// Will generator a array like this: [true, false, false]. the boolean value is random. 

```

### yod.modifiers

All defined modifiers.

### yod.isModifierNameExists(name)

Check if the modifier name exists.

### yod.isModifierNameValid(name)

Check if the modifier name is a valid.

### yod.emptyModifiers()

Remove all defined modifiers.

### yod.config(key [, val] [, meta])

Parameter: `key`, Type: `String`

Parameter: `val`, Type: `*`

Parameter: `meta`, Type: `*`

Get or set a config key. When set a key, you can also set a meta on this key.

If you want get the value and the meta, you can append a string ":meta" to the `key`,
then the result will be something like this: `{val: ..., meta: ...}`

#### Config example:

```javascript
// Set
yod.config('a.b', 'ab');
yod.config('a.c', 'ac', 'ac-meta');


// Get
yod.config('a');        // => {b: 'ab', c: 'ac'}
yod.config('a:meta');   // => {val: {b: 'ab', c: 'ac'}, meta: undefined}
yod.config('a.c');      // => 'ac'
yod.config('a.c:meta'); // => {val: 'ac', meta: 'ac-meta'}


// Using in caller string. (You can't get meta data in this way, but you can get it by adding a modifier)
yod('@Config.a');       // => {b: 'ab', c: 'ac'}
yod('@Config.a.c');     // => 'ac'

```


### yod.config.all

Type: `Object`

All config data.

### yod.config.meta

Type: `Object`

All meta data.


## Wrong user case


* Caller string's arguments can not include ")".

  ```javascript
  @String.replace(")", "") 
  // Will parsed to `@String.replace('"')`
  ```
  
* Object generator can not recycle depends.

  ```javascript
  yod({
    a: '@Self.b',
    b: '@Self.a'
  });
  
  // Will throw error.
  ```
  
* Child object can't depend on it parents, similar to recycle depends.

  ```javascript
  yod({
    a: {
      b: {
        c: '@Parent.Parent.a'
      }
    }
  });
  
  // Will throw error.
  ```

## Install

### Browser

```bash
bower install yod --save-dev
```


### Node

```bash
npm install yod --save
```



## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp](http://gulpjs.com/).



## License

Copyright (c) 2015 Zhonglei Qiu. Licensed under the MIT license.



[doc-url]: http://inch-ci.org/github/qiu8310/yod
[doc-image]: http://inch-ci.org/github/qiu8310/yod.svg?branch=master
[project-url]: https://github.com/qiu8310/yod
[git-tag-image]: http://img.shields.io/github/tag/qiu8310/yod.svg
[climate-url]: https://codeclimate.com/github/qiu8310/yod
[climate-image]: https://codeclimate.com/github/qiu8310/yod/badges/gpa.svg
[travis-url]: https://travis-ci.org/qiu8310/yod
[travis-image]: https://travis-ci.org/qiu8310/yod.svg?branch=master
[daviddm-url]: https://david-dm.org/qiu8310/yod.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/qiu8310/yod
[coveralls-url]: https://coveralls.io/r/qiu8310/yod
[coveralls-image]: https://coveralls.io/repos/qiu8310/yod/badge.png

