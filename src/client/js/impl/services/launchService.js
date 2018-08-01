'use strict';

angular.module('owsWalletPluginClient.impl.services').service('launchService', function($rootScope, $injector, $log, $window, historicLogService, lodash, apiHelpers, ApiMessage, ApiRouter,
  /* @namespace owsWalletPluginClient.api */ Session,
  /* @namespace owsWalletPluginClient.api */ Settings,
  /* @namespace owsWalletPluginClient.api */ Host) {

  owswallet.Plugin.start(function(pluginKind) {

    var session;
    var isApplet = (pluginKind == 'applet');
    var isServlet = (pluginKind == 'servlet');

    validateStartup();

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

      // Nothing to do

    }

    /**
     * Start up sequence
     */

    start().then(function() {
      return Session.getInstance();

    }).then(function(mySession) {
      session = mySession;

      // Set our client name and plugin ID.
      apiHelpers.clientName(session.plugin.header.name + '@' + session.plugin.header.version);
      apiHelpers.pluginId(session.plugin.header.id);

      initLog();
      owswallet.Plugin.setSession(session);

      // Will throw error if not valid.
      return validateStartup();

    }).then(function() {
      if (isApplet) {
        return presentUI();
      }
      return;

    }).then(function() {
      return getPlatformInfo();

    }).then(function() {
      return Host.get();

    }).then(function() {
      return Settings.get();

    }).then(function() {
      // Add client configured routes to our routing map.
      return ApiRouter.applyRoutes(session);

    }).then(function() {
      return ready();

    }).catch(function(error) {
      throw new Error('PLUGIN START ERROR: ' + error.message);

    });

    /*
     * Private functions
     */

    function validateStartup() {
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
        method: 'PUT',
        url: '/start',
        data: {}
      };

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
        angular.element(document.querySelector('ion-nav-view')).css('width', $window.top.innerWidth + 'px');
      }
    };

    // Start user interface presentation.
    function presentUI() {
      var request = {
        method: 'PUT',
        url: '/presentUI',
        data: {
          sessionId: session.id
        }
      };

      return new ApiMessage(request).send().then(function() {
        return;

      }).catch(function(error) {
        $log.error('PRESENT UI ERROR: ' + JSON.stringify(error));
      });
    };

    function getPlatformInfo() {
      var request = {
        method: 'GET',
        url: '/info/platform'
      };

      return new ApiMessage(request).send().then(function(response) {
        return owswallet.Plugin.setPlatform(response.data);
        
      }).catch(function(error) {
        $log.error('getPlatform(): ' + JSON.stringify(error));
        
      });
    };

    function initLog() {
      // Add a prefix to identify our log entries.
      historicLogService.prefix(apiHelpers.clientName() + '/' + pluginKind + ' ');
    };

    function ready() {
      // Tell the host app that we're ready.
      var request = {
        method: 'PUT',
        url: '/ready',
        data: {
          sessionId: session.id
        }
      };

      return new ApiMessage(request).send().then(function(response) {
        // We're ready to run!
        var event = new Event('plugin.ready');
        $window.dispatchEvent(event);

        $log.info(session.plugin.header.name + '@' + session.plugin.header.version + ' ' + session.plugin.header.kind + ' is ready!');

      }).catch(function(error) {
        $log.error('READY ERROR: (unexpected status) ' + JSON.stringify(error));

      });
    };

    // The client may update its host app routes at any time.  When routes are changed this handler updates the host app.
    $rootScope.$on('Local/RoutesChanged', function(event, routes) {
      var request = {
        method: 'POST',
        url: '/session/' + session.id + '/routes',
        data: {
          routes: routes
        }
      };

      return new ApiMessage(request).send().then(function(response) {
      }).catch(function(error) {
        $log.error('ROUTES ERROR: ' + JSON.stringify(error));
      });
    });

  });

});
