'use strict';

angular.module('owsWalletPluginClient.api').factory('BN', function () {

  /**
   * BN
   *
   * Provides a wrapper for big.js.
   */

  const zero = new Big('0');
  const one = new Big('1');

  /**
   * Constructor.
   * @constructor
   */
  function BN() {
    throw new Error('BN is a static class');
  };

  BN.ensure = function (value) {
    if (!(value instanceof Big)) {
      if (typeof value == 'string') {
        value = value.replace(/,/g, '');
      }
      return BN.make(value);
    } else {
      return value;
    }
  };

  BN.make = function (value) {
    return new Big(value);
  };

  BN.add = function (a, b) {
    return BN.ensure(a).plus(BN.ensure(b));
  };

  BN.minus = function (a, b) {
    return BN.ensure(a).minus(BN.ensure(b));
  };

  BN.multiply = function (a, b) {
    return BN.ensure(a).times(BN.ensure(b));
  };

  BN.div = function (a, b) {
    return BN.ensure(a).div(BN.ensure(b));
  };

  BN.sum = function (values) {
    return values.reduce(function (current, value) {
      return BN.ensure(current).plus(BN.ensure(value));
    }, zero);
  };

  BN.product = function (values) {
      return values.reduce(function (current, value) {
          return BN.ensure(current).times(BN.ensure(value));
      }, one);
  };

  return BN;
});
