'use strict';

var modules = [
  'gettext',
	'ngLodash',
  'pathToRegexpModule',
	'owsWalletPluginClient.api',
	'owsWalletPluginClient.impl'
];

var owsWalletPluginClient = angular.module('owsWalletPluginClient', modules);

angular.module('owsWalletPluginClient.api', []);
angular.module('owsWalletPluginClient.impl', []);

'use strict';

angular.module('owsWalletPluginClient').config(function() {

  // Nothing to do.

}).run(function($rootScope, $injector, lodash, apiHelpers, apiLog, ApiMessage, ApiRouter, CPlatform, CSession) {

  // Setup based on the declared plugin kind.
  var pluginKind = document.getElementsByName("ows-wallet-plugin-kind")[0].content;
  var isApplet = (pluginKind == 'applet');
  var isServlet = (pluginKind == 'servlet');

  validateStartup();

  // Initialization depends on asynchronous messaging with the host app. The 'initialized' object is used to keep track of
  // all items to be initialized.  When all items become true (initialized) the we notify the host and then the local client that
  // we're ready.
  var initializers = {
    platformInfo: { fn: CPlatform.get,        state: false },
    session:      { fn: CSession.getInstance, state: false }
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
      apiLog.info('START: ' + response.statusText + ' (' + response.statusCode + ')');

      if (response.data.isCordova) {
      	setupForCordova();
      }

      $rootScope.$emit('$pre.start');

      return;

    }).catch(function(error) {
      apiLog.error('START ERROR: ' + JSON.stringify(error));

    });
  };

  function setupForCordova() {
    if (isApplet) {
      // Tells ionic that we are running in a Cordova container. Ionic doesn't add this class because we are not the root document.
      angular.element(document.querySelector('body')).addClass('platform-cordova');
      angular.element(document.querySelector('ion-nav-view')).css('width', window.innerWidth + 'px');
    }
  };

  $rootScope.$on('Local/Initialized', function(event, what) {
    initializers[what].state = true;

    apiLog.debug(what + ' initialized');

    // Check if all items are initialized.
    var done = true;
    lodash.forEach(Object.keys(initializers), function(i) {
      done = done && initializers[i].state;
    });

    if (done) {
      var session = CSession.getInstance();

      // Set our client name.
      apiHelpers.clientName(session.plugin.header.name);

      // Will throw error if not valid.
      validateStartup(session);

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
        $rootScope.$emit('$pre.ready', session);

        apiLog.info('Open for business!');

      }).catch(function(error) {
        apiLog.error('READY ERROR: (unexpected status) ' + JSON.stringify(error));

      });
    }
  });

  // The client may updated its host app routes at any time.  When routes are changed this handler updates the host app.
  $rootScope.$on('Local/RoutesChanged', function(event, routes, target) {
    var request = {
      method: 'POST',
      url: '/session/' + CSession.getInstance().id + '/routes',
      data: {
        routes: routes,
        target: target
      }
    };

    return new ApiMessage(request).send().then(function(response) {
    }).catch(function(error) {
      apiLog.error('ROUTES ERROR: ' + JSON.stringify(error));
    });
  });

});

angular.module('owsWalletPluginClient').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
/* jshint +W100 */
}]);
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

angular.module('owsWalletPluginClient.impl').service('apiLog', function($log, apiHelpers) {

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

'use strict';

angular.module('owsWalletPluginClient.impl').factory('ApiMessage', function ($rootScope, lodash,  $injector, $timeout, apiHelpers, apiLog, ApiRouter, CError) {

  var host = window.parent;

  var REQUEST_TIMEOUT = 3000; // milliseconds

  var messageServiceIsOK = false;
  var sequence = 0;
  var promises = [];

  /**
   * Events
   */

  // When a message is received this listener routes the payload to process the message.
  window.addEventListener('message', receiveMessage.bind(this));

  // This event is received when two way communication is established between the host app and this client. An error in the
  // start handshake communication is fatal and blocks further attempts to send messages.
  $rootScope.$on('$pre.start', function(event) {
    messageServiceIsOK = true;
  });

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
   * Public methods
   */

  ApiMessage.prototype.send = function() {
    var self = this;
    return new Promise(function(resolve, reject) {

      var onComplete = function(message) {
        var responseObj;

        if (message.response.statusCode < 200 || message.response.statusCode > 299) {
          // Fail
          reject(new CError({
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

      // Send the message only if the client is OK or if the purpose of the message is to
      // start the client.
      if (messageServiceIsOK || isStartMessage(self)) {

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

          apiLog.info('REQUEST  ' + self.header.sequence + ': ' + angular.toJson(transport(self)));
        } else {
          apiLog.info('RESPONSE  ' + self.header.sequence + ': ' + angular.toJson(transport(self)));
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
      apiLog.error('Invalid message received, ' + ex.message + ' - '+ angular.toJson(event));
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

  // Timeout a message waiting for a reponse. Enables the client app to process a message delivery failure.
  function timeout(message) {
    apiLog.debug('Plugin client request timeout: ' + serialize(message));

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
      apiLog.warn('Message request timed out but there is no promise to fulfill: ' + serialize(message));
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

angular.module('owsWalletPluginClient.impl').factory('ApiRouter', function ($rootScope, apiLog, lodash, pathToRegexpService) {

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
  ApiRouter.addRoutes = function(session, routes) {
    var targetId = session.plugin.uri;
    if (!targetId) {
      apiLog.error('Cannot add routes, no target specified. Check plugin.json value for \'uri\'.');
      return;
    }

    var errors = false;
    var hostRoutes = lodash.map(routes, function(r) {
      if (!r.path || !r.method || !r.handler) {
        apiLog.error('Invalid route: ' + JSON.stringify(r));
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

angular.module('owsWalletPluginClient.api').factory('CApplet', function (lodash) {

  /**
   * CApplet
   *
   * Provides access to applet behavior. An instance of this class should be obtained from the
   * CSession instance.
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
   * Constructor.  An instance of this class must be obtained from CSession.
   * @param {Object} plugin - An internal Plugin object.
   * @return {Object} An instance of CApplet.
   * @constructor
   */
  function CApplet(appletObj) {
    lodash.assign(this, appletObj);
    return this;
  };

  /**
   * Hides the splash image after starting.
   * @return {Promise} A promise at completion.
   */
  CApplet.prototype.hideSplash = function() {
    var request = {
      method: 'POST',
      url: '/applet/' + this.header.id + '/config',
      data: {
        showSplash: false
      }
    }

    return new ApiMessage(request).send();
  };

  return CApplet;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CConst', function () {

  /**
   * CConstants
   *
   * Provides commonly used constant values.
   */

  /**
   * Constructor.
   * @constructor
   */
  function CConst() {
    throw new Error('CConst is a static class');
  };

  CConst.BITS_PER_BTC = 1e6;
  CConst.SATOSHI_PER_BTC = 1e8;

  return CConst;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CError', function (lodash) {

  /**
   * CError
   *
   * Provides a wrapper for messages coming from the host app.
   */

  /**
   * Constructor.
   * @return {CError} An instance of CError.
   * @constructor
   *
   * errorObj: {
   *   code: <number>
   *   source: <string>
   *   message: <string>
   *   detail: <string>
   * }
   */
  function CError(errorObj) {
    lodash.assign(this, errorObj);
    return this;
  };

  return CError;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CHttp', function (apiLog, lodash, $http) {

  /**
   * CHttp
   *
   * Provides a wrapper for $http.
   */

	var REQUIRED_CONFIG = [
		'url'
	];

  /**
   * Constructor.
   * @return {CHttp} An instance of CHttp.
   * @constructor
   */
  function CHttp(config) {
  	checkRequiredConfig();
  	validateConfig();

    lodash.assign(this, config);

    // Private functions
    //
    function checkRequiredConfig() {
	    var validRequest = Object.keys(lodash.pick(data, REQUIRED_CONFIG)).length == REQUIRED_CONFIG.length;

	    if (!validRequest) {
	  		throw new Error('Missing required arguments for CHttp, you must include \'' + REQUIRED_PARAMS.toString() + '\'');
	  	}
	  };

    function validateConfig() {
    	// Check format for url.
	    if (!this.url.match(/^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/g)) {
	    	throw new Error('Invalid URL for CHttp \'' + this.url + '\'');
	    }

	    // Append a '/' is not present.
	    if (this.url.slice(-1) != '/') {
	    	this.url += '/';
	    }
    };

    return this;
  };

  /**
   * Create a GUID.
   * @return {String} A GUID string value.
   */
  CHttp.prototype.guid = function() {
    return Date.now().toString();
  };

  /**
   * Make an HTTP GET request.
   * @param {String} endpoint - The URI to the resource.
   * @return {Promise<Object>} A promise for the response.
   */
  CHttp.prototype.get = function(endpoint) {
  	return new Promise(function(resolve, reject) {
	    apilog.debug('GET ' + encodeURI(this.url + endpoint));

	    var getData = {
	      method: 'GET',
	      url: encodeURI(this.url + endpoint),
	      headers: {
	        'Content-Type': 'application/json',
	        'Accept': 'application/json'
	      }
	    };

	    $http(getData).then(function(response) {
	      apiLog.debug('GET SUCCESS: ' + endpoint);
	      resolve(response);

	    }).catch(function(error) {
	      apiLog.error('GET ERROR: ' + endpoint + ', ' + error.statusText);
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
  CHttp.prototype.post = function(endpoint, data) {
  	return new Promise(function(resolve, reject) {
	    apiLog.debug('POST ' + encodeURI(this.url + endpoint) + ' data = ' + JSON.stringify(data));

	    var postData = {
	      method: 'POST',
	      url: encodeURI(this.url + endpoint),
	      headers: {
	        'Content-Type': 'application/json',
	        'Accept': 'application/json'
	      },
	      data: data
	    };

	    $http(postData).then(function(response) {
	      apiLog.deebug('POST SUCCESS: ' + endpoint);
	      resolve(response);

	    }).catch(function(error) {
	      apiLog.error('POST ERROR: ' + endpoint + ', ' + error.statusText);
	      reject(error.statusText);

	    });
    });
  };

  return CHttp;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CPlatform', function ($rootScope, apiLog, lodash, ApiMessage) {

  /**
   * CPlatform
   *
   * Provides access to host platform information.
   */

  /**
   * Properties
   * ----------
   *
   * isCordova - True if running in a Cordova environment, false otherwise.
   * isNodeWebkit - True if running in a Node Webkit environment, false otherwise.
   * isSafari - True if running in a Safari browser, false otherwise.
   * userAgent - The browser user agent string.
   *
   * isMobile.any - True if running in a mobile device, false otherwise.
   * isMobile.Android - True if running on Android, false otherwise.
   * isMobile.iOS - True if running on iOS, false otherwise.
   * isMobile.iPhoneX - True if running on iPhoneX, false otherwise.
   */

  /**
   * Constructor.
   * @constructor
   */
  function CPlatform() {
    throw new Error('CPlatform is a static class');
  };

  /**
   * Get the platform information.
   * @return {Promise<Object>} A promise for the specified service object.
   */
  CPlatform.get = function() {
    var request = {
      method: 'GET',
      url: '/info/platform',
      responseObj: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      lodash.assign(CPlatform, response);
      $rootScope.$emit('Local/Initialized', 'platformInfo');
      return response;

    }).catch(function(error) {
      apiLog.error('CPlatform.get(): ' + JSON.stringify(error));
      
    });
  };

  return CPlatform;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CServlet', function (lodash) {

  /**
   * CServlet
   *
   * Provides access to servlet behavior. An instance of this class should be obtained from the
   * CSession instance.
   */

  /**
   * Constructor.  An instance of this class must be obtained from CSession.
   * @param {Object} plugin - An internal plugin object.
   * @return {Object} An instance of CServlet.
   * @constructor
   */
  function CServlet(servletObj) {
    lodash.assign(this, servletObj);
    return this;
  };

  return CServlet;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CSession', function ($rootScope, lodash, apiHelpers, apiLog, ApiMessage, CApplet, CServlet, CError, CWallet) {

  /**
   * CSession
   *
   * This class provides session functionality including reading and writing persistent data. An instance of
   * this class should be obtained by calling CSession.getInstance().
   */

   var instance;

  /**
   * Constructor.
   * @return {Object} The single instance of CSession.
   * @constructor
   */
  function CSession() {
    var self = this;

    if (instance) {
      return instance;
    }
    instance = this;

    getSession().then(function(sessionObj) {
      // Assign the session data to ourself.
      lodash.assign(self, sessionObj);

      switch (self.plugin.header.kind) {
        case 'applet': self.plugin = new CApplet(self.plugin); break;
        case 'servlet': self.plugin = new CServlet(self.plugin); break;
      };

      $rootScope.$emit('Local/Initialized', 'session');
    
    }).catch(function(error) {
      apiLog.error('CSession(): ' + JSON.stringify(error));

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
  CSession.getInstance = function() {
    return instance || new CSession();
  };

  /**
   * Write all session data to persistent storage.
   * @return {Promise} A promise at completion.
   */
  CSession.prototype.flush = function() {
    var request = {
      method: 'POST',
      url: '/session/flush',
      data: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      return repsonse;

    }).catch(function(error) {
      apiLog.error('CSession.flush():' + JSON.stringify(error));
      
    });
  };

  /**
   * Retrieve session data by name.
   * @param {String} name - User specified data name defined using set(name, value).
   * @return {Promise<Object>} A promise for stored value.
   */
  CSession.prototype.get = function(name) {
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
      apiLog.error('CSession.get(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Restore all session data from persistent storage. A 'data' property is created on the session.
   * @return {Promise} A promise at completion with param 'data' or an error.
   */
  CSession.prototype.restore = function() {
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
      apiLog.error('CSession.restore(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Set session data by name. A 'data' property is created on the session.
   * @param {String} name - Location to store the specified value.
   * @param {Object} value - The data value to store.
   * @return {Promise} A promise at completion with param 'value' or an error.
   */
  CSession.prototype.set = function(name, value) {
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
      apiLog.error('CSession.set(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Prompts the user to choose a wallet from a wallet chooser UI. The selected wallet is returned as a new CWallet instance.
   * @return {CWallet} An instance of the chosen CWallet.
   * @static
   */
  CSession.prototype.chooseWallet = function() {
    var self = this;
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/choosewallet',
      responseObj: 'CWallet',
      opts: {
        timeout: -1
      }
    }

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      apiLog.error('CSession.chooseWallet(): ' + JSON.stringify(error));
      
    });
  };

  return CSession;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CSystem', function () {

  /**
   * CSystem
   *
   * Provides general purpose system utilities.
   */

  /**
   * Constructor.
   * @constructor
   */
  function CSystem() {
    throw new Error('CSystem is a static class');
  };

  /**
   * Return whether or not the specified object has all required properties.
   * @return {Object} An object of two arrays; 'missing' and 'other' properties.
   * @static
   */
  CSystem.checkObject = function(obj, requiredProperties) {
    var properties = iterateObj(obj, '');

    var missing = [];
    var other = [];
    for (var i = 0; i < requiredProperties.length; i++) {
      if (properties.indexOf(requiredProperties[i]) < 0) {
        missing.push(requiredProperties[i]);
      }
    }
    for (var i = 0; i < properties.length; i++) {
      if (requiredProperties.indexOf(properties[i]) < 0) {
        other.push(properties[i]);
      }
    }
    return { missing: missing, other: other };
  };

  // Recursively iterate over the objects properties and return an array of properties.
  function iterateObj(obj, stack) {
    var properties = [];
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] == "object") {
          properties.push(stack + '.' + property);
          properties = properties.concat(iterateObj(obj[property], stack + '.' + property));
        } else {
          properties.push(stack + '.' + property);
        }
      }
    }
    return properties;
  };

  return CSystem;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CUtils', function (rateService) {

  /**
   * CUtils
   *
   * Provides domain utilities.
   */

  /**
   * Constructor.
   * @constructor
   */
  function CUtils() {
    throw new Error('CUtils is a static class');
  };

  /**
   * Retrieve a currency exchange rate (vs. bitcoin price).
   * @param {String} code - The ISO currency code for exchange.
   * @return {Object} An instance of a service object.
   * @static
   */
  CUtils.getRate = function(isoCode) {
    return rateService.getRate(isoCode);
  };

  return CUtils;
});

'use strict';

angular.module('owsWalletPluginClient.api').factory('CWallet', function (lodash) {

  /**
   * CWallet
   *
   * Provides access to a wallet. An instance of this class should be obtained from the CSession instance.
   */

  /**
   * Constructor.  An instance of this class must be obtained from CSession.
   * @param {Object} wallet - An internal Wallet object.
   * @return {Object} An instance of CWallet.
   * @constructor
   */
  function CWallet(walletObj) {
    lodash.assign(this, walletObj);
  };

  return CWallet;
});
