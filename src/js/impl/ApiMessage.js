'use strict';

angular.module('owsWalletPluginClient.impl').factory('ApiMessage', function ($rootScope, $log, lodash,  $injector, $timeout, CError) {

  var host = window.parent;

  var REQUEST_TIMEOUT = 3000; // milliseconds
  var START_URL = '/start';

  var state = {
    statusCode: -1,
    statusText: ''
  };

  var sequence = 0;
  var promises = [];

  /**
   * Events
   */

  // When a message is received from the host app this listener routes the payload to process the message.
  window.addEventListener('message', receiveMessage.bind(this));

  // This event is received when two way communication is established between the host app and this client. An error in the
  // start handshake communiction is fatal and blocks further attempts to send messages.
  $rootScope.$on('$pre.start', function(event, stateObj) {
    state = stateObj;
  });

  /**
   * Constructor
   */

  function ApiMessage(eventOrRequest) {
    var self = this;
    this.event = {};

    if (eventOrRequest instanceof MessageEvent) {
      var event = eventOrRequest;

      // Construct a message from the event data.
      this.event = event;

      // Check the itegrity of the message event.
      validateEvent();

      // Assign the event message data to this message object and make alias assignments.
      var data = JSON.parse(this.event.data);
      lodash.assign(this, data);

    } else {
      var request = eventOrRequest;

      // Set request options per caller or use defaults.
      request.opts = request.opts || {};
      request.opts.timeout = request.opts.timeout || REQUEST_TIMEOUT;

      // Construct a new message from the data and make alias assignments.
      var now = new Date();
      this.header = {
        sequence: sequence++,
        id: '' + now.getTime(),
        timestamp: now
      };
      this.request = request || {};
      this.response = {};
    }

    /**
     * Private methods
     */

    function validateEvent() {
      if(lodash.isUndefined(this.event.data)) {

        // Invalid event.
        this.response = {
          statusCode: 500,
          statusText: 'Invalid message event, no \'data\' found.',
          data: {}
        };
        throw new Error();

      } else if (!lodash.isString(this.event.data)) {

        // Event data not a string.
        this.response = {
          statusCode: 500,
          statusText: 'Invalid message event data, expected string argument but received object.',
          data: {}
        };
        throw new Error();
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

        if (message.response.statusCode < 200 && message.response.statusCode > 299) {
          // Fail
          reject(new CError(message));

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
      if (messageServiceIsOK() || isStartMessage(self)) {

        // Set a communication timeout timer unless the caller overrides.
        var timeoutTimer = {};
        if (self.request.opts.timeout > 0) {
          timeoutTimer = $timeout(function() {
            timeout(self);
          }, REQUEST_TIMEOUT);
        }

        // Store the promise callback for execution when a message is received.
        promises.push({
          id: self.header.id,
          onComplete: onComplete,
          timer: timeoutTimer
        });

        // Post the message to the host.
        $log.info('[client] REQUEST  ' + self.header.sequence + ': ' + angular.toJson(transport(self)));
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

  function receiveMessage(event) {
    var message;

    try {
      message = new ApiMessage(event);

      // $log.info('[client] receive  ' + message.header.sequence + ': ' + serialize(message) + ' (from ' + message.event.source.location.toString() + ')');

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
        $log.warn('[client] WARNING: Message received but there is no promise to fulfill: ' + serialize(message));
      }      

    } catch (ex) {

      // Not possible to notify client since the message is invalid.
      // The client will timeout if a valid response is not received.
      $log.error('[client] ERROR: invalid message received, ' + ex.message + ' - '+ angular.toJson(event));
    }
  };

  // Timeout a message waiting for a reponse. Enables the client app to process a message delivery failure.
  function timeout(message) {
    $log.debug('Plugin client request timeout: ' + serialize(message));

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
      $log.warn('[client] WARNING: Message request timed out but there is no promise to fulfill: ' + serialize(message));
    }
  };

  function isStartMessage(message) {
    return message.request.url == START_URL;
  };

  function messageServiceIsOK() {
    return state.statusCode >= 200 && state.statusCode <= 299;
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
