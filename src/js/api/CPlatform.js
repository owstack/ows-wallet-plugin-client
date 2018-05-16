'use strict';

angular.module('owsWalletPluginClient.api').factory('CPlatform', function ($rootScope, apiLog, lodash, ApiMessage) {

  /**
   * CPlatform
   *
   * Provides access to host platform information.
   */

  /**
   * Properties
   * ----------
   *
   * isCordova - True if running in a Cordova environment, false otherwise.
   * isNodeWebkit - True if running in a Node Webkit environment, false otherwise.
   * isSafari - True if running in a Safari browser, false otherwise.
   * userAgent - The browser user agent string.
   *
   * isMobile.any - True if running in a mobile device, false otherwise.
   * isMobile.Android - True if running on Android, false otherwise.
   * isMobile.iOS - True if running on iOS, false otherwise.
   * isMobile.iPhoneX - True if running on iPhoneX, false otherwise.
   */

  /**
   * Constructor.
   * @constructor
   */
  function CPlatform() {
    throw new Error('CPlatform is a static class');
  };

  /**
   * Get the platform information.
   * @return {Promise<Object>} A promise for the specified service object.
   */
  CPlatform.get = function() {
    var request = {
      method: 'GET',
      url: '/info/platform',
      responseObj: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      lodash.assign(CPlatform, response);
      $rootScope.$emit('Local/Initialized', 'platformInfo');
      return response;

    }).catch(function(error) {
      apiLog.error('CPlatform.get(): ' + JSON.stringify(error));
      
    });
  };

  return CPlatform;
});
