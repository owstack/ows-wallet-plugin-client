'use strict';

angular.module('owsWalletPluginClient.api').factory('System', function (lodash) {

  /**
   * System
   *
   * Provides general purpose system utilities.
   */

  /**
   * Constructor.
   * @constructor
   */
  function System() {
    throw new Error('System is a static class');
  };

  /**
   * Return whether or not the specified object has all required properties.
   * @return {Object} An array of missing properties.
   * @static
   */
  System.checkRequired = function(required, obj) {
    var missing = [];
    lodash.forEach(required, function(param) {
      if (lodash.get(obj, param, undefined) == undefined) {
        missing.push(param);
      }
    });
    return missing;
  };

  /**
   * Return the value of a URL parameter by name.
   * @return {string | undefined} The value of the parameter, null if parameter not found in URL.
   * @static
   */
  System.getUrlParameterByName = function(name, url) {
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

  return System;
});
