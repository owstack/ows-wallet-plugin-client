'use strict';

angular.module('owsWalletPluginClient.services').service('externalLinkService', function(nodeWebkitService, popupService, gettextCatalog, $window, $log, $timeout) {

	var root = {};
	var isNodeWebKit = owswallet.Plugin.isNodeWebKit();

  root.open = function(url, optIn, title, message, okText, cancelText) {
    var old = $window.handleOpenURL;

    $window.handleOpenURL = function(url) {
      // Ignore external URLs
      $log.debug('Skip: ' + url);
    };

    if (isNodeWebKit) {
      nodeWebkitService.openExternalLink(url);
      restoreHandleOpenURL(old);
    } else {
      if (optIn) {
        popupService.showConfirm(title, message, okText, cancelText, function(res) {
          if (res) {
            window.open(url, '_system');
          }
          restoreHandleOpenURL(old);
        });
      } else {
        window.open(url, '_system');
        restoreHandleOpenURL(old);
      }
    }
  };

  function restoreHandleOpenURL(old) {
    $timeout(function() {
      $window.handleOpenURL = old;
    }, 500);
  };

  return root;
});
