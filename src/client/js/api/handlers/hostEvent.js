'use strict';

angular.module('owsWalletPluginClient.api').service('hostEvent', function($log, lodash) {

	var root = {};

  root.respond = function(message, callback) {
	  // Request parameters.
    var event = message.request.data;

  	if (lodash.isEmpty(event)) {
      $log.error('Received a host event message with no event data.');
      return;
  	}

    // A properly received message does not send a response back to the host app.
    // Send the event to the client if not processed here.
    switch (event.type) {
      case 'ready': 
        owswallet.Plugin.setOpen(event.pluginId);
        break;

      default:
        owswallet.Plugin.onEvent(event);
        break;
    }

  };

  return root;
});
