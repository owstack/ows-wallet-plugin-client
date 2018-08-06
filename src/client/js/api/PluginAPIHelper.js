'use strict';

angular.module('owsWalletPluginClient.api').factory('PluginApiHelper', function (
  /* @namespace owsWalletPluginClient.api */ Session) {

  /**
   * PluginApiHelper
   *
   * Provides plugin API help.
   */

  /**
   * Constructor.
   * @param {Object} plugin - A minimal plugin object providing only the plugin id.
   * @constructor
   */
  function PluginApiHelper(plugin) {
    this.plugin = plugin;

    /**
     * Public functions
     */

    // Return a properly formed API root of the specifed plugin.
    this.apiRoot = function() {
      return '/' + this.plugin.id;
    };

    // Return the user configuration of the plugin.
    this.getConfig = function(configId) {
      // If no configId specified then use 'default'.
      configId = configId || 'default';

      var config = {};
      var session = Session.getInstance();

      if (session.plugin.userConfig &&
        session.plugin.userConfig[this.plugin.id] &&
        session.plugin.userConfig[this.plugin.id][configId]) {

        config = session.plugin.userConfig[this.plugin.id][configId];
      }
      return config;
    };

    return this;
  };

    return PluginApiHelper;
});
