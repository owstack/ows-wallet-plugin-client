'use strict';

angular.module('owsWalletPluginClient.api').factory('Utils', function (rateService) {

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
   * Retrieve a currency exchange rate (vs. bitcoin price).
   * @param {String} code - The ISO currency code for exchange.
   * @return {Object} An instance of a service object.
   * @static
   */
  Utils.getRate = function(isoCode) {
    return rateService.getRate(isoCode);
  };

  return Utils;
});
