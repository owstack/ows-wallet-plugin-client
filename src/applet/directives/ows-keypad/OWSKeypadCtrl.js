'use strict';

angular.module('owsWalletPluginClient.controllers').controller('OWSKeypadCtrl', function($rootScope, $scope, $timeout, $log, lodash, stringUtils,
  /* @namespace owsWalletPluginClient.api */ BN,
  /* @namespace owsWalletPluginClient.api */ Constants) {

  var language = 'en';
  var lengthExpressionLimit = 9;
  var placeholder = false;
  var value = { entered: 0 };

  var currencies = [];
  var currencyIndex = 0;

  var usdRates;
  var currencyToggleCache = {};

  $scope.$watch('config', function(config, oldConfig) {
    if (config != oldConfig && config.length > 0) {
      config = JSON.parse(config);
      var previousCurrencyIndex = currencyIndex;

      language = config.language || language;
      lengthExpressionLimit = config.lengthExpressionLimit || lengthExpressionLimit;
      usdRates = config.usdRates || usdRates;
      currencies = config.currencies || currencies;

      if (config.value) {
        // Reject if value currency is not configured on keypad.
        if (currencies.indexOf(config.value.currency) < 0) {
          return $log.error('Keypad not configured for currency \'' + config.value.currency +'\'');
        }

        // Handle value change.
        if (config.value.currency == currencies[currencyIndex]) {
          // Value currency is same as current keypad currency, just apply the value.
          value.entered = config.value.amount;

        } else {
          // Value currency is different than the current keypad currency, compute value through
          // USD exchange rate.
          var usdValue = BN.div(config.value.amount, usdRates[config.value.currency]);
          value.entered = BN.multiply(usdValue, usdRates[currencies[currencyIndex]]);
        }
        clearCurrencyCache();

      } else {

        // Handle currency change.
        if (typeof config.currencyIndex == 'number' || config.currencyIndex == undefined) {
          currencyIndex = (config.currencyIndex != undefined ? config.currencyIndex : currencyIndex);
        }

        if (currencies.length > 1) {
          if (!usdRates) {
            return; // Cannot do anything without rates.
          }

          // Apply a currency conversion if the currency is changed.
          if (currencyIndex != previousCurrencyIndex) {

            currencyToggleCache[currencies[previousCurrencyIndex]] = {
              value: value.entered,
              placeholder: placeholder
            };

            var cacheEntry = currencyToggleCache[currencies[currencyIndex]];
            if (cacheEntry) {
              value.entered = cacheEntry.value;
              placeholder = cacheEntry.placeholder;

            } else {
              // Compute value through USD exchange rate.
              var usdValue = BN.div(value.entered, usdRates[currencies[previousCurrencyIndex]]);
              value.entered = BN.multiply(usdValue, usdRates[currencies[currencyIndex]]);
              placeholder = false;
            }
          }
        }
      }

      update();
    }
  });

  function clearCurrencyCache() {
    currencyToggleCache = {};
  };

  function update() {
    var formatOpts = {
      language: language,
      isCrypto: Constants.isCryptoCurrency(currencies[currencyIndex]),
      noZeroDecimals: true
    };
    value = stringUtils.format(value.entered, currencies[currencyIndex], formatOpts);

    var valueHtml =
      value.entered_u_p.sign +
      value.entered_u_p.symbol +
      value.entered_u_p.number.slice(0,-1) +
      '<span class="' + (placeholder ? 'placeholder' : '') + '">' + value.entered_u_p.number.slice(-1) + '</span>' +
      value.entered_u_p.currency;

    $timeout(function() {
      $scope.$apply();
    });

    $rootScope.$emit('Local/KeypadState', {
      lengthExpressionLimit: lengthExpressionLimit,
      currency: currencies[currencyIndex],
      nextCurrency: currencies[(currencyIndex+1 >= currencies.length ? 0 : currencyIndex+1)],
      nextCurrencyIndex: (currencyIndex+1 >= currencies.length ? 0 : currencyIndex+1),
      amount: stringUtils.float(value.entered),
      amountHtml: valueHtml,
      placeholder: placeholder
    });
  };

  $scope.pushDigit = function(digit) {
    var entered = value.entered;

    if (digit != '.' && entered.indexOf('.') < 0 && entered.length >= lengthExpressionLimit) {
      return;

    } else if (entered.indexOf('.') > -1 && digit == '.') {
      return;

    } else if (entered == '0' && placeholder && digit == '0') {
      placeholder = false;

    } else if (entered == '0' && !placeholder && digit == '0') {
      return;

    } else if (entered == '0' && !placeholder && digit == '.') {
      entered = '0.0';
      placeholder = true;

    } else if (entered == '0' && placeholder && digit == '.') {
      entered = '0.0';

    } else if (entered == '0' && placeholder) {
      entered = digit;
      placeholder = false;

    } else if (entered == '0' && !placeholder) {
      entered = digit;

    } else if (entered == '0.0' && placeholder) {
      entered = '0.' + digit;
      placeholder = false;

    } else if (digit == '.') {
      entered += '.0';
      placeholder = true;

    } else if (placeholder) {
      entered = entered.slice(0, -1) + digit;
      placeholder = false;

    } else {
      entered += digit;
      placeholder = false;
    }

    value.entered = entered;
    update();
    clearCurrencyCache();
  };

  $scope.removeDigit = function() {
    var entered = value.entered;

    if (entered == '0' && placeholder) {
      return;

    } else if (entered == '0' && !placeholder) {
      placeholder = true;

    } else if (entered.length == 1 && placeholder) {
      entered = '0';
      placeholder = true;

    } else if (entered == '0.0' && placeholder) {
      entered = '0';

    } else if (entered.slice(-2) == '.0' && placeholder) {
      entered = entered.slice(0, -2);
      placeholder = false;

    } else if (entered.slice(-2, -1) == '.' && !placeholder) {
      entered = entered.slice(0,-1) + '0';
      placeholder = true;

    } else {
      entered = entered.slice(0, -1) || '0';
    }

    value.entered = entered;
    update();
    clearCurrencyCache();
  };

});
