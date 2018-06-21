'use strict';

angular.module('owsWalletPluginClient.api').factory('Utils', function (lodash, Session) {

  /**
   * Utils
   *
   * Provides domain utilities.
   */

  /**
   * Constructor.
   * @constructor
   */
  function Utils() {
    throw new Error('Utils is a static class');
  };


  /**
   * Return whether or not the specified object has all required properties.
   * @return {Object} An array of missing properties.
   * @static
   */
  Utils.checkRequired = function(required, obj) {
    var missing = [];
    lodash.forEach(required, function(property) {
      if (lodash.get(obj, property, undefined) == undefined) {
        missing.push(property);
      }
    });
    return missing;
  };

  /**
   * Assigns destObj the object properties of srcObj according to properties. Properties is an array of strings
   * naming each property on srcObj. Deep property names may be specified, exmaple 'a.b'. Unresolved properties
   * on srcObj are undefined on destObj. This function mutates destObj.
   * @return {Object} The desination object.
   * @static
   */
  Utils.assign = function(destObj, srcObj, properties) {
    lodash.forEach(properties, function(property) {
      lodash.set(destObj, property, lodash.get(srcObj, property, undefined));
    });
    return destObj;
  };

  Utils.assign = function(destObj, srcObj, propertyMap) {
    lodash.forEach(Object.keys(propertyMap), function(property) {

      if (typeof propertyMap[property] == 'string') {
        lodash.set(destObj, propertyMap[property], lodash.get(srcObj, property, undefined));

      } else {
        var destProperty = propertyMap[property].property;
        var destType = propertyMap[property].type;
        var srcValue = lodash.get(srcObj, property, undefined);
        var value;

        switch (destType) {
          case 'date': 
            value = new Date(srcValue);
            break;

          case 'float':
            value = parseFloat(srcValue);
            break;

          case 'map':
            var map = propertyMap[property].map;
            value = map[srcValue];
            break;
        }

        lodash.set(destObj, destProperty, value);
      }

    });
    return destObj;
  };

  /**
   * Return the configuration of a dependent plugin.
   * @param {String} pluginId - The id of the dependent plugin.
   * @return {String} The properly formed API root.
   * @static
   */
  Utils.getApiRoot = function(pluginId) {
    return '/' + pluginId;
  };

  /**
   * Return the configuration of a dependent plugin.
   * @param {String} pluginId - The id of the dependent plugin.
   * @param {String} configId - The configuration id.
   * @return {Object} The plugin configuration.
   * @static
   */
  Utils.getDependentPluginConfig = function(pluginId, configId) {
    var config = Session.getInstance().plugin.dependencies[pluginId][configId];
    if (!config) {
      throw new Error('Could not get dependant plugin configuration, check plugin.json');
    }
    return config;
  };

  /**
   * Return the value of a URL parameter by name.
   * @return {String | undefined} The value of the parameter, null if parameter not found in URL.
   * @static
   */
  Utils.getUrlParameterByName = function(name, url) {
    if (!url) {
      return undefined;
    }
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) {
      return undefined;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  return Utils;
});
