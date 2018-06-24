'use strict';

angular.module('owsWalletPluginClient.api').factory('Device', function ($log, ApiMessage) {

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
    throw new Error('Device is a static class');
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
      $log.error('Device.copyToClipboard(): ' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
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
      $log.error('Device.socialShare(): ' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
    });

  };

  return Device;
});
