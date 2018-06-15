'use strict';

angular.module('owsWalletPluginClient.api').factory('Settings', function ($log, lodash, ApiMessage) {

  /**
   * Settings
   *
   * Provides app settings selected by the user.
   *
   * {
   *   language: {String} The two digit language code (e.g., 'en').
   *   defaultNetwork: {String} Key into networks specifying the default network (e.g., 'livenet/btc').
   *   networks: {
   *     alternativeIsoCode: {String} The three digit ISO currency code for this network (e.g., 'USD').
   *     alternativeIsoName: {String} The long form name of the alternative currency for this network (e.g., 'US Dollar').
   *     atomicUnitCode: {String} The unit code (name) for this networks smallest unit (e.g., 'satoshi').
   *     feeLevel: {String} The user selected fee level for this network (e.g., 'normal').
   *     unitCode: {String} The unit code identifying this networks standard currency; always lowercase (e.g., 'btc').
   *     unitName: {String} The displayable name of the currency unit associated with balance, etc.
   *     unitDecimals: {Number} The number of places to the right of the standard unit (e.g. USD=2, BTC=8).
   *     unitToAtomicUnit: {Number} The multilier for converting this networks standard unit to this networks atomic unit (e.g. USD=100, BTC=10000000).
   *   }
   * }
   *
   * The networks are identified using a 'network URI' object key with the form <network-type>/<unit-currency-code>.
   * The network-type is discernable from the key.
   *
   * Examples:
   *
   *   'livenet/btc' - The Bitcoin livenet
   *   'testnet/btc' - The Bitcoin testnet
   *   'livenet/bch' - The Bitcoin Cash livenet
   *   'livenet/ltc' - The Litecoin livenet
   */

  /**
   * Constructor.
   * @constructor
   */
  function Settings() {
    throw new Error('Settings is a static class');
  };

  /**
   * Retrieve settings.
   * @return {Object} The app settings.
   */
  Settings.get = function() {
    var request = {
      method: 'GET',
      url: '/settings',
      responseObj: {}
    };

    return new ApiMessage(request).send().then(function(response) {
      lodash.assign(Settings, response);
      return Settings;

    }).catch(function(error) {
      $log.error('Settings.get(): ' + error.message + ', detail:' + error.detail);
      throw new Error(error.message);
      
    });
  };

  return Settings;
});
