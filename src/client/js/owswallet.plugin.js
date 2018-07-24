'use strict';

/**
 * Setup the owswallet global and execute a controlled load sequence.
 *
 * Usage:
 *
 * owswallet.Plugin.start(function() {
 *   // Will execute when this plugin is loaded, or immediately if the plugin is already loaded.
 * });
 * 
 * owswallet.Plugin.ready(function() {
 *   // Will execute when this plugin is ready, or immediately if the plugin is ready.
 * });
 *
 * owswallet.Plugin.openForBusiness(pluginIds, function() {
 *   // Will execute when this plugin and all the specified pluginIds are ready, or immediately if all pluginIds are ready.
 *   // Param pluginIds accepts an array or string value.
 * });
 *
 * The following calls are equivalent.
 *
 *   owswallet.Plugin.ready(function(){});
 *   owswallet.Plugin.openForBusiness(null, function(){});
 *
 *
 * Platform identification.
 *
 * var isCordova = owswallet.Plugin.isCordova();
 * var isNodeWebkit = owswallet.Plugin.isNodeWebKit();
 * var isSafari = owswallet.Plugin.isSafari();
 *
 * var isMobile = owswallet.Plugin.isMobile();
 * var isAndroid = owswallet.Plugin.isAndroid();
 * var isIOS = owswallet.Plugin.isIOS();
 * var isIPhoneX = owswallet.Plugin.isIPhoneX();
 *
 * var userAgent = owswallet.Plugin.userAgent();
 */

var owswallet = {};

(function(window, document, owswallet) {

  var IOS = 'ios';
  var ANDROID = 'android';
  var NODEWEBKIT = 'nodewebkit';

  var platformName = null;
  var pluginKind;
  var session;

  var startCallback;
  var readyCallbacks = [];
  var openCallbacks = [];
  var eventCallbacks = [];
  var windowLoadListenderAttached;


  var self = owswallet.Plugin = {

    isLoaded: false,
    isReady: false,
    isOpen: {},

    start: function(cb) {
      if (self.isLoaded) {
        cb(pluginKind);
      } else {
        startCallback = cb;
      }
    },

    ready: function(cb) {
      if (self.isReady) {
        cb();
      } else {
        // The plugin isn't ready yet, add it to this array which will be called once the plugin is ready.
        readyCallbacks.push(cb);
      }
    },

    openForBusiness: function(pluginIds, cb) {
      // This function requires that this plugin is ready as well as the dependent 'pluginIds'.

      // Ensure array.
      if (!Array.isArray(pluginIds)) {
        pluginIds = [pluginIds];
      }

      // Calling openForBusiness(null, ...) is the same as calling ready(...)
      var skipOpenCheck = (pluginIds.length == 1 && pluginIds[0] == null);

      // Check if all required plugins are open.
      var allOpen = true;
      for (var p = 0; p < pluginIds.length; p++) {
        allOpen = allOpen && self.isOpen[pluginIds[p]];
      }

      if (self.isReady && (allOpen || skipOpenCheck)) {
        cb();
      } else {
        // Not all plugins are ready yet, save plugin's and callback to be called once all are ready.
        openCallbacks.push({
          pluginIds: pluginIds,
          callback: cb
        });
      }
    },

    setOpen: function(pluginId) {
      self.isOpen[pluginId] = true;

      if (self.isReady) {
        checkAndExecuteOpenCallbacks();
      }
    },

    onEvent: function(name, cb) {
      // Event callbacks are organized by event name. The call must specify an event name in order to receive an event, see notify(event).
      eventCallbacks[name] = eventCallbacks[name] || [];
      eventCallbacks[name].push({
        callback: cb
      });
    },

    notify: function(event) {
      if (!eventCallbacks[event.name]) {
        return;
      }

      for (var x = 0; x < eventCallbacks[event.name].length; x++) {
        // Fire off all the event callbacks.
        eventCallbacks[event.name][x].callback(event);
      }
    },

    platform: function() {
      return platformName;
    },

    setPlatform: function(p) {
      platform = p;

      if (p.isMobile.iOS) {
        platformName = IOS;

      } else if (p.isMobile.Android) {
        platformName = ANDROID;

      } else if (p.isNodeWebkit) {
        platformName = NODEWEBKIT;
      }
    },

    isIOS: function() {
      return platform.isMobile.iOS;
    },

    isAndroid: function() {
      return platform.isMobile.Android;
    },

    isCordova: function() {
      return platform.isCordova;
    },

    isNodeWebKit: function() {
      return platform.isNodeWebkit;
    },

    isSafari: function() {
      return platform.isSafari;
    },

    isMobile: function() {
      return platform.isMobile;
    },

    isIPhoneX: function() {
      return platform.isIPhoneX;
    },

    userAgent: function() {
      return platform.userAgent;
    },

    setSession: function(sessionObj) {
      session = sessionObj;
    },

    close: function(opts) {
      session.close(opts);
    },

    showSplash: function() {
      var splash = session.plugin.launch.splash;
      var splashElem = angular.element('<div id="applet-splash" class="applet-splash"></div>');
      splashElem.css({
        background: 'url(\'' + splash.image + '\')',
      });

      angular.element(document.getElementsByTagName('ion-nav-view')[0]).prepend(splashElem);

      if (splash.autoHide == true) {
        setTimeout(function() {
          self.hideSplash();
        }, splash.delay);
      }
    },

    hideSplash: function() {
      var splashElem = angular.element(document.getElementById('applet-splash'));
      splashElem.on('animationend', removeSplash);
      splashElem.addClass('animated fadeOut');

      function removeSplash() {
        splashElem.addClass('ng-hide');
        splashElem.removeClass('animated fadeOut');
        splashElem.off('animationend', removeSplash);
      };
    }

  };

  if (document.readyState === 'complete') {
    onWindowLoad();
  } else {
    windowLoadListenderAttached = true;
    window.addEventListener('load', onWindowLoad, false);
  }

  // Setup listeners to know when we're ready to go.
  function onWindowLoad() {
    self.isLoaded = true;

    onPluginStart();

    if (windowLoadListenderAttached) {
      window.removeEventListener('load', onWindowLoad, false);
    }
  };

  function onPluginStart() {
    // The plugin is loaded, init our own stuff then fire off our event.
    window.addEventListener('plugin.ready', onPluginReady, false);

    // Read meta tag for plugin kind.
    pluginKind = document.getElementsByName("ows-wallet-plugin-kind")[0].content;

    if (startCallback) {
      startCallback(pluginKind);      
    }
    startCallback = undefined;
  };

  function onPluginReady() {
    // The plugin is all set to go.
    self.isReady = true;

    for (var x = 0; x < readyCallbacks.length; x++) {
      // Fire off all the callbacks that were added before the plugin was ready.
      readyCallbacks[x]();
    }

    readyCallbacks = [];

    // If dependent plugins became ready before us then we need to check and execute open callbacks now that we are ready.
    checkAndExecuteOpenCallbacks();
  };

  function checkAndExecuteOpenCallbacks() {
    var indexes = [];
    for (var x = 0; x < openCallbacks.length; x++) {
      // Fire off all the callbacks that were added before the plugin was ready.
      if (openCallbacks[x]) {

        var allOpen = true;
        for (var p = 0; p < openCallbacks[x].pluginIds.length; p++) {
          allOpen = allOpen && self.isOpen[openCallbacks[x].pluginIds[p]];
        }

        if (allOpen) {
          openCallbacks[x].callback();
          indexes.push(x);
        }
      }
    }

    // Remove executed callbacks.
    for (var i = indexes.length -1; i >= 0; i--) {
       openCallbacks.splice(indexes[i], 1);
    }
  };

})(window, document, owswallet);
