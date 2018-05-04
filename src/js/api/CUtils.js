'use strict';

angular.module('owsWalletPluginClient.api').factory('CUtils', function (rateService) {

  /**
   * CUtils
   *
   * Provides domain utilities.
   */

  /**
   * Constructor.
   * @constructor
   */
  function CUtils() {
    throw new Error('CUtils is a static class');
  };

  /**
   * Retrieve a currency exchange rate (vs. bitcoin price).
   * @param {String} code - The ISO currency code for exchange.
   * @return {Object} An instance of a service object.
   * @static
   */
  CUtils.getRate = function(isoCode) {
    return rateService.getRate(isoCode);
  };

  return CUtils;
});
