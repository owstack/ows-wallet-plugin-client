module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project Configuration
  grunt.initConfig({
    exec: {
      clean: {
        command: 'rm -Rf bower_components node_modules build'
      },
    },
    watch: {
      options: {
        dateFormat: function(time) {
          grunt.log.writeln('The watch finished in ' + time + 'ms at ' + (new Date()).toString());
          grunt.log.writeln('Waiting for more changes...');
        },
      },
      css: {
        files: ['src/sass/*.css'],
        tasks: ['concat:css']
      },
      main: {
        files: [
          'src/js/api/*.js',
          'src/js/impl/*.js'
        ],
        tasks: ['concat:js']
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compact',
          sourcemap: 'none'
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['src/sass/*.scss'],
          dest: 'build/css/',
          ext: '.css'
        }]
      }
    },
    concat: {
      options: {
        sourceMap: false,
        sourceMapStyle: 'link' // embed, link, inline
      },
      js: {
        src: [
          'src/js/api/*.js',
          'src/js/impl/**/*.js'
        ],
        dest: 'build/ows-wallet-plugin-client.js'
      },
      js_bundle: {
        src: [
          'src/js/api/*.js',
          'src/js/impl/**/*.js',
          'bower_components/ng-lodash/build/ng-lodash.js',
          'bower_components/ionic/release/js/ionic.bundle.min.js'
        ],
        dest: 'build/ows-wallet-plugin-client.bundle.js'
      },
      css: {
        src: [
          'build/css/*.css'
        ],
        dest: 'build/ows-wallet-plugin-client.css'
      },
      css_bundle: {
        src: [
          'build/css/*.css',
          'bower_components/ionic/release/css/ionic.min.css'
        ],
        dest: 'build/ows-wallet-plugin-client.bundle.css'
      }
    },
    copy: {
      release: {
        expand: true,
        flatten: false,
        cwd: 'build/',
        src: [
          'ows-wallet-plugin-client.js',
          'ows-wallet-plugin-client.bundle.js',
          'ows-wallet-plugin-client.css',
          'ows-wallet-plugin-client.bundle.css'
        ],
        dest: 'release/'
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      prod: {
        files: {
          'release/ows-wallet-plugin-client.min.js': ['release/ows-wallet-plugin-client.js'],
          'release/ows-wallet-plugin-client.bundle.min.js': ['release/ows-wallet-plugin-client.bundle.js']
        }
      }
    },
    nggettext_extract: {
      pot: {
        files: {
          'i18n/po/template.pot': [
            'src/js/api/*.js',
            'src/js/impl/*.js'
          ]
        }
      },
    },
    nggettext_compile: {
      all: {
        options: {
          module: 'owsWalletPluginClient'
        },
        files: {
          'src/js/translations.js': ['i18n/po/*.po']
        }
      },
    }
  });

  grunt.registerTask('default', ['nggettext_compile', 'sass', 'concat']);
  grunt.registerTask('release', ['default', 'copy:release', 'uglify']);
  grunt.registerTask('translate', ['nggettext_extract']);
  grunt.registerTask('clean', ['exec:clean']);
};
