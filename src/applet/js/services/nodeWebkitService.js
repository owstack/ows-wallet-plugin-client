'use strict';

angular.module('owsWalletPluginClient.services').service('nodeWebkitService', function() {

	var root = {};

  root.readFromClipboard = function() {
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();
    return clipboard.get();
  };

  root.writeToClipboard = function(text) {
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();
    return clipboard.set(text);
  };

  root.openExternalLink = function(url) {
    var gui = require('nw.gui');
    return gui.Shell.openExternal(url);
  };

  return root;
});
