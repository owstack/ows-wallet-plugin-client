'use strict';

angular.module('owsWalletPluginClient.api').factory('App', function ($log, lodash, ApiMessage) {

  /**
   * App
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
   * @return {Object} An instance of App.
   * @constructor
   */
  function App() {
    return this;
  };

  /**
   * Retrieve app information.
   * @return {Object} The app information.
   */
  App.prototype.get = function() {
    var self = this;
    var request = {
      method: 'GET',
      url: '/app',
      responseObj: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      lodash.assign(self, response);
      return self;

    }).catch(function(error) {
      $log.error('App.get(): ' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
    });
  };

  return App;
});
