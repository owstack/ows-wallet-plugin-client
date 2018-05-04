'use strict';

angular.module('owsWalletPluginClient.api').factory('CConst', function () {

  /**
   * CConstants
   *
   * Provides commonly used constant values.
   */

  /**
   * Constructor.
   * @constructor
   */
  function CConst() {
    throw new Error('CConst is a static class');
  };

  CConst.BITS_PER_BTC = 1e6;
  CConst.SATOSHI_PER_BTC = 1e8;

  return CConst;
});
