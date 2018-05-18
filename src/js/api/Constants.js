'use strict';

angular.module('owsWalletPluginClient.api').factory('Contants', function () {

  /**
   * Contantsants
   *
   * Provides commonly used constant values.
   */

  /**
   * Constructor.
   * @constructor
   */
  function Contants() {
    throw new Error('Contants is a static class');
  };

  Contants.BITS_PER_BTC = 1e6;
  Contants.SATOSHI_PER_BTC = 1e8;

  return Contants;
});
