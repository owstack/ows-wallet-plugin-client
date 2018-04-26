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
      js_client: {
        src: [
          'src/js/app.js',
          'src/js/translations.js',
          'src/js/impl/**/*.js',
          'src/js/api/*.js'
        ],
        dest: 'build/ows-wallet-plugin-client.js'
      },
      js_pre: {
        src: [
          // String translation/localization
          'bower_components/angular-gettext/dist/angular-gettext.js',
          // Javascript utilities
          'bower_components/ng-lodash/build/ng-lodash.js',
          // Create QR codes
          'bower_components/qrcode-generator/js/qrcode.js',
          'bower_components/qrcode-generator/js/qrcode_UTF8.js',
          'bower_components/angular-qrcode/angular-qrcode.js',
          // Time-ago utilities
          'bower_components/moment/min/moment-with-locales.js',
          'bower_components/angular-moment/angular-moment.js',
          // CSV exporting
          'bower_components/ng-csv/build/ng-csv.js', 
          // MD5 checksum; supports Gravatar
          'bower_components/angular-md5/angular-md5.js',
          // Touch device directives
          'bower_components/ngtouch/src/ngTouch.js',
          // Copy to OS clipboard
          'bower_components/angular-clipboard/angular-clipboard.js',
          // UI notification overlays
          'bower_components/ionic-toast/dist/ionic-toast.bundle.min.js',
          // Drag-and-drop multi-column grid
          'bower_components/angular-gridster/dist/angular-gridster.min.js',
          // An Android style pattern lock interface
          'bower_components/pattern-lock/angular-pattern-lock.min.js',
          // Passwordless authentication using Bitcoin cryptography
          'angular-bitauth/angular-bitauth.js',
          // Dynamic JSON validator
          'angular-djv/angular-djv.js',
          // OWS Wallet plugin API client
          'build/ows-wallet-plugin-client.js'
        ],
        dest: 'build/ows-wallet-pre.js'
      },
      css_client: {
        src: [
          'build/css/*.css'
        ],
        dest: 'build/ows-wallet-plugin-client.css'
      },
      css_pre: {
        src: [
          'build/css/*.css'
        ],
        dest: 'build/ows-wallet-pre.css'
      }
    },
    copy: {
      release: {
        expand: true,
        flatten: false,
        cwd: 'build/',
        src: [
          'ows-wallet-plugin-client.css',
          'ows-wallet-plugin-client.js',
          'ows-wallet-pre.css',
          'ows-wallet-pre.js'
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
          'release/ows-wallet-pre.min.js': ['release/ows-wallet-pre.js']
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

  grunt.registerTask('default', ['nggettext_compile', 'sass', 'concat', 'copy:release', 'uglify']);
  grunt.registerTask('translate', ['nggettext_extract']);
  grunt.registerTask('clean', ['exec:clean']);
};
