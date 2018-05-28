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

  return System;
});
