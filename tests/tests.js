'use strict';

// Set up test runner
var chai = require( 'chai' );
var expect = chai.expect;
var sinon = require( 'sinon' );
chai.use( require( 'sinon-chai' ) );

// // Pluck utility, for use in tests
// function pluck( arr, prop ) {
//   return arr.map(function( obj ) {
//     return obj.prop;
//   });
// }

var sampleFile1 = [{
  type: 'heading',
  depth: 1,
  text: 'This is a markdown file'
}, {
  type: 'code',
  lang: 'html',
  text: [
    '<!doctype html>',
    '<html>',
    '  <head>',
    '    <title>It has an HTML code block</title>',
    '  </head>',
    '</html>'
  ].join( '\n' )
}, {
  type: 'code',
  lang: 'js',
  text: 'console.log( \'it also has a "js" codeblock\' );'
}, {
  type: 'code',
  lang: 'javascript',
  text: [
    '// Not to be left out in the cold, it also has',
    'var aCodeBlock = \'of language "javascript"\';'
  ].join( '\n' )
}, {
  type: 'paragraph',
  text: 'As you can see by the above, Markdown is a pretty useful thing.'
}];

describe( 'tokenize-markdown', function() {
  var tokenizeMarkdown;
  var grunt;

  beforeEach(function() {
    // Reference to Grunt, for testing
    grunt = require( 'grunt' );
    tokenizeMarkdown = require( '../tokenize-markdown' );
  });

  describe( 'fromFiles()', function() {

    it( 'exists', function() {
      expect( tokenizeMarkdown.fromFiles ).to.exist;
    });

    it( 'is a method', function() {
      expect( tokenizeMarkdown.fromFiles ).to.be.a( 'function' );
    });

    it( 'expands the provided file glob list', function() {
      var fileGlobs = 'tests/fixtures/**/*.md';
      sinon.spy( grunt.file, 'expand' );
      tokenizeMarkdown.fromFiles( fileGlobs );

      expect( grunt.file.expand ).to.have.been.calledWith( fileGlobs );
      grunt.file.expand.restore();
    });

    it( 'reads each file matched by the provided globs', function() {
      var fileGlobs = 'tests/fixtures/**/*.md';
      sinon.spy( grunt.file, 'read' );
      tokenizeMarkdown.fromFiles( fileGlobs );

      [
        'tests/fixtures/sample-markdown-2.md',
        'tests/fixtures/sample-markdown-without-codeblocks.md',
        'tests/fixtures/sample-markdown.md'
      ].forEach(function( fileName ) {
        expect( grunt.file.read ).to.have.been.calledWith( fileName );
      });
    });

    it( 'parses markdown files into an object of that file\'s tokens', function() {
      var file = 'tests/fixtures/sample-markdown.md';
      var fileTokens = tokenizeMarkdown.fromFiles( file );

      expect( fileTokens.length ).to.equal( 1 );

      var obj = fileTokens[ 0 ];

      expect( obj ).to.have.ownProperty( 'file' );
      expect( obj.file ).to.equal( file );
      expect( obj ).to.have.ownProperty( 'tokens' );
      expect( obj.tokens ).to.be.instanceOf( Array );
    });

    it( 'properly tokenizes a markdown file', function() {
      var file = 'tests/fixtures/sample-markdown.md';
      var tokens = tokenizeMarkdown.fromFiles( file )[ 0 ].tokens;
      var assertionsCount = 0;

      expect( tokens.length ).to.equal( 5 );

      tokens.forEach(function( token, index ) {
        var expectedToken = sampleFile1[ index ];
        for ( var key in token ) {
          expect( expectedToken[ key ] ).to.equal( token[ key ] );
          assertionsCount++;
        }
      });
      // Ensure that the for-in caught the expected number of token properties
      expect( assertionsCount ).to.equal( 14 );
    });

    it( 'can filter the returned tokens by one property', function() {
      var file = 'tests/fixtures/sample-markdown.md';
      var tokens = tokenizeMarkdown.fromFiles( file, {
        type: 'code'
      })[ 0 ].tokens;

      expect( tokens.length ).to.equal( 3 );

      tokens.forEach(function( token, index ) {
        expect( token.type ).to.equal( 'code' );
      });
    });

    it( 'can filter the returned tokens by two properties', function() {
      var file = 'tests/fixtures/sample-markdown.md';
      var tokens = tokenizeMarkdown.fromFiles( file, {
        type: 'code',
        lang: 'js'
      })[ 0 ].tokens;

      expect( tokens.length ).to.equal( 1 );

      var token = tokens[ 0 ];

      expect( token.type ).to.equal( 'code' );
      expect( token.lang ).to.equal( 'js' );
      expect( token.text ).to.equal( 'console.log( \'it also has a "js" codeblock\' );' );
    });

    it( 'can use a regex to filter the returned tokens', function() {
      var file = 'tests/fixtures/sample-markdown.md';
      var tokens = tokenizeMarkdown.fromFiles( file, {
        type: 'code',
        lang: /(js|javascript)/
      })[ 0 ].tokens;

      expect( tokens.length ).to.equal( 2 );

      var token1 = tokens[ 0 ];

      expect( token1.type ).to.equal( 'code' );
      expect( token1.lang ).to.equal( 'js' );
      expect( token1.text ).to.equal( 'console.log( \'it also has a "js" codeblock\' );' );

      var token2 = tokens[ 1 ];

      expect( token2.type ).to.equal( 'code' );
      expect( token2.lang ).to.equal( 'javascript' );
      // sampleFile3 is the one that is lang "javascript"
      expect( token2.text ).to.equal( sampleFile1[ 3 ].text );
    });

    it( 'can still filter if the regex is overly broad', function() {
      var file = 'tests/fixtures/sample-markdown-2.md';
      var tokens = tokenizeMarkdown.fromFiles( file, {
        type: 'code',
        lang: /(js|javascript)/
      })[ 0 ].tokens;

      expect( tokens.length ).to.equal( 1 );

      var token1 = tokens[ 0 ];

      expect( token1.type ).to.equal( 'code' );
      expect( token1.lang ).to.equal( 'js' );
      expect( token1.text ).to.equal( 'var Demo = new Backbone.Model.extend({});' );
    });

    it( 'can still filter correctly if no matching tokens are found', function() {
      var file = 'tests/fixtures/sample-markdown-without-codeblocks.md';
      var tokens = tokenizeMarkdown.fromFiles( file, {
        type: 'code'
      })[ 0 ].tokens;

      expect( tokens.length ).to.equal( 0 );
    });

  });

});
