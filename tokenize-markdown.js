'use strict';

var marked = require( 'marked' );
var grunt = require( 'grunt' );
var reduce = require( 'lodash.reduce' );
var isRegExp = require( 'lodash.isregexp' );

/**
 * Convert provided content into a token list with marked
 *
 * @param  {String} contents       A markdown string or file's contents
 * @param  {Object} [filterParams] An optional array of properties to use to
 *                                 filter the returned tokens for this file
 * @return {Object}
 */
function convertToTokens( contents, filterParams ) {
  var tokens = marked.lexer( contents );

  // Simple case: no filtering needs to happen
  if ( ! filterParams ) {
    // Return the array of tokens from this content
    return tokens;
  }

  /**
   * Filter method to check whether a token is valid, based on the provided
   * object of filter parameters
   *
   * If the filter object defines a RegExp for a key, test the token's property
   * against that RegExp; otherwise, do a strict equality check between the
   * provided value and the token's value for a given key.
   *
   * @param  {Object} token A token object
   * @return {Boolean}      Whether the provided token object is valid
   */
  function isTokenValid( token ) {
    /**
     * Reducer function to check token validity: start the token out as valid,
     * then reduce through the provided filter parameters, updating the validity
     * of the token after checking each value.
     *
     * @param  {Boolean}       valid       Reducer function memo value
     * @param  {String|RegExp} targetValue The expected value of the specified property
     *                                     on this token, or else a RegExp against which
     *                                     to test that property
     * @param  {String}        key         The key within the token to test
     * @return {Boolean}                   Whether the token is still valid, after
     *                                     validating the provided key
     */
    function checkTokenParam( valid, targetValue, key ) {
      // Once invalid, always invalid: fast-fail in this case
      if ( ! valid ) {
        return false;
      }

      // Without a target value, filtering doesn't mean much: move along
      if ( typeof targetValue === 'undefined' ) {
        return true;
      }

      var tokenPropToTest = token[ key ];

      if ( isRegExp( targetValue ) ) {
        // Special-case if the target value is a RegExp
        return targetValue.test( tokenPropToTest );
      }

      return tokenPropToTest === targetValue;
    }

    // Check each property on this token against the provided params
    return reduce( filterParams, checkTokenParam, true );
  }

  // Return a filtered array of tokens from the provided content
  return tokens.filter( isTokenValid );
}

/**
 * Get an array of markdown tokens per file from an array of files, optionally
 * filtered to only those tokens matching a particular set of attributes
 *
 * @example
 *
 *     var tokenizeMarkdown = require( 'tokenize-markdown' );
 *
 *     // Get all tokens
 *     var tokens = tokenizeMarkdown.fromFiles( [ 'slides/*.md' ] );
 *
 *     // Get only tokens of type "code" and lang "javascript"
 *     var jsTokens = tokenizeMarkdown.fromFiles( [ 'slides/*.md' ], {
 *       type: 'code',
 *       lang: 'javascript'
 *     });
 *
 *     // Get tokens of lang "javascript" or "html", using a regex
 *     var jsOrHtmlTokens = tokenizeMarkdown.fromFiles( [ 'slides/*.md' ], {
 *       lang: /(javascript|html)/
 *     });
 *
 * @method fromFiles
 * @param  {Array}  files          Array of file sources to expand and process
 * @param  {Object} [filterParams] Optional hash of properties to use to filter
 *                                 the returned tokens
 * @return {Array}                 Array of token objects
 */
function tokenizeMarkdownFromFiles( files, filterParams ) {
  /**
   * Read in the provided file and return its contents as markdown tokens
   *
   * @param  {String} file A file path to read in
   * @return {Array}       An array of the individual markdown tokens found
   *                       within the provided list of files
   */
  function readAndTokenize( file ) {
    // Read the file
    var fileContents = grunt.file.read( file );

    // Map file into an object defining the tokens for this file
    return {
      file: file,
      tokens: convertToTokens( fileContents, filterParams )
    };
  }

  // Expand the provided file globs into a list of files, and process each
  // one into an object containing that file's markdown tokens
  return grunt.file.expand( files ).map( readAndTokenize );
}

module.exports = {
  fromFiles: tokenizeMarkdownFromFiles,
  fromString: convertToTokens
};
