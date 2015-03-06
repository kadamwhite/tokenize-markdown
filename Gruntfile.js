var merge = require( 'lodash.merge' );

module.exports = function( grunt ) {
  'use strict';

  // Reusable JSHintRC options
  var jshintrc = grunt.file.readJSON( '.jshintrc' );

  // Load tasks.
  require( 'load-grunt-tasks' )( grunt );

  grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),

    jscs: {
      options: {
        config: '.jscsrc',
        reporter: require( 'jscs-stylish' ).path
      },
      grunt: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: 'tokenize-markdown.js'
      },
      tests: {
        src: 'tests/**/*.js'
      }
    },

    jshint: {
      options: {
        reporter: require( 'jshint-stylish' )
      },
      grunt: {
        options: jshintrc,
        src: 'Gruntfile.js'
      },
      lib: {
        options: jshintrc,
        src: 'tokenize-markdown.js'
      },
      tests: {
        options: merge({
          globals: {
            afterEach: false,
            beforeEach: false,
            describe: false,
            it: false
          }
        }, jshintrc ),
        src: 'tests/**/*.js'
      }
    },

    simplemocha: {
      tests: {
        src: 'tests/**/*.js',
        options: {
          reporter: process.env.CI ? 'list' : 'nyan'
        }
      }
    }

  });

  grunt.registerTask( 'lint', [ 'jshint', 'jscs' ] );
  grunt.registerTask( 'test', [ 'simplemocha' ] );
  grunt.registerTask( 'default', [ 'lint', 'test' ] );
};
