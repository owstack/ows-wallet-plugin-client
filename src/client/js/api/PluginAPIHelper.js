'use strict';

angular.module('owsWalletPluginClient.api').factory('PluginAPIHelper', function (
  /* @namespace owsWalletPluginClient.api */ Session) {

  /**
   * PluginAPIHelper
   *
   * Provides plugin API help.
   */

  /**
   * Constructor.
   * @param {Object} plugin - A minimal plugin object providing only the plugin id.
   * @constructor
   */
  function PluginAPIHelper(plugin) {
    this.plugin = plugin;

    /**
     * Public functions
     */

    // Return a properly formed API root of the specifed plugin.
    this.apiRoot = function() {
      return '/' + this.plugin.id;
    };

    // Return the configuration of the specified dependent plugin.
    this.getConfig = function(configId) {
      var config = Session.getInstance().plugin.dependencies[this.plugin.id][configId];
      if (!config) {
        throw new Error('Could not get dependant plugin configuration, check plugin.json');
      }
      return config;
    };

    return this;
  };

    return PluginAPIHelper;
});
