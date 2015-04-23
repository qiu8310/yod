# yod
[![NPM version](https://badge.fury.io/js/yod.svg)](https://npmjs.org/package/yod)
[![GitHub version][git-tag-image]][project-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]
[![Inline docs][doc-image]][doc-url]
[![Code Climate][climate-image]][climate-url]
[![Coverage Status][coveralls-image]][coveralls-url]


Fantasy data generator.


[Online Object Data Generator](http://qiu8310.github.io/yod)


## Usage



## Warning

* ${@String.repeat()} 结构中：

  - 括号中的参数不能带有 ")"，否则会导致解析失败，比如：@String.replace(")", "") 会解析成 @String.replace(")

* ${@String.repeat} 结构中，${ 后面和 } 前面都不能含有空格

## API

### yod(anything)

### yod.type(name, generator [, aliases...])

### yod.emptyTypes()

### yod.modifier([filters,] name, modifierFn)

### yod.emptyModifiers()

### yod.config(key [, val] [, meta])

### yod.config.all

### yod.config.meta




## Install

### Browser

### Node




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

