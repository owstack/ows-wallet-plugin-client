'use strict';

angular.module('owsWalletPluginClient.api').factory('CUtils', function (rateService) {

  /**
   * CUtils
   *
   * This class provides business level utilities.
   */

  /**
   * Constructor.
   * @return {CUtils} An instance of CUtils.
   * @constructor
   */
  function CUtils() {
    return this;
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
