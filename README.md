# tokenize-markdown

[![Build Status](https://travis-ci.org/kadamwhite/tokenize-markdown.svg?branch=master)](https://travis-ci.org/kadamwhite/tokenize-markdown)

Get an array of markdown tokens per file from an array of files, optionally
filtered to only those tokens matching a particular set of attributes

## Installation

Install via NPM with `npm install tokenize-markdown`.

## Usage

```js
var tokenizeMarkdown = require( 'tokenize-markdown' );

// Get all tokens
var tokens = tokenizeMarkdown.fromFiles( ['some_markdown_file.md' ] );

// Get only tokens of type "code" and lang "javascript"
var jsTokens = tokenizeMarkdown.fromFiles( [ 'slides/*.md' ], {
  type: 'code',
  lang: 'javascript'
});

// Get tokens of lang "javascript" or "html", using a regex
var jsOrHtmlTokens = tokenizeMarkdown.fromFiles( [ 'slides/*.md' ], {
  lang: /(javascript|html)/
});
```

## Credits

&copy; 2015 [K. Adam White](https://github.com/kadamwhite), based on work by [Tim Branyen](https://github.com/tbranyen)

Released under the [MIT License](LICENSE).
