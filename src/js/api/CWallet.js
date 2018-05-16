'use strict';

angular.module('owsWalletPluginClient.api').factory('CWallet', function (lodash) {

  /**
   * CWallet
   *
   * Provides access to a wallet. An instance of this class should be obtained from the CSession instance.
   */

  /**
   * Constructor.  An instance of this class must be obtained from CSession.
   * @param {Object} wallet - An internal Wallet object.
   * @return {Object} An instance of CWallet.
   * @constructor
   */
  function CWallet(walletObj) {
    lodash.assign(this, walletObj);
  };

  return CWallet;
});
