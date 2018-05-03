'use strict';

angular.module('owsWalletPluginClient.api').factory('CScope', function (lodash, ApiMessage) {

  /**
   * CScope
   *
   * A static class to manage applet scope.
   */

  var SCOPE_URL = '/scope';

  /**
   * Constructor.
   * @constructor
   */
  function CScope() {
    throw new Error('CScope is a static class');
  };

  /**
   * Get the single session object or create the session.
   * @return {Promise} A promise to refresh scope from the host.
   */
  CScope.refresh = function() {
    return new Promise(function(resolve, reject) {
      var request = {
       method: 'GET',
       url: SCOPE_URL
      }

      return new ApiMessage(request).send().then(function(response) {
        $log.info('[client] SCOPE: ' + response.statusText + ' (' + response.statusCode + ')');

        // Apply the response to the clients root scope.
        $rootScope.env = response.data.env;
        $rootScope.applet = response.data.applet;

        $timeout(function() {
          $rootScope.$apply();
        });

        resolve();
        
      }, function(error) {
        $log.error('[client] SCOPE ERROR: ' + error.message + ' (' + error.statusCode + ')');
        reject(error);
      });
    });
  };

  return CScope;
});
