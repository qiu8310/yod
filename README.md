# yod
[![NPM version](https://badge.fury.io/js/yod.svg)](https://npmjs.org/package/yod)
[![GitHub version][git-tag-image]][project-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]
[![Inline docs][doc-image]][doc-url]
[![Code Climate][climate-image]][climate-url]
[![Coverage Status][coveralls-image]][coveralls-url]



Your data generator.


[Github Repo][project-url]

[JSDOC Generated Document](http://qiu8310.github.io/yod)


## Install

```bash
$ npm install --save yod
```


## Usage

```javascript
var yod = require('yod');
yod(); // "awesome"
```

## API

_(Coming soon)_

## Warning

* ${@String.repeat()} 结构中：

  - 括号中的参数不能带有 ")"，否则会导致解析失败，比如：@String.replace(")", "") 会解析成 @String.replace(")

* ${@String.repeat} 结构中，${ 后面和 } 前面都不能含有空格


## Some Data Provider
[cool-ascii-faces](https://github.com/maxogden/cool-ascii-faces)
[emoji](https://github.com/muan/emoji)


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp](http://gulpjs.com/).


## Reference
* [CI Test for Browser](https://ci.testling.com/) - Run your browser tests on every push, demo project [js-traverse](https://github.com/substack/js-traverse)
* [GA on Github](https://github.com/igrigorik/ga-beacon) - Google Analytics collector-as-a-service (using GA measurement protocol).
* [idiomatic.js](https://github.com/rwaldron/idiomatic.js) - Principles of Writing Consistent, Idiomatic JavaScript
* [Use jsdoc](http://usejsdoc.org/index.html)
* [Using the ES6 transpiler Babel on Node.js](http://www.2ality.com/2015/03/babel-on-node.html)
* [Node Collection](https://github.com/npm/newww/issues/313)
  - [http://tools.ampersandjs.com/](http://tools.ampersandjs.com/)
  - [https://github.com/sindresorhus/awesome-nodejs](https://github.com/sindresorhus/awesome-nodejs)
  - [https://www.npmjs.com/package/frontend-npm-goodies](https://www.npmjs.com/package/frontend-npm-goodies)
  - [https://github.com/Raynos/http-framework/wiki/Modules#response](https://github.com/Raynos/http-framework/wiki/Modules#response)
  - [https://github.com/npm-dom](https://github.com/npm-dom)
  - [https://www.npmjs.com/package/mad-science-modules](https://www.npmjs.com/package/mad-science-modules)
  - [https://www.npmjs.com/package/npm-collection-language-tools#readme](https://www.npmjs.com/package/npm-collection-language-tools#readme)
  - And more...


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

