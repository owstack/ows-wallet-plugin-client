'use strict';

angular.module('owsWalletPluginClient.services').service('externalLinkService', function(nodeWebkitService, popupService, gettextCatalog, $window, $log, $timeout) {

	var root = {};
  var isNodeWebKit;

  owswallet.Plugin.ready(function(){
    isNodeWebKit = owswallet.Plugin.isNodeWebKit();
  });

  root.open = function(url, optIn, title, message, okText, cancelText) {
    var old = $window.top.handleOpenURL;

    $window.top.handleOpenURL = function(url) {
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
            $window.top.open(url, '_system');
          }
          restoreHandleOpenURL(old);
        });
      } else {
        $window.top.open(url, '_system');
        restoreHandleOpenURL(old);
      }
    }
  };

  function restoreHandleOpenURL(old) {
    $timeout(function() {
      $window.top.handleOpenURL = old;
    }, 500);
  };

  return root;
});
