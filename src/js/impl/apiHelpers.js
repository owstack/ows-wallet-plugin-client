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
