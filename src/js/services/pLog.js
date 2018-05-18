'use strict';

angular.module('owsWalletPluginClient.services').service('pLog', function($log, apiHelpers) {

	var root = {};

  root.debug = function(message) {
    doLog('debug', message);
  };

  root.error = function(message) {
    doLog('error', message);
  };

  root.info = function(message) {
    doLog('info', message);
  };

  root.warn = function(message) {
    doLog('warn', message);
  };

  function doLog(level, message) {
    var lead = '[' + apiHelpers.clientName() + '] ';
    switch (level) {
      case 'error': $log.error(lead + message); break;
      case 'wanr':  $log.warn(lead + message); break;
      case 'info':  $log.info(lead + message); break;
      default:      $log.debug(lead + message); break;
    }
  };

  return root;
});
