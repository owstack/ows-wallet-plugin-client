'use strict';

angular.module('owsWalletPluginClient.api').factory('Wallet', function (lodash, ApiMessage, $filter, gettextCatalog, stringUtils,
  /* @namespace owsWalletPluginClient.api */ ApiError) {

  /**
   * Wallet
   *
   * Provides access to a wallet. An instance of this class should be obtained from the Session instance.
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
   *   },
   *   transactions: [tx]
   * }
   *
   * where, 
   *
   * tx = {
   *   txid: 'f1d1e4f748d159634c120400f18ae1d18a4c73abd29bf01befc1b8526eb22aac',
   *   action: 'moved',
   *   amount: 100000000,
   *   fees: 19440,
   *   time: 1533740853,
   *   addressTo: 'N/A',
   *   confirmations: 18,
   *   feePerKb: 86018,
   *   outputs: [{
   *     amount: 100000000,
   *     address: 'mga9WH78KVxiq6r5DD1S6RKmeAbBpjF9Px',
   *     message: null,
   *     encryptedMessage: null,
   *     amountStr: '1.00 BTC',
   *     alternativeAmountStr: '6,481.36 USD'
   *   }],
   *   createdOn: 1533740831,
   *   proposalId: '123201cf-9969-4520-ace4-182f5479b03e',
   *   creatorName: 'me',
   *   message: null,
   *   actions: [{
   *     createdOn: 1533740832,
   *     type: 'accept',
   *     copayerId: '4cba217ceb47af44cc3af82825f2375a43a31794be3b7b7aad9b62fbc1b7729b',
   *     copayerName: 'me',
   *     comment: ''
   *   }],
   *   customData: null,
   *   encryptedMessage: null,
   *   hasUnconfirmedInputs: false,
   *   amountStr: '1.00 BTC',
   *   alternativeAmountStr: '6,481.36 USD',
   *   feeStr: '0.000194 BTC',
   *   amountValueStr: '1.00',
   *   amountAtomicStr: 'BTC',
   *   safeConfirmed: '6+'
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

    this.getTransactions();

    return this;
  };

  /**
   * Get this wallet transaction history from the host app.
   * @return {Array} A collection of transactions.
   */
  Wallet.prototype.getTransactions = function() {
    var self = this;
    var request = {
      method: 'GET',
      url: '/wallet/' + this.id + '/transactions',
      opts: {
        timeout: -1
      }
    };

    return new ApiMessage(request).send().then(function(response) {
      self.transactions = response.data;
      return self.transactions;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  Wallet.prototype.format = function() {
    var balance = '';
    var balanceAlternative = '';

    if (this.balanceHidden) {
      balance = gettextCatalog.getString('Balance Hidden');

    } else if (this.status) {
      balance = stringUtils.format(this.status.totalBalanceValueStr, this.status.totalBalanceUnitStr).localized_u;
      balanceAlternative = stringUtils.format(this.status.totalBalanceAlternative, this.status.alternativeIsoCode).localized_u;

    } else if (!this.status && this.cachedBalance) {
      balance = this.cachedBalance;

      if (this.cachedBalanceUpdatedOn) {
        balanceAlternative = gettextCatalog.getString('as of') + ' ' + $filter('amTimeAgo')(this.cachedBalanceUpdatedOn  * 1000);
      }
    }

    return {
      balance: balance,
      balanceAlternative: balanceAlternative
    }
  };

  return Wallet;
});
