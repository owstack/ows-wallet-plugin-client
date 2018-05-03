'use strict';

angular.module('owsWalletPluginClient.impl').service('pluginClientService', function (CSession) {

  var root = {};

  // Initialize the plugin session.
  CSession.getInstance();

  return root;
});
