'use strict';

angular.module('owsWalletPluginClient').run(function(CSession) {

  // Get the session object and fire the '$pre.ready' event.
  CSession.getInstance();

});
