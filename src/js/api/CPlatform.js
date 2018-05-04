'use strict';

angular.module('owsWalletPluginClient.api').factory('CPlatform', function (lodash) {

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
   * Initialize a plugin service.
   * @param {String} pluginId - The plugin ID that identifies a registered service.
   * @return {Promise<Object>} A promise for the specified service object.
   */
  function init() {
    var request = {
      method: 'GET',
      url: '/info/platorm',
      responseObj: {}
    }

    return new ApiMessage(request).send().then(function(info) {
      lodash.assign(CPlatform, info);
    });
  };

  // Retrieve info at startup.
  init();

  return CPlatform;
});
