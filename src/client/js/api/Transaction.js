'use strict';

angular.module('owsWalletPluginClient.api').factory('Transaction', function (lodash, $log, ApiMessage) {

  /**
   * Transaction
   *
   * Provides the interface to a host created wallet transaction.
   */

  /**
   * Constructor.
   * @return {Transaction} An instance of Transaction.
   * @constructor
   *
   * To create a Transaction requires the following.
   *
   *   - (A) walletId & urlOrAddress OR
   *   - (B) walletId & urlOrAddress & amount OR
   *   - (C) walletId & urlOrAddress & userSendMax
   *
   * (A) Pay to a network payment request URL from the wallet. The urlOrAddress must resolve to an address and amount.
   *
   * txObj = {
   *   walletId: <String>,
   *   urlOrAddress: <String>
   * };
   *
   * (B) Pay the amount to the address from the wallet.
   *
   * txObj = {
   *   walletId: <String>,
   *   urlOrAddress: <String>,
   *   amount: <Number>
   * };
   *
   * (C) Pay the wallet's whole balance to the address from the wallet.
   *
   * txObj = {
   *   walletId: <String>,
   *   urlOrAddress: <String>,
   *   useSendMax: <boolean>
   * };
   *
   */
  function Transaction(txObj) {
    lodash.assign(this, txObj);

    var request = {
      method: 'POST',
      url: '/transactions',
      data: {
        walletId: this.walletId,
        urlOrAddress: this.urlOrAddress,
        amount: this.amount,
        useSendMax: this.useSendMax
      }
    }

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      $log.error('Transaction.create():' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
    });

    return this;
  };

  /**
   * Set the wallet for the transaction.
   * @return {Promise} A promise at completion.
   */
  Transaction.prototype.setFee = function(level, rate, isCustomRate) {
    var request = {
      method: 'PUT',
      url: '/transactions/' + this.guid + '/wallet/' + this.walletId,
      data: {
        fee: {
          level: level,
          rate: rate,
          isCustomRate: isCustomRate
        }
      }
    }

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      $log.error('Transaction.setWallet():' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
    });
  };

  /**
   * Set the wallet for the transaction.
   * @return {Promise} A promise at completion.
   */
  Transaction.prototype.setWallet = function(walletId) {
    var request = {
      method: 'PUT',
      url: '/transactions/' + this.guid + '/wallet/' + this.walletId,
      data: {
        walletId: walletId
      }
    }

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      $log.error('Transaction.setWallet():' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
    });
  };

  /**
   * Send a transaction.
   * @return {Promise} A promise at completion.
   */
  Transaction.prototype.send = function() {
    var request = {
      method: 'PUT',
      url: '/transactions/' + this.guid,
      data: {
        status: 'approve'
      }
    }

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      $log.error('Transaction.send():' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
    });
  };

  /**
   * Cancel a transaction.
   * @return {Promise} A promise at completion.
   */
  Transaction.prototype.cancel = function() {
    var request = {
      method: 'PUT',
      url: '/transactions/' + this.guid,
      data: {
        status: 'denied'
      }
    }

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      $log.error('Transaction.cancel():' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
    });
  };

  return Transaction;
});
