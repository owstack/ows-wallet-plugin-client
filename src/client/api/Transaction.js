'use strict';

angular.module('owsWalletPluginClient.api').factory('Transaction', function (lodash, ApiMessage,
  /* @namespace owsWalletPluginClient.api */ ApiError) {

  /**
   * Transaction
   *
   * Provides the interface to a host created wallet transaction.
   */

  /**
   * Constructor.
   * @param {String} walletId - The id of the wallet in which the transaction will be created.
   * @param {String} urlOrAddress - The URL (typically a payment protocol endoint) or cryptocurrency address for the payment destination.
   * @param {Number} amount - The amount to send, less fees.
   * @param {boolean} useSendMax - If true then the amount to send is calculated based on the wallet balance, balance at tx input assignments, and network fee.
   * @param {String} useSendMax - If true then the amount to send is calculated based on the wallet balance, balance at tx input assignments, and network fee.
   * @param {String} description (optional) - A transaction description.
   * @return {Transaction} An instance of Transaction.
   * @constructor
   *
   * To create a Transaction requires the following.
   *
   *   - (A) walletId & urlOrAddress OR
   *   - (B) walletId & urlOrAddress & amount OR
   *   - (C) walletId & urlOrAddress & useSendMax
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
        useSendMax: this.useSendMax,
        description: this.description || ''
      }
    };

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });

    return this;
  };

  /**
   * Set the fee for the transaction.
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
    };

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      throw new ApiError(error);
      
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
    };

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      throw new ApiError(error);
      
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
        status: 'approved'
      }
    };

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      throw new ApiError(error);
      
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
    };

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  return Transaction;
});
