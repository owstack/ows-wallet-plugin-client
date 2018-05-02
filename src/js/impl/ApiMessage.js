'use strict';

angular.module('owsWalletPluginClient.impl').factory('ApiMessage', function ($log, lodash) {

  function ApiMessage(eventOrRequest, sequence) {
    var self = this;
    this.event = {};

    // Sequence must not be provided with an event.
    if (lodash.isUndefined(sequence)) {
      var event = eventOrRequest;

      if (lodash.isUndefined(event) || !(event instanceof MessageEvent)) {
        throw Error('event is not a MessageEvent');
      }

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
      this.header = {
        sequence: (!lodash.isUndefined(sequence) ? sequence : -1),
        id: '' + new Date().getTime(),
        timestamp: new Date()
      };
      this.request = request || {};
      this.response = {};
    }

    // Private methods
    //
    function transport() {
      return {
        header: this.header,
        request: this.request,
        response: this.response
      }
    };

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

  // Public methods
  //
  ApiMessage.prototype.send = function(host) {
    $log.info('[client] REQUEST  ' + this.header.sequence + ': ' + angular.toJson(transport()));
    host.postMessage(angular.toJson(transport()), '*');
  };

  ApiMessage.prototype.serialize = function() {
    return angular.toJson(transport());
  };

  return ApiMessage;
});
