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

'use strict';

var modules = [
  'gettext',
	'ngLodash',
  'pathToRegexpModule',
	'owsWalletPluginClient.api',
	'owsWalletPluginClient.impl',
	'owsWalletPluginClient.services'
];

var owsWalletPluginClient = angular.module('owsWalletPluginClient', modules);

angular.module('owsWalletPluginClient.api', []);
angular.module('owsWalletPluginClient.impl', []);
angular.module('owsWalletPluginClient.services', []);

'use strict';

angular.module('owsWalletPluginClient').provider('$pluginConfig', function(lodash) {

  var provider = this;
  provider.platform = {};
  var PLATFORM = 'platform';

  var configProperties = {
    router: {
      routes: PLATFORM
    },
    platform: {}
  };

  createConfig(configProperties, provider, '');

  // Default configuration
  setPlatformConfig('default', {
    router: {
      routes: []
    }
  });

  // iOS (it is the default already)
  setPlatformConfig('ios', {
    router: {
      routes: []
    }
  });

  // Android
  setPlatformConfig('android', {
    router: {
      routes: []
    }
  });

  // NodeWebKit
  setPlatformConfig('nodewebkit', {
    router: {
      routes: []
    }
  });

  // Create methods for each config to get/set
  function createConfig(configObj, providerObj) {
    lodash.forEach(configObj, function(value) {
      // Create a method for the provider/config methods that will be exposed
      providerObj = function(newValue) {
        if (arguments.length) {
          configObj = newValue;
          return providerObj;
        }
        return configObj;
      };
    });
  }

  // Used to set configs
  function setConfig(configs) {
    configProperties = platformConfigs;
    provider.platform[platformName] = {};

    addConfig(configProperties, configProperties.platform[platformName]);

    createConfig(configProperties.platform[platformName], provider.platform[platformName], '');
  }

  // Used to set platform configuration.
  function setPlatformConfig(platformName, platformConfigs) {
    configProperties.platform[platformName] = platformConfigs;
    provider.platform[platformName] = {};

    addConfig(configProperties, configProperties.platform[platformName]);

    createConfig(configProperties.platform[platformName], provider.platform[platformName], '');
  }

  // Used to recursively add new platform configuration.
  function addConfig(configObj, platformObj) {
    for (var n in configObj) {
      if (n != PLATFORM && configObj.hasOwnProperty(n)) {
        if (angular.isObject(configObj[n])) {
          if (lodash.isUndefined(platformObj[n])) {
            platformObj[n] = {};
          }
          addConfig(configObj[n], platformObj[n]);

        } else if (lodash.isUndefined(platformObj[n])) {
          platformObj[n] = null;
        }
      }
    }
  }

  // Create methods for each configuration to get/set.
  function createConfig(configObj, providerObj, platformPath) {
    lodash.forEach(configObj, function(value, namespace) {

      if (angular.isObject(configObj[namespace])) {
        // Recursively drill down the config object so we can create a method for each one.
        providerObj[namespace] = {};
        createConfig(configObj[namespace], providerObj[namespace], platformPath + '.' + namespace);

      } else {
        // Create a method for the provider/config methods that will be exposed.
        providerObj[namespace] = function(newValue) {
          if (arguments.length) {
            configObj[namespace] = newValue;
            return providerObj;
          }
          if (configObj[namespace] == PLATFORM) {
            // If the config is set to 'platform', then get this config's platform value.
            var platformConfig = stringObj(configProperties.platform, owswallet.Plugin.platform() + platformPath + '.' + namespace);
            if (platformConfig || platformConfig === false) {
              return platformConfig;
            }
            // Didn't find a specific platform config, now try the default.
            return stringObj(configProperties.platform, 'default' + platformPath + '.' + namespace);
          }
          return configObj[namespace];
        };
      }

    });
  }

  function stringObj(obj, str) {
    str = str.split(".");
    for (var i = 0; i < str.length; i++) {
      if (obj && !lodash.isUndefined(obj[str[i]])) {
        obj = obj[str[i]];
      } else {
        return null;
      }
    }
    return obj;
  }

  provider.setPlatformConfig = setPlatformConfig;

  // Service definition for internal use
  provider.$get = function() {
    return provider;
  };

});

'use strict';

angular.module('owsWalletPluginClient').config(function() {

  // Nothing to do.

}).run(function(launchService) {

  // Just bump the launchService.

});

angular.module('owsWalletPluginClient').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
/* jshint +W100 */
}]);
'use strict';

angular.module('owsWalletPluginClient.api').factory('ApiError', function (lodash) {

  /**
   * ApiError
   *
   * Provides a wrapper for messages coming from the host app.
   */

  /**
   * Constructor.
   * @return {ApiError} An instance of ApiError.
   * @constructor
   *
   * errorObj: {
   *   code: <number>
   *   source: <string>
   *   message: <string>
   *   detail: <string>
   * }
   */
  function ApiError(errorObj) {
    lodash.assign(this, errorObj);
    return this;
  };

  return ApiError;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('Applet', function (lodash) {

  /**
   * Applet
   *
   * Provides access to applet behavior. An instance of this class should be obtained from the
   * Session instance.
   */

   /**
   * Applet Events
   * -------------
   * 
   * Each of the following events provide the following arguments to the subscriber:
   *   appletObj - the subject Applet object
   *   walletId - the wallet identifier on which the applet is presented
   * 
   * '$pre.beforeEnter' - broadcast when opening an applet, before the applet is shown
   * '$pre.afterEnter' - broadcast when opening an applet, after the applet is shown
   * '$pre.beforeLeave' - broadcast when closing an applet, before before the applet is hidden
   * '$pre.afterLeave' - broadcast when closing an applet, after the applet is hidden
   */

  /**
   * Constructor.  An instance of this class must be obtained from Session.
   * @param {Object} plugin - An internal Plugin object.
   * @return {Object} An instance of Applet.
   * @constructor
   */
  function Applet(appletObj) {
    lodash.assign(this, appletObj);
    return this;
  };

  /**
   * Hides the splash image after starting.
   * @return {Promise} A promise at completion.
   */
  Applet.prototype.hideSplash = function() {
    var request = {
      method: 'POST',
      url: '/applet/' + this.header.id + '/config',
      data: {
        showSplash: false
      }
    }

    return new ApiMessage(request).send();
  };

  return Applet;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('Contants', function () {

  /**
   * Contantsants
   *
   * Provides commonly used constant values.
   */

  /**
   * Constructor.
   * @constructor
   */
  function Contants() {
    throw new Error('Contants is a static class');
  };

  Contants.BITS_PER_BTC = 1e6;
  Contants.SATOSHI_PER_BTC = 1e8;

  return Contants;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('Http', function (pLog, lodash, $http, System) {

  /**
   * Http
   *
   * Provides a wrapper for $http.
   */

  /**
   * Constructor.
   * @return {Http} An instance of Http.
   * @constructor
   */
  function Http(url, config) {
    var self = this;
    this.url = url.toLowerCase();
    this.config = config;

    validate();

    // Private functions
    //
    function validate() {
    	// Check format for url.
      // Matches http(s)://<domain>.<tld>:<port>
      //
      // where,
      //   domain - 2+ character string up to last '.', can include '-'
      //   tld - matches 2-63 character string after last '.'
      //   port - matches 1-5 numerals
      //   Does not match query params
	    if (!self.url.match(/(http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,63}(:[0-9]{1,5})?(\/[a-z0-9\/]*)?/g)) {
	    	throw new Error('Invalid URL for Http() \'' + self.url + '\'');
	    }

	    // Append a '/' is not present.
	    if (self.url.slice(-1) != '/') {
	    	self.url += '/';
	    }
    };

    return this;
  };

  /**
   * Create a GUID.
   * @return {String} A GUID string value.
   */
  Http.guid = function() {
    return Date.now().toString();
  };

  /**
   * Make an HTTP GET request.
   * @param {String} endpoint - The URI to the resource.
   * @return {Promise<Object>} A promise for the response.
   */
  Http.prototype.get = function(endpoint) {
    var self = this;
  	return new Promise(function(resolve, reject) {
      var url = encodeURI(self.url + endpoint);

	    plog.debug('GET ' + url);

	    $http.get(data, self.config).then(function(response) {
	      pLog.debug('GET SUCCESS: ' + JSON.stringify(response));
	      resolve(response);

	    }).catch(function(error) {
	      pLog.error('GET ERROR: ' + url + ', ' + error.statusText);
	      reject(error.statusText);

	    });
	  });
  };

  /**
   * Make an HTTP POST.
   * @param {String} endpoint - The URI to the resource.
   * @param {Object} data - The data object to post.
   * @return {Promise<Object>} A promise for the response.
   */
  Http.prototype.post = function(endpoint, data) {
    var self = this;
  	return new Promise(function(resolve, reject) {
      var url = encodeURI(self.url + endpoint);

	    pLog.debug('POST ' + url + ' data = ' + JSON.stringify(data));

	    $http.post(url, data, self.config).then(function(response) {
	      pLog.debug('POST SUCCESS: ' + url + ' '+ JSON.stringify(response));
	      resolve(response);

	    }).catch(function(error) {
	      pLog.error('POST ERROR: ' + url + ', ' + error.statusText);
	      reject(error.statusText);

	    });
    });
  };

  return Http;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('Servlet', function (lodash) {

  /**
   * Servlet
   *
   * Provides access to servlet behavior. An instance of this class should be obtained from the
   * Session instance.
   */

  /**
   * Constructor.  An instance of this class must be obtained from Session.
   * @param {Object} plugin - An internal plugin object.
   * @return {Object} An instance of Servlet.
   * @constructor
   */
  function Servlet(servletObj) {
    lodash.assign(this, servletObj);
    return this;
  };

  return Servlet;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('Session', function ($rootScope, lodash, apiHelpers, pLog, ApiMessage, Applet, Servlet, Wallet) {

  /**
   * Session
   *
   * This class provides session functionality including reading and writing persistent data. An instance of
   * this class should be obtained by calling Session.getInstance().
   */

   var instance;

  /**
   * Constructor.
   * @return {Object} The single instance of Session.
   * @constructor
   */
  function Session() {
    var self = this;

    if (instance) {
      return instance;
    }
    instance = this;

    getSession().then(function(sessionObj) {
      // Assign the session data to ourself.
      lodash.assign(self, sessionObj);

      switch (self.plugin.header.kind) {
        case 'applet': self.plugin = new Applet(self.plugin); break;
        case 'servlet': self.plugin = new Servlet(self.plugin); break;
      };

      $rootScope.$emit('Local/Initialized', 'session');
    
    }).catch(function(error) {
      pLog.error('Session(): ' + JSON.stringify(error));

    });

    // Get our session data.
    function getSession() {
      var request = {
       method: 'GET',
       url: '/session/' + apiHelpers.sessionId(),
       responseObj: {}
      }

      return new ApiMessage(request).send();
    };

    return this;
  };

  /**
   * Get the single session object or create the session.
   * @return {Object} The single session object.
   */
  Session.getInstance = function() {
    return instance || new Session();
  };

  /**
   * Write all session data to persistent storage.
   * @return {Promise} A promise at completion.
   */
  Session.prototype.flush = function() {
    var request = {
      method: 'POST',
      url: '/session/flush',
      data: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      return repsonse;

    }).catch(function(error) {
      pLog.error('Session.flush():' + JSON.stringify(error));
      
    });
  };

  /**
   * Retrieve session data by name.
   * @param {String} name - User specified data name defined using set(name, value).
   * @return {Promise<Object>} A promise for stored value.
   */
  Session.prototype.get = function(name) {
    var self = this;
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/var/' + name,
      responseObj: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      self[name] = {};
      lodash.assign(self[name], response);
      return repsonse;

    }).catch(function(error) {
      pLog.error('Session.get(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Restore all session data from persistent storage. A 'data' property is created on the session.
   * @return {Promise} A promise at completion with param 'data' or an error.
   */
  Session.prototype.restore = function() {
    var self = this;
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/restore',
      data: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      self.data = {};
      lodash.assign(self.data, response);
      return response;

    }).catch(function(error) {
      pLog.error('Session.restore(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Set session data by name. A 'data' property is created on the session.
   * @param {String} name - Location to store the specified value.
   * @param {Object} value - The data value to store.
   * @return {Promise} A promise at completion with param 'value' or an error.
   */
  Session.prototype.set = function(name, value) {
    var self = this;
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/var/' + name,
      data: value
    }

    return new ApiMessage(request).send().then(function(response) {
      self.data = self.data || {};
      lodash.merge(self.data, response);
      return response;

    }).catch(function(error) {
      pLog.error('Session.set(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Prompts the user to choose a wallet from a wallet chooser UI. The selected wallet is returned as a new Wallet instance.
   * @return {Wallet} An instance of the chosen Wallet.
   * @static
   */
  Session.prototype.chooseWallet = function() {
    var self = this;
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/choosewallet',
      responseObj: 'Wallet',
      opts: {
        timeout: -1
      }
    }

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      pLog.error('Session.chooseWallet(): ' + JSON.stringify(error));
      
    });
  };

  return Session;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('System', function (lodash) {

  /**
   * System
   *
   * Provides general purpose system utilities.
   */

  /**
   * Constructor.
   * @constructor
   */
  function System() {
    throw new Error('System is a static class');
  };

  /**
   * Return whether or not the specified object has all required properties.
   * @return {Object} An array of missing properties.
   * @static
   */
  System.checkRequired = function(required, obj) {
    var missing = [];
    lodash.forEach(required, function(param) {
      if (lodash.get(obj, param, undefined) == undefined) {
        missing.push(param);
      }
    });
    return missing;
  };

  return System;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('Utils', function (rateService) {

  /**
   * Utils
   *
   * Provides domain utilities.
   */

  /**
   * Constructor.
   * @constructor
   */
  function Utils() {
    throw new Error('Utils is a static class');
  };

  /**
   * Retrieve a currency exchange rate (vs. bitcoin price).
   * @param {String} code - The ISO currency code for exchange.
   * @return {Object} An instance of a service object.
   * @static
   */
  Utils.getRate = function(isoCode) {
    return rateService.getRate(isoCode);
  };

  return Utils;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('Wallet', function (lodash) {

  /**
   * Wallet
   *
   * Provides access to a wallet. An instance of this class should be obtained from the Session instance.
   */

  /**
   * Constructor.  An instance of this class must be obtained from Session.
   * @param {Object} wallet - An internal Wallet object.
   * @return {Object} An instance of Wallet.
   * @constructor
   */
  function Wallet(walletObj) {
    lodash.assign(this, walletObj);
  };

  return Wallet;
});

'use strict';

angular.module('owsWalletPluginClient.impl').service('apiHelpers', function() {

	var root = {};

  var clientName;

  // Get the sessionId from the URL.
  root.sessionId = function() {
    var sessionId = window.location.search.substring(window.location.search.indexOf('sessionId=') + 10);
    if (sessionId.indexOf('&') >= 0) {
      sessionId = sessionId.substring(0, sessionId.indexOf('&'));
    }
    return sessionId;
  };

  root.clientName = function(name) {
    clientName = name || clientName || root.sessionId();
    return clientName;
  };

  return root;
});

'use strict';

angular.module('owsWalletPluginClient.impl').factory('ApiMessage', function ($rootScope, lodash,  $injector, $timeout, apiHelpers, pLog, ApiRouter, ApiError) {

  var host = window.parent;

  var REQUEST_TIMEOUT = 3000; // milliseconds

  var ready = false;
  var sequence = 0;
  var promises = [];

  /**
   * Events
   */

  // When a message is received this listener routes the payload to process the message.
  window.addEventListener('message', receiveMessage.bind(this));

  /**
   * Constructor
   */

  function ApiMessage(eventOrRequest) {
    var self = this;
    this.event = {};

    if (eventOrRequest instanceof MessageEvent) {

      // Construct a message from the event data.
      this.event = event;

      // Check the itegrity of the message event.
      validateEvent();

      // Assign the event message data to this message object.
      var data = JSON.parse(this.event.data);
      lodash.assign(this, data);

      if (isRequest(this)) {
        // Check the structure of the request.
        validateRequest();

        // Get and check our routing.
        this.route = ApiRouter.routeRequest(this.request);
        validateRoute();
      }

    } else {
      var request = eventOrRequest;

      // Set request options per caller or use defaults.
      request.opts = request.opts || {};
      request.opts.timeout = request.opts.timeout || REQUEST_TIMEOUT;

      // Construct a new message from the data and make assignments.
      // 
      // About session information:
      //
      // The header of every message includes the session id and client name of the plugin that sources the message.
      // The session id is also on the iframe src URL.
      // Given the session id from a message header, the source iframe window can be located for postMessage().
      //
      // Note: During startup and until the client is ready this class does not have the session object.
      var now = new Date();
      this.header = {
        sequence: sequence++,
        id: '' + now.getTime(),
        timestamp: now,
        sessionId: apiHelpers.sessionId(),
        clientName:  apiHelpers.clientName()
      };
      this.request = request || {};
      this.response = {};
    }

    /**
     * Private methods
     */

    function validateEvent() {
      if(lodash.isUndefined(self.event.data)) {

        // Invalid event.
        self.response = {
          statusCode: 500,
          statusText: 'Invalid message event, no \'data\' found.',
          data: {}
        };

      } else if (!lodash.isString(self.event.data)) {

        // Event data not a string.
        self.response = {
          statusCode: 500,
          statusText: 'Invalid message event data, expected string argument but received object.',
          data: {}
        };
      }
    };

    function validateRequest() {
      if (lodash.isUndefined(self.request)) {

        // No request.
        self.response  = {
          statusCode: 400,
          statusText: 'No request provided.',
          data: {}
        };
        
      } else if (lodash.isUndefined(self.request.method)) {

        // No request method.
        self.response  = {
          statusCode: 400,
          statusText: 'No request method specified.',
          data: {}
        };
      }

      // Ensure that the specific request method is formed properly.
      switch (self.request.method) {
        case 'GET':
          break;
        case 'POST': validatePOST();
          break;
      }
    };

    function validatePOST() {
      // Check for required POST data.
      if (lodash.isUndefined(self.request.data)) {
        // Invalid request; does not match specification.
        self.response  = {
          statusCode: 400,
          statusText: 'Invalid request, POST data not present in request.',
          data: {}
        };
      }
    };

    function validateRoute() {
      if (lodash.isUndefined(self.route)) {

        // No route.
        self.response  = {
          statusCode: 404,
          statusText: 'Route not found.',
          data: {}
        };
      }
    };

    return this;
  };

  /**
   * Static functions
   */

  ApiMessage.ready = function() {
    ready = true;
  };

  /**
   * Public functions
   */

  ApiMessage.prototype.send = function() {
    var self = this;
    return new Promise(function(resolve, reject) {

      var onComplete = function(message) {
        var responseObj;

        if (message.response.statusCode < 200 || message.response.statusCode > 299) {
          // Fail
          reject(new ApiError({
            code: message.response.statusCode,
            source: message.request.url,
            message: message.response.statusText,
            detail: ''
          }));

        } else {

          // Success
          switch (message.response.statusCode) {
            case 204: // No content
              responseObj = undefined;
              break;

            default:
              if (!lodash.isUndefined(message.request.responseObj)) {

                if (lodash.isEmpty(message.request.responseObj)) {
                  // An empty response object informs that we should pass back the raw response data without status.
                  responseObj = message.response.data || {};
                } else {
                  // Create an instance of the promised responseObj with the message data.
                  responseObj = $injector.get(message.request.responseObj);
                  responseObj = eval(new responseObj(message.response.data));              
                }

              } else {
                // Send the plain response object data if no responseObj set.
                // The receiver will have to know how to interpret the object.
                responseObj = message.response;
              }
              break;
          }

          resolve(responseObj);
        }
      };

      // Send the message only if the client is ready or if the purpose of the message is to
      // start the client.
      if (ready || isStartMessage(self)) {

        if (isRequest(self)) {
          // Set a communication timeout timer unless the caller overrides.
          var timeoutTimer = {};
          if (self.request.opts.timeout > 0) {
            timeoutTimer = $timeout(function() {
              timeout(self);
            }, REQUEST_TIMEOUT);
          }

          // Store the promise callback for execution when a response is received.
          promises.push({
            id: self.header.id,
            onComplete: onComplete,
            timer: timeoutTimer
          });

          pLog.info('REQUEST  ' + self.header.sequence + ': ' + angular.toJson(transport(self)));
        } else {
          pLog.info('RESPONSE  ' + self.header.sequence + ': ' + angular.toJson(transport(self)));
        }

        // Post the message to the host.
        host.postMessage(angular.toJson(transport(self)), '*');

      } else {

        // The client service is not ready. Short circuit the communication and immediatley respond.
        self.response = {
          statusCode: 503,
          statusText: 'Client service not ready.',
          data: {}
        };
        onComplete(self);

      }
    });
  };

  /**
   * Private static methods
   */

  function isRequest(message) {
    return lodash.isEmpty(message.response);
  };

  function receiveMessage(event) {
    var message;

    try {
      message = new ApiMessage(event);

      if (isRequest(message)) {
        processRequestMessage(message);

      } else {
        processResponseMessage(message);
      }

    } catch (ex) {

      // Not possible to notify client since the message is invalid.
      // The client will timeout if a valid response is not received.
      pLog.error('Could not process message, ' + ex.message + ' - '+ angular.toJson(event));
    }
  };

  function processResponseMessage(message) {
    var promiseIndex = lodash.findIndex(promises, function(promise) {
      return promise.id == message.header.id;
    });

    if (promiseIndex >= 0) {
      // Remove the promise from the list.
      // Cancel the timeout timer.
      // Deliver the response to the client.
      var promise = lodash.pullAt(promises, promiseIndex);
      $timeout.cancel(promise[0].timer);
      promise[0].onComplete(message);

    } else {
      // No promise callback, send the message normally.
      // Happens when message construction results in an immediate response.
      message.send();
    }
  };

  function processRequestMessage(message) {
    // Get the message handler and respond to the client.
    var handler = $injector.get(message.route.handler);
    handler.respond(message, function(message) {
      message.send();
    });
  };

  // Timeout a message waiting for a response. Enables the client app to process a message delivery failure.
  function timeout(message) {
    pLog.debug('Plugin client request timeout: ' + serialize(message));

    var promiseIndex = lodash.findIndex(promises, function(promise) {
      return promise.id == message.header.id;
    });

    if (promiseIndex >= 0) {
      var promise = lodash.pullAt(promises, promiseIndex);

      message.response = {
        statusCode: 408,
        statusText: 'Request timed out.',
        data: {}
      }
      promise[0].onComplete(message);
    } else {
      pLog.warn('Message request timed out but there is no promise to fulfill: ' + serialize(message));
    }
  };

  function isStartMessage(message) {
    return message.request.url == '/start';
  };

  function serialize(message) {
    return angular.toJson(transport(message));
  };

  // Only these properties of a message are sent and received.
  function transport(message) {
    return {
      header: message.header,
      request: message.request,
      response: message.response
    }
  };

  return ApiMessage;
});

'use strict';

angular.module('owsWalletPluginClient.impl').factory('ApiRouter', function ($rootScope, $pluginConfig, pLog, lodash, pathToRegexpService) {

  /**
   * API routes.
   *
   * API providers must add their routes to the host using addRoutes().
   * A match is made by searching routes in order, the first match returns the route.
   *
   * The local routes here direct incoming messages for this plugin to handle.
   */

  var routeMap = [
    { path: '/ready', method: 'POST', handler: 'ready' } // Handle 'ready' messages from other plugins.
  ];

  /**
   * Constructor
   */

  function ApiRouter() {
    throw new Error('ApiRouter is a static class');
  };

  /**
   * Public methods
   */

  /** 
   * Add one or more routes on which to recieve messages.
   *
   * Example:
   * 
   * ApiRouter.addRoutes(session,
   *   [
   *     { path: '/my/get/route', method: 'GET', handler: 'myGetHandler' },
   *     { path: '/my/post/route', method: 'POST', handler: 'myPostHandler' }
   *   ]
   * );
   *
   * path - the url path to which a client sends their request; accepts express-style route strings
   * method - one of GET, POST
   * handler - the function to be called when a message arrives on the route; fn(message, callback)
   * 
   * where fn(message, callback),
   *
   *   message: {
   *     statusCode: <number>
   *     statusText: <string>
   *     request: <Object>
   *     response: {}
   *   }
   *   
   *   statusCode - the HTTP status code
   *   statusText - a text description for the status
   *   request - the senders request
   *   response - undefined when a message arrives, the handler should provide a 'response' object
   *   
   *   callback - a function to be called when the handler wants to sent the message; fn(message)
   */
  ApiRouter.applyRoutes = function(session) {
    var routes = $pluginConfig.router.routes();

    var targetId = session.plugin.uri;
    if (!targetId) {
      pLog.error('Cannot add routes, no target specified. Check plugin.json value for \'uri\'.');
      return;
    }

    var errors = false;
    var hostRoutes = lodash.map(routes, function(r) {
      if (!r.path || !r.method || !r.handler) {
        pLog.error('Invalid route: ' + JSON.stringify(r));
        errors = true;
      }

      return {
        path: r.path,
        method: r.method,
        handler: r.handler
      };
    });

    if (!errors) {
      // Add routes to our local map and broadcast and event to notify the host app to add routes.
      routeMap = routeMap.concat(routeMap, routes);
      $rootScope.$emit('Local/RoutesChanged', hostRoutes, targetId);
      return;
    }
  };

  /**
   * Not to be called by client implementation.
   */

  // Called by the ApiMessage after the message has been received.
  ApiRouter.routeRequest = function(request) {
    var route = {};
    var m = false;

    for (var i = 0; i < routeMap.length; i++) {
      m = match(routeMap[i], request, route);
      if (m) {
      	break;
      }
    }

    return (lodash.isEmpty(route) ? undefined : route);
  };

  /**
   * Private static methods
   */

  function match(mapEntry, request, route) {
    var keys = [];

    var m = pathToRegexpService.pathToRegexp(mapEntry.path, keys).exec(request.url);

    if (!m) {
      return false;
    }

    if (mapEntry.method != request.method) {
      return false;
    }

    route.params = {};
    route.path = m[0];
    route.handler = mapEntry.handler;

    // Assign url parameters to the request.
    for (var i = 1; i < m.length; i++) {
      var key = keys[i - 1];
      var prop = key.name;
      var val = decodeParam(m[i]);

      if (val !== undefined || !(hasOwnProperty.call(route.params, prop))) {
        route.params[prop] = val;
      }
    }

    request.params = route.params;
    return true;
  };

  function decodeParam(val) {
    if (typeof val !== 'string' || val.length === 0) {
      return val;
    }

    try {
      return decodeURIComponent(val);
    } catch (err) {
      if (err instanceof URIError) {
        err.message = 'Failed to decode param \'' + val + '\'';
        err.status = err.statusCode = 400;
      }

      throw err;
    }
  };

  return ApiRouter;
});

'use strict';

angular.module('owsWalletPluginClient.services').service('launchService', function($rootScope, $injector, lodash, apiHelpers, pLog, ApiMessage, ApiRouter, Session) {

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
      platformInfo: { fn: getPlatformInfo,      done: false },
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
        pLog.info('START: ' + response.statusText + ' (' + response.statusCode + ')');

        if (response.data.isCordova) {
        	setupForCordova();
        }

        // Allow messages to be sent.
        ApiMessage.ready();

        return;

      }).catch(function(error) {
        pLog.error('START ERROR: ' + JSON.stringify(error));

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
        pLog.error('getPlatform(): ' + JSON.stringify(error));
        
      });
    };

    $rootScope.$on('Local/Initialized', function(event, what) {
      initializers[what].state = true;

      pLog.debug(what + ' initialized');

      // Check if all items are initialized.
      var done = true;
      lodash.forEach(Object.keys(initializers), function(i) {
        done = done && initializers[i].state;
      });

      if (done) {
        var session = Session.getInstance();

        // Set our client name.
        apiHelpers.clientName(session.plugin.header.name);

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

          pLog.info('Open for business!');

        }).catch(function(error) {
          pLog.error('READY ERROR: (unexpected status) ' + JSON.stringify(error));

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
        pLog.error('ROUTES ERROR: ' + JSON.stringify(error));
      });
    });

  });

});

'use strict';

angular.module('owsWalletPluginClient.services').service('pLog', function($log, apiHelpers) {

	var root = {};

  root.debug = function(message) {
    doLog('debug', message);
  };

  root.error = function(message) {
    doLog('error', message);
  };

  root.info = function(message) {
    doLog('info', message);
  };

  root.warn = function(message) {
    doLog('warn', message);
  };

  function doLog(level, message) {
    var lead = '[' + apiHelpers.clientName() + '] ';
    switch (level) {
      case 'error': $log.error(lead + message); break;
      case 'wanr':  $log.warn(lead + message); break;
      case 'info':  $log.info(lead + message); break;
      default:      $log.debug(lead + message); break;
    }
  };

  return root;
});
