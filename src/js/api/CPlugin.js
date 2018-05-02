'use strict';

angular.module('owsWalletPluginClient.api').factory('CPlugin', function ($log, CSystem) {

  /**
   * CPlugin
   *
   * This class provides access to plugin information.
   */

  /**
   * PluginObject
   * ------------
   * 
   * Plugins are registered during the application build process.  Each plugin is represented as a
   * plugin catalog entry and defines properties as follows.
   *
   * Properties shared by all plugins.
   *
   *   {String} kind - The type of plugin, 'applet' or 'service'.
   *   {String} id - The unique plugin identifier.
   *   {String} name - Human readable name of the plugin.
   *   {String} description - A short description of the plugin.
   *   {String} author - The author of the plugin.
   *   {String} version - A version identfier for the plugin (typ. 'x.y.z').
   * 
   * Applet specific plugin properties.
   * 
   *   {String} mainView - The relative path to the applet main view.
   *   {String} uri - The relative path to the applet root location.
   *
   * Service specific plugin properties.
   * 
   *   {String} serviceApi - The class name of the plugin API (use to create an instance of the plugin).
   */

  /**
   * Constructor.
   * @return {Object} An instance of CPlugin.
   * @constructor
   */
  function CPlugin() {
    return this;
  };

  /**
   * Return the plugin catalog entry for the specified plugin id.
   * @param {String} id - The plugin id that identifies a plugin.
   * @return {PluginObject} An instance of a plugin object.
   * @throws Will throw an error if no plugin entry was found.
   * @static
   */
  CPlugin.getCatalogEntry = function(id) {
    var request = {
     method: 'GET',
     url: '/plugin-catalog?id=' + id
    }
    return pluginClientService.sendMessage(request);
  };

  /**
   * Validate that the specified service description object contains all required properties.
   * @param {String} serviceDesc - A service description object specified in a skin.
   * @param {Array} requiredProperties - An array of required properties; e.g., ['.a','.b','.b.c'].
   * @param {String} id - The plugin id of the requestor.
   * @throws Will throw an error if serviceDesc is missing any required properties.
   * @static
   */
  CPlugin.validateServiceDesc = function(serviceDesc, requiredProperties, id) {
    var result = CSystem.checkObject(serviceDesc, requiredProperties);
    if (result.missing.length > 0) {
      throw new Error('A skin with service plugin \'' + pluginId + '\' is missing required properties \'' + result.missing.toString() + '\'');
    }
    if (result.other.length > 0) {
      $log.warn('A skin with service plugin \'' + pluginId + '\' has unrecognized properties \'' + result.other.toString() + '\'');
    }
  };

  return CPlugin;
});
