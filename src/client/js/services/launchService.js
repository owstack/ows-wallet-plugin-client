'use strict';

angular.module('owsWalletPluginClient.services').service('launchService', function($rootScope, $injector, lodash, apiHelpers, $log, ApiMessage, ApiRouter, Session) {

  owswallet.Plugin.start(function() {

    // Setup based on the declared plugin kind.
    var pluginKind = document.getElementsByName("ows-wallet-plugin-kind")[0].content;
    var isApplet = (pluginKind == 'applet');
    var isServlet = (pluginKind == 'servlet');

    validateStartup();

    // Initialization depends on asynchronous messaging with the host app. The 'initialized' object is used to keep track of
    // all items to be initialized.  When all items become true (initialized) the we notify the host and then the local client that
    // we're ready.
    var initializers = {
      platformInfo: { fn: getPlatformInfo,     done: false },
      session:      { fn: Session.getInstance, done: false }
    };

    /**
     * Applet specific initialization
     */

    if (isApplet) {
      // Ionic platform defaults. Plugin may override in their own config block.
      var ionicConfig = $injector.get('$ionicConfig');
      ionicConfig.tabs.position('bottom');
      ionicConfig.navBar.alignTitle('center');
      ionicConfig.navBar.positionPrimaryButtons('left');
      ionicConfig.navBar.positionSecondaryButtons('right');
      ionicConfig.backButton.icon('icon ion-ios-arrow-left').text('');
      ionicConfig.backButton.previousTitleText(false);
      ionicConfig.scrolling.jsScrolling(false);
    }

    /**
     * Servlet specific initialization
     */

    if (isServlet) {

      // Nothing to do.

    }

    /**
     * Start the plugin and initialize ourself.
     */

    start().then(function() {
      Object.keys(initializers).forEach(function(i) {
        initializers[i].fn();
      })

    });

    function validateStartup(session) {
      // The build process should prevent this, but just in case.
      if (lodash.isEmpty(pluginKind) || !(isApplet || isServlet)) {
        throw new Error('PLUGIN NOT VALID - the pluginKind <meta> in index.html is missing or invalid');
      }

      if (session && pluginKind != session.plugin.header.kind) {
        throw new Error('PLUGIN NOT VALID - the pluginKind <meta> in index.html does not match the configuration in plugin.json');
      }
    };

    // Start communicating with the host app.
    function start() {
      var request = {
        method: 'POST',
        url: '/start',
        data: {
          sessionId: apiHelpers.sessionId()
        }
      }

      return new ApiMessage(request).send().then(function(response) {
        $log.info('START: ' + response.statusText + ' (' + response.statusCode + ')');

        if (response.data.isCordova) {
        	setupForCordova();
        }

        // Allow messages to be sent.
        ApiMessage.ready();

        return;

      }).catch(function(error) {
        $log.error('START ERROR: ' + JSON.stringify(error));

      });
    };

    function setupForCordova() {
      if (isApplet) {
        // Tells ionic that we are running in a Cordova container. Ionic doesn't add this class because we are not the root document.
        angular.element(document.querySelector('body')).addClass('platform-cordova');
        angular.element(document.querySelector('ion-nav-view')).css('width', window.innerWidth + 'px');
      }
    };

    function getPlatformInfo() {
      var request = {
        method: 'GET',
        url: '/info/platform',
        responseObj: {}
      }

      return new ApiMessage(request).send().then(function(response) {
        owswallet.Plugin.setPlatform(response);
        $rootScope.$emit('Local/Initialized', 'platformInfo');

      }).catch(function(error) {
        $log.error('getPlatform(): ' + JSON.stringify(error));
        
      });
    };

    $rootScope.$on('Local/Initialized', function(event, what) {
      initializers[what].state = true;

      $log.debug(what + ' initialized');

      // Check if all items are initialized.
      var done = true;
      lodash.forEach(Object.keys(initializers), function(i) {
        done = done && initializers[i].state;
      });

      if (done) {
        var session = Session.getInstance();

        // Set our client name.
        apiHelpers.clientName(session.plugin.header.name + '@' + session.plugin.header.version);

        // Will throw error if not valid.
        validateStartup(session);

        // 
        ApiRouter.applyRoutes(session);

        // Tell the host app that we're ready.
        var request = {
          method: 'POST',
          url: '/ready',
          data: {
            sessionId: session.id
          }
        }

        return new ApiMessage(request).send().then(function(response) {
          // We're ready to run!
          var event = new Event('plugin.ready');
          window.dispatchEvent(event);

          $log.info(session.plugin.header.name + '@' + session.plugin.header.version + ' ' + session.plugin.header.kind + ' is ready!');

        }).catch(function(error) {
          $log.error('READY ERROR: (unexpected status) ' + JSON.stringify(error));

        });
      }
    });

    // The client may updated its host app routes at any time.  When routes are changed this handler updates the host app.
    $rootScope.$on('Local/RoutesChanged', function(event, routes, target) {
      var request = {
        method: 'POST',
        url: '/session/' + Session.getInstance().id + '/routes',
        data: {
          routes: routes,
          target: target
        }
      };

      return new ApiMessage(request).send().then(function(response) {
      }).catch(function(error) {
        $log.error('ROUTES ERROR: ' + JSON.stringify(error));
      });
    });

  });

});
