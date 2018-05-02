'use strict';

angular.module('owsWalletPluginClient.api').factory('CConst', function () {

  /**
   * CConstants
   *
   * This class provides commonly used constant values.
   */

  /**
   * Constructor.
   * @return {CConst} An instance of CConst.
   * @constructor
   */
  function CConst() {
    return this;
  };

  CConst.BITS_PER_BTC = 1e6;
  CConst.SATOSHI_PER_BTC = 1e8;

  return CConst;
});
