'use strict';

angular.module('owsWalletPluginClient.api').factory('Device', function (ApiMessage,
  /* @namespace owsWalletPluginClient.api */ ApiError) {

  /**
   * Device
   *
   * Provides access to device specific capabilties.
   */

  /**
   * Constructor.
   * @constructor
   */
  function Device() {
    throw new ApiError({
      message: 'IMPLEMENATION_ERROR',
      detail: 'Device is a static class'
    });
  };

  /**
   * Put a text string on the device clipboard.
   * @return {String} data - The text string copied to the clipboard.
   * @static
   */
  Device.copyToClipboard = function(data) {
    var request = {
      method: 'PUT',
      url: '/clipboard',
      data: data
    };

    return new ApiMessage(request).send().then(function(response) {
      return;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });

  };

  /**
   * Send data outside the plugin using the device share UI.
   * @return {object} data - The data to share.
   * @static
   */
  Device.socialShare = function(data) {
    var request = {
      method: 'POST',
      url: '/share',
      data: data
    };

    return new ApiMessage(request).send().then(function(response) {
      return;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });

  };

  return Device;
});
