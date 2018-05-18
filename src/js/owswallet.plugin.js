'use strict';

/**
 * Setup the owswallet global and execute a controlled load sequence.
 *
 * Usage:
 *
 * owswallet.Plugin.start(function() {
 *   // Will execute when plugin is loaded, or immediately if the plugin is already loaded.
 * });
 * 
 * owswallet.Plugin.ready(function() {
 *   // Will execute when plugin is ready, or immediately if the plugin is already ready.
 * });
 *
 * owswallet.Plugin.openForBusiness(pluginId, function() {
 *   // Will execute when the specified pluginId is ready, or immediately if the plugin is already ready.
 * });
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
  var startCallback;
  var readyCallbacks = [];
  var openCallbacks = [];
  var windowLoadListenderAttached;

  var self = owswallet.Plugin = {

    isLoaded: false,
    isReady: false,
    isOpen: {},

    start: function(cb) {
      if (self.isLoaded) {
        cb();
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

    openForBusiness: function(pluginId, cb) {
      if (self.isReady && self.isOpen[pluginId]) {
        cb();
      } else {
        // The plugin isn't ready yet, add it to this array which will be called once the plugin is ready.
        openCallbacks.push({
          pluginId: pluginId,
          callback: cb
        });
      }
    },

    setOpen: function(pluginId) {
      isOpen[pluginId] = true;

      var indexes = [];
      for (var x = 0; x < openCallbacks.length; x++) {
        // Fire off all the callbacks that were added before the plugin was ready.
        if (openCallback[x] && openCallbacks[x].pluginId == pluginId) {
          openCallbacks[x].callback();
        }
        run.push(x);
      }

      // Remove executed callbacks.
      for (var i = indexes.length -1; i >= 0; i--) {
         openCallbacks.splice(indexes[i], 1);
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
      return self.platform.isMobile.iOS;
    },

    isAndroid: function() {
      return self.platform.isMobile.Android;
    },

    isCordova: function() {
      return self.platform.isCordova;
    },

    isNodeWebKit: function() {
      return self.platform.isNodeWebkit;
    },

    isSafari: function() {
      return self.platform.isSafari;
    },

    isMobile: function() {
      return self.platform.isMobile;
    },

    isIPhoneX: function() {
      return self.platform.isIPhoneX;
    },

    userAgent: function() {
      return self.platform.userAgent;
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

    if (startCallback) {
      startCallback();      
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
  };

})(window, document, owswallet);
