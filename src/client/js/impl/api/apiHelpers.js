'use strict';

angular.module('owsWalletPluginClient.impl.api').service('apiHelpers', function() {

	var root = {};

  var clientName;
  var pluginId;

  // Get the sessionId from the URL.
  root.sessionId = function() {
    var sessionId = null;
    var idxSessionId = window.location.search.indexOf('sessionId=');

    if (idxSessionId >= 0) {
      var sessionId = window.location.search.substring(idxSessionId + 10);
      if (sessionId.indexOf('&') >= 0) {
        sessionId = sessionId.substring(0, sessionId.indexOf('&'));
      }
    }
    return sessionId;
  };

  // Typically used for debugging.
  root.clientName = function(name) {
    clientName = name || clientName || root.sessionId();
    return clientName;
  };

  root.pluginId = function(id) {
    pluginId = id || pluginId;
    return pluginId;
  };

  return root;
});
