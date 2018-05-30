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
      main: {
        files: [
          'src/js/api/**/*.js',
          'src/js/impl/**/*.js'
        ],
        tasks: ['concat:js']
      }
    },
    clean: {
      release: ['release/']
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
          src: ['src/applet/sass/main.scss'],
          dest: 'build/applet/css/',
          ext: '.css'
        }]
      }
    },
    concat: {
      options: {
        sourceMap: false,
        sourceMapStyle: 'link' // embed, link, inline
      },
      js_client: {
        src: [
          'angular-path-to-regexp/angular-path-to-regexp.js',
          'bower_components/angular-gettext/dist/angular-gettext.js',
          'bower_components/ng-lodash/build/ng-lodash.js',
          'src/client/js/owswallet.plugin.js',
          'src/client/js/pluginClient.js',
          'src/client/js/pluginClient.config.js',
          'src/client/js/pluginClient.init.js',
          'src/client/js/translations.js',
          'src/client/js/api/**/*.js',
          'src/client/js/impl/**/*.js',
          'src/client/js/services/**/*.js'
        ],
        dest: 'release/ows-wallet-client.js'
      },
      js_applet: {
        src: [
          'src/applet/js/translations.js',
          'src/applet/js/**/*.js'
        ],
        dest: 'release/ows-wallet-applet.js'
      },
      css_applet: {
        src: [
          'build/applet/css/**/*.css'
        ],
        dest: 'release/ows-wallet-applet.css'
      },
      js_pre_servlet: {
        src: [
          'src/servlet/js/translations.js',
          'src/servlet/js/**/*.js'
        ],
        dest: 'release/ows-wallet-servlet.js'
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      prod: {
        files: {
          'release/ows-wallet-client.min.js': ['release/ows-wallet-client.js'],
          'release/ows-wallet-applet.min.js': ['release/ows-wallet-applet.js'],
          'release/ows-wallet-servlet.min.js': ['release/ows-wallet-servlet.js']
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
      }
    },
    browserify: {
      dist: {
        files: {
          'angular-path-to-regexp/angular-path-to-regexp.js': ['angular-path-to-regexp/index.js']
        },
        options: {
          exclude: ['www/index.html']
        }
      }
    }
  });

  grunt.registerTask('default', [
    'clean:release',
    'nggettext_compile',
    'sass',
    'browserify',
    'concat',
    'uglify'
  ]);

  grunt.registerTask('translate', ['nggettext_extract']);
  grunt.registerTask('trash', ['exec:clean']);
};
