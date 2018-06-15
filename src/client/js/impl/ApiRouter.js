'use strict';

angular.module('owsWalletPluginClient.impl').factory('ApiRouter', function ($rootScope, $pluginConfig, $log, lodash, pathToRegexpService) {

  /**
   * API routes.
   *
   * API providers must add their routes to the host using addRoutes().
   * A match is made by searching routes in order, the first match returns the route.
   *
   * The local routes here direct incoming messages for this plugin to handle.
   */

  var routeMap = [];

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
   * method - one of GET, POST, PUT, DELETE
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
    // Get the client configured routes.
    var routes = $pluginConfig.router.routes();

    // Build a valid host routes list (we don't just pass whatever the user configured in the routes array).
    var errors = false;
    routes = lodash.map(routes, function(r) {
      if (!r.path || !r.method || !r.handler) {
        $log.error('Invalid route: ' + JSON.stringify(r));
        errors = true;
      }

      // Prepend the plugin ID to create a globally unique route.
      return {
        path: '/' + session.plugin.header.id + r.path,
        method: r.method,
        handler: r.handler
      };
    });

    if (!errors) {
      // Add routes to our local map and broadcast an event to notify the host app to add routes.
      routeMap = routeMap.concat(routes);
      $rootScope.$emit('Local/RoutesChanged', routes);
    }

    // Add a route for this client to receive event messages from the host app.
    // The route name uses our session id; e.g., "/1234567890". This guarantees a unique entry in the host app routing map.
    var eventRoute = [{ path: '/' + session.id , method: 'POST', handler: 'hostEvent' }];
    
    routeMap = routeMap.concat(eventRoute);
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
