'use strict';

angular.module('owsWalletPluginClient.api').service('ready', function($rootScope) {

	var root = {};

  root.respond = function(message, callback) {
	  // Request parameters.
    var data = message.request.data;
    var pluginId = data.pluginId;

  	if (lodash.isUndefined(pluginId) || pluginId.length <= 0) {
	    message.response = {
	      statusCode: 400,
	      statusText: 'The request must include a plugin id.',
	      data: {}
	    };
			return callback(message);
  	}

    // A properly received message does not send a response back to the host app.
    // We just broadcast an event for the client with the plugin id of the plugin
    // that has become ready.
    $rootScope.$emit('$pre.openForBusiness', pluginId);

    return;
  };

  return root;
});
