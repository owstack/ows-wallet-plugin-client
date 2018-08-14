'use strict';

angular.module('owsWalletPluginClient.api').factory('Wallet', function (lodash, ApiMessage, $filter, gettextCatalog, stringUtils,
  /* @namespace owsWalletPluginClient.api */ ApiError,
  /* @namespace owsWalletPluginClient.api */ Utils) {

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
   *   keyDerivationOk: true,
   *   error: null,
   *   isValid: true,
   *   color: '#ff0000',
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
  var propertyMap = {
    'id': 'id',
    'network': 'network',
    'currency': {property: 'currency', transform: function(value) { return value.toUpperCase(); }},
    'm': 'm',
    'n': 'n',
    'name': 'name',
    'needsBackup': 'needsBackup',
    'balanceHidden': 'balanceHidden',
    'keyDerivationOk': 'keyDerivationOk',
    'error': 'error',
    'isValid': 'isValid',
    'color': 'color',
    'cachedBalance': 'cachedBalance',
    'cachedBalanceUpdatedOn': 'cachedBalanceUpdatedOn',
    'cachedActivity': 'cachedActivity',
    'transactions': 'transactions'
  };

  /**
   * Constructor.  An instance of this class must be obtained from Session.
   * @param {Object} walletObj - An internal Wallet object.
   * @return {Object} An instance of Wallet.
   * @constructor
   */
  function Wallet(walletObj) {
    var self = this;
    Utils.assign(this, walletObj, propertyMap);

    this.getTransactions();

    return this;
  };

  /**
   * Get an address for this wallet.
   * @return {String} An address.
   */
  Wallet.prototype.getAddress = function() {
    var self = this;
    var request = {
      method: 'GET',
      url: '/wallet/' + this.id + '/address',
      opts: {
        timeout: -1
      }
    };

    return new ApiMessage(request).send().then(function(response) {
      return response.data;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  /**
   * Get the fee to send a transaction.
   * @param {string} level - The fee level.
   * @return {Object} Fee amount per kb expressed in both atomic and standard units.
   *
   * return = {
   *   atomic: <number>,
   *   standard: <number> 
   * }
   */
  Wallet.prototype.getFee = function(level) {
    var self = this;
    var request = {
      method: 'GET',
      url: '/wallet/' + this.id + '/fee/' + level,
      opts: {
        timeout: -1
      }
    };

    return new ApiMessage(request).send().then(function(response) {
      return response.data;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  /**
   * Get this wallet transaction history from the host app.
   * @param {string} txId [optional] - A transaction id (hash). If not specified then complete wallet tx history is returned.
   * @return {Array} One or a collection of transactions.
   */
  Wallet.prototype.getTransactions = function(txId) {
    var self = this;
    var request = {
      method: 'GET',
      url: '/wallet/' + this.id + '/transactions/' + txId,
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
