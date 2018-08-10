'use strict';

angular.module('owsWalletPluginClient.impl.apiHandlers').service('hostEvent', function($log, lodash) {

	var root = {};

  root.respond = function(message, callback) {
	  // Request parameters.
    var event = message.request.data;

  	if (lodash.isEmpty(event)) {
      $log.error('Received a host event message with no event data.');
      return;
  	}

    // A properly received message does not send a response back to the host app.
    switch (event.name) {
      case 'ready':
        // We're being told another plugin is ready.
        owswallet.Plugin.setOpen(event.pluginId);
        break;

      default:
        // We're receiving an event; notify subscribers.
        owswallet.Plugin.notify(event);
        break;
    }

  };

  return root;
});
