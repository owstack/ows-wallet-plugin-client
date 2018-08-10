'use strict';

angular.module('owsWalletPluginClient.api').factory('Host', function (lodash, ApiMessage,
  /* @namespace owsWalletPluginClient.api */ ApiError) {

  /**
   * Host
   *
   * Provides information about the host app.
   *
   * {
   *   version: {string} The app version.
   *   nameCase: {string} The name.
   *   description: {string} A description.
   *   author: {string} The author.
   *   url: {string} The marketing URL.
   *   downloadUrl: {string} The URL where the app can be downloaded.
   *   appleStoreUrl: {string} The URL for the app in the Apple App Store.
   *   googleStoreUrl: {string} The URL for the app in the Google Play Store.
   *   supportEmail: {string} The support URL.
   *   disclaimerUrl: {string} The disclaimer URL.
   *   gitHubRepoUrl: {string} The GitHub repository URL.
   *   gitHubRepoBugs: {string} The GitHub issues URL.
   *   gitHubRepoApiLatestReleases: {string} The GitHub URL where latest app releases are found.
   * }
   */

  /**
   * Constructor.
   * @constructor
   */
  function Host() {
    throw new ApiError({
      message: 'IMPLEMENATION_ERROR',
      detail: 'Host is a static class'
    });
  };

  /**
   * Retrieve app information.
   * @return {Object} The app information.
   */
  Host.get = function() {
    var request = {
      method: 'GET',
      url: '/info/host'
    };

    return new ApiMessage(request).send().then(function(response) {
      lodash.assign(Host, response.data);
      return Host;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  return Host;
});
