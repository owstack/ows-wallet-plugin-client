'use strict';

angular.module('owsWalletPluginClient.api').factory('Wallet', function (lodash) {

  /**
   * Wallet
   *
   * Provides access to a wallet. An instance of this class should be obtained from the Session instance.
   *
   * Attributes with sample values.
   *
   * {
   *   id: 'c2976ddc-2baf-4bba-b42a-4160957e6cdb',
   *   network: 'livenet',
   *   currency: 'btc',
   *   m: 1,
   *   n: 1,
   *   name: 'Personal Wallet',
   *   needsBackup: true,
   *   balanceHidden: false,
   *   error: null,
   *   cachedBalance: '0.00 BTC',
   *   cachedBalanceUpdatedOn: 1526591574,
   *   cachedActivity: {
   *     n: [{
   *       version: '1.0.0',
   *       createdOn: 1526571580,
   *       id: '015265715808920000',
   *       type: 'NewBlock',
   *       data: {
   *         hash: '00000000000000000036818a14759da02bf3e59e8173cbc21ab3e9848ac89490',
   *         network: 'livenet'
   *       }
   *     }]
   *   }
   * }
   */

  /**
   * Constructor.  An instance of this class must be obtained from Session.
   * @param {Object} walletObj - An internal Wallet object.
   * @return {Object} An instance of Wallet.
   * @constructor
   */
  function Wallet(walletObj) {
    lodash.assign(this, walletObj);
    return this;
  };

  return Wallet;
});
