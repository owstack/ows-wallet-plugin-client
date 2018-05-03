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

  window.addEventListener('message', receiveMessage.bind(this));

  /**
   * Events
   */

  $rootScope.$on('$pre.start', function(event, stateObj) {
    state = stateObj;
  });

  /**
   * Constructor
   */

  function ApiMessage(eventOrRequest) {
    var self = this;
    this.event = {};

    // Sequence must not be provided with an event.
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

    function isStartMessage() {
      return this.request.url == START_URL;
    };

    function messageServiceIsOK() {
      return state.statusCode >= 200 && state.statusCode <= 299;
    };

    function serialize() {
      return angular.toJson(transport());
    };

    function transport() {
      return {
        header: this.header,
        request: this.request,
        response: this.response
      }
    };

    return this;
  };

  /**
   * Public methods
   */

  ApiMessage.prototype.send = function() {
    return new Promise(function(resolve, reject) {

      var onComplete = function(message) {
        if (message.response.statusCode >= 200 &&
          message.response.statusCode <= 299) {

          if (!lodash.isUndefined(message.request.responseObj)) {
            // Create an instance of the promised responseObj with the message data.
            var responseObj = $injector.get(message.request.responseObj);
            responseObj = eval(new responseObj(message.response.data.obj));
          } else {
            // Send the plain response object data if no responseObj set.
            // The receiver will have to know how to interpret the object.
            responseObj = message.response;
          }

          resolve(responseObj);

        } else {

          var responseObj = new CError(message);
          reject(responseObj);
        }
      };

      // Send the message only if the client is OK or if the purpose of the message is to
      // start the client.
      if (messageServiceIsOK() || isStartMessage()) {

        // Set a communication timeout timer.
        var timeoutTimer = $timeout(function() {
          timeout(this);
        }, REQUEST_TIMEOUT);

        // Store the promise callback for execution when a message is received.
        promises.push({
          id: this.header.id,
          onComplete: onComplete,
          timer: timeoutTimer
        });

        // Post the message to the host.
        $log.info('[client] REQUEST  ' + this.header.sequence + ': ' + angular.toJson(transport()));
        host.postMessage(angular.toJson(transport()), '*');

      } else {

        // The client service is not ready. Short circuit the communication and immediatley respond.
        this.response = {
          statusCode: 503,
          statusText: 'Client service not ready.',
          data: {}
        };
        onComplete(this);

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

      // $log.info('[client] receive  ' + message.header.sequence + ': ' + serialize() + ' (from ' + message.event.source.location.toString() + ')');

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
        $log.debug('Message received but there is no promise to fulfill: ' + serialize());
      }      

    } catch (ex) {

      // Not possible to notify client since the message is invalid.
      // The client will timeout if a valid response is not received.
      $log.error('[client] ERROR: invalid message received, ' + ex.message + ' - '+ angular.toJson(event));
    }
  };

  function timeout(message) {
    $log.debug('Applet client request timeout: ' + message);

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
      $log.debug('Message request timed out but there is no promise to fulfill: ' + serialize());
    }
  };

  return ApiMessage;
});
