'use strict';

angular.module('owsWalletPluginClient.impl.api').factory('ApiMessage', function ($rootScope,  $injector, $log, $timeout, $window, lodash, apiHelpers, ApiRouter,
  /* @namespace owsWalletPluginClient.api */ ApiError) {

  var host = $window.parent;

  var REQUEST_TIMEOUT = 3000; // milliseconds

  var ready = false;
  var sequence = 0;
  var promises = [];

  /**
   * Events
   */

  // When a message is received this listener routes the payload to process the message.
  $window.addEventListener('message', receiveMessage.bind(this));

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

      if (isRequest(this) || isEvent(this)) {
        // Check the structure of the request (events are requests).
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
        type: (isEventUrl(request.url) ? 'event' : 'message'),
        sequence: sequence++,
        id: uuidv4(),
        timestamp: now,
        sessionId: apiHelpers.sessionId(),
        clientName:  apiHelpers.clientName(),
        clientId:  apiHelpers.pluginId()
      };
      this.request = request || {};
      this.response = {};
    }

    /**
     * Private methods
     */

    function isEventUrl(url) {
      return url == '/event';
    };

    function validateEvent() {
      if(lodash.isUndefined(self.event.data)) {

        // Invalid event.
        self.response = {
          statusCode: 500,
          statusText: 'MESSAGE_NOT_VALID',
          data: {
            message: 'Invalid message event, no \'data\' found.'
          }
        };

      } else if (!lodash.isString(self.event.data)) {

        // Event data not a string.
        self.response = {
          statusCode: 500,
          statusText: 'MESSAGE_NOT_VALID',
          data: {
            message: 'Invalid message event data, expected string argument but received object.'
          }
        };
      }
    };

    function validateRequest() {
      if (lodash.isUndefined(self.request)) {

        // No request.
        self.response  = {
          statusCode: 400,
          statusText: 'NO_REQUEST',
          data: {
            message: 'No request provided.'
          }
        };
        
      } else if (lodash.isUndefined(self.request.method)) {

        // No request method.
        self.response  = {
          statusCode: 400,
          statusText: 'NO_METHOD',
          data: {
            message: 'No request method specified.'
          }
        };
      }

      // Ensure that the specific request method is formed properly.
      switch (self.request.method) {
        case 'GET':
          break;
        case 'POST': validatePOST();
          break;
        case 'PUT': validatePUT();
          break;
        case 'DELETE':
          // Data payload is optional.
          break;
      }
    };

    function validatePOST() {
      // Check for required POST data.
      if (lodash.isUndefined(self.request.data)) {
        // Invalid request; does not match specification.
        self.response  = {
          statusCode: 400,
          statusText: 'REQUEST_NOT_VALID',
          data: {
            message: 'Invalid request, POST data not present in request.'
          }
        };
      }
    };

    function validatePUT() {
      // Check for required PUT data.
      if (lodash.isUndefined(self.request.data)) {
        // Invalid request; does not match specification.
        self.response  = {
          statusCode: 400,
          statusText: 'REQUEST_NOT_VALID',
          data: {
            message: 'Invalid request, PUT data not present in request.'
          }
        };
      }
    };

    function validateRoute() {
      if (lodash.isUndefined(self.route)) {

        // No route.
        self.response  = {
          statusCode: 404,
          statusText: 'ROUTE_NOT_FOUND',
          data: {
            message: 'Route not found.'
          }
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
        $log.debug('RESPONSE  ' + message.header.sequence + ': ' + messageToJson(message));

        // If the message is an event and the event does not target this plugin then do not deliver it.
        if (!isEvent(message) || isEvent(message) && eventTargetsMe(message)) {
          
          if (message.response.statusCode < 200 || message.response.statusCode > 299) {

            // Fail
            reject(new ApiError({
              code: message.response.statusCode,
              source: message.request.url,
              message: message.response.statusText,
              detail: message.response.data.message
            }));

          } else {
            // Success
            resolve(message.response);

          }
        }
      };

      // Send the message only if the client is ready or if the purpose of the message is to
      // start the client.
      if (ready || isStartMessage(self)) {

        if (isRequest(self)) {
          // Set the messge completion handler for our request.
          // For requests messages sourced from me use the onComplete() handler.
          // Events do not provide a response; no handler is set.
          var onReceived = onComplete;
          if (self.header.type == 'event') {
            onReceived = null;
          }

          if (onReceived) {
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
              onComplete: onReceived,
              timer: timeoutTimer,
              cancelOn: self.request.opts.cancelOn || []
            });
          }

          if (self.header.type == 'event') {
            $log.debug('EVENT OUT ' + self.header.sequence + ': ' + requestToJson(self));
          } else {
            $log.debug('REQUEST  ' + self.header.sequence + ': ' + requestToJson(self));
          }

        } else {
          $log.debug('RESPONSE  ' + self.header.sequence + ': ' + messageToJson(self));
        }

        // Post the message to the host.
        host.postMessage(angular.toJson(transport(self)), '*');

      } else {

        // The client service is not ready. Short circuit the communication and immediatley respond.
        self.response = {
          statusCode: 503,
          statusText: 'NOT_READY',
          data: {
            message: 'Client service not ready.'
          }
        };
        onComplete(self);

      }
    });
  };

  /**
   * Private static methods
   */

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  function isEvent(message) {
    return message.header.type == 'event';
  };

  function isRequest(message) {
    return (message.header.type == 'message') && lodash.isEmpty(message.response);
  };

  function eventTargetsMe() {
    var target = message.response.data.target;
    return (target == '*' || target == apiHelpers.pluginId());
  };

  function receiveMessage(event) {
    var message;

    try {
      message = new ApiMessage(event);

      if (isEvent(message)) {
        processEventMessage(message);

      } else if (isRequest(message)) {
        processRequestMessage(message);

      } else {
        processResponseMessage(message);
      }

    } catch (ex) {

      // Not possible to notify client since the message is invalid.
      // The client will timeout if a valid response is not received.
      $log.error('Could not process message, ' + ex.message + ' - '+ angular.toJson(event.data));
    }
  };

  function processEventMessage(message) {
    // Get the message handler and respond to the event.
    var handler = $injector.get(message.route.handler);
    handler.respond(message, function(message) {
      // No response messages sent from events.
    });
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

      // Deliver the result if it should not be canceled.
      if (promise[0].cancelOn.indexOf(message.response.statusCode) < 0) {
        promise[0].onComplete(message);
      }

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
    $log.warn('Plugin client request timeout: ' + serialize(message));

    var promiseIndex = lodash.findIndex(promises, function(promise) {
      return promise.id == message.header.id;
    });

    if (promiseIndex >= 0) {
      var promise = lodash.pullAt(promises, promiseIndex);

      message.response = {
        statusCode: 408,
        statusText: 'REQUEST_TIMED_OUT',
        data: {
          message: 'Request timed out.'
        }
      }
      promise[0].onComplete(message);
    } else {
      $log.warn('Message request timed out but there is no promise to fulfill: ' + serialize(message));
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

  function messageToJson(message) {
    var m = {
      header: message.header,
      request: message.request,
      response: message.response
    };
    return angular.toJson(m);
  };

  function requestToJson(message) {
    var r = {
      header: message.header,
      request: message.request
    };
    return angular.toJson(r);
  };

  function responseToJson(message) {
    var r = {
      header: message.header,
      response: message.response
    };
    return angular.toJson(r);
  };

  return ApiMessage;
});
