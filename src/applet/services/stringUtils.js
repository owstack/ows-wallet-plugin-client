'use strict';

angular.module('owsWalletPluginClient.services').factory('stringUtils', function(
  /* @namespace owsWalletPluginClient.api */ Constants) {

	var root = {};

	root.float = function(val) {
		val = val + '';
	  return parseFloat(val.replace(/,/g,''));
	};

  // Return values are all strings regardless of specified 'num' type.
  //
  // return {
  //   input: unaltered value of 'num'
  //   entered: value of 'num' with fractional part clamped by decimals
  //   entered_u: clamped value of 'num' with units
  //   localized: localized number, no units
  //   localized_u: localized number with units
  // }
  root.format = function(num, currency, opts) {
    var decimals = Constants.currencyMap(currency, 'decimals') || opts.decimals;
    var symbol = Constants.currencyMap(currency, 'symbol');
    var isCrypto = Constants.currencyMap(currency, 'type') == 'crypto';

    var numStr = num + '';
    var enteredNum = numStr;

    opts = opts || {};
    opts.kind = opts.kind || 'currency';
    opts.language = opts.language || 'en';
    opts.noZeroDecimals = opts.noZeroDecimals || false;
    opts.symbol = opts.symbol || !isCrypto;

    if (typeof num == 'string') {
      // Make the string a positive number.
      num = root.float(num);
      numStr.replace('-', '');
    }

    // Use an english language string to detect presence of decimal.
    var hasFraction = enteredNum.indexOf('.') >= 0;
    if (opts.noZeroDecimals && !hasFraction) {
      decimals = 0;
    }

    switch (opts.kind) {
      case 'currency': return formatCurrency(); break;
      case 'percent': return formatPercent(); break;
    }

    function formatCurrency() {
      if (isCrypto) {
        numStr = Math.abs(num).toLocaleString(opts.language, {minimumFractionDigits: 0, maximumFractionDigits: decimals});
      } else {
        numStr = Math.abs(num).toLocaleString(opts.language, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
      }

      // Clamp the number of fractional digits to the currency decimals.
      var enteredNumD = enteredNum;
      if (hasFraction) {
        var fractionalPart = enteredNumD.substring(enteredNumD.indexOf('.')+1);
        var significantPart = enteredNumD.substring(0, enteredNumD.indexOf('.'));
        if (fractionalPart.length > decimals) {
          enteredNumD = root.float(significantPart).toLocaleString(opts.language) + '.' + fractionalPart.slice(0, decimals);
        }
      } else {
        enteredNumD = root.float(enteredNumD).toLocaleString(opts.language);
      }

      var entered_u_p = {
        sign: (num < 0 ? '-' : ''),
        symbol: (opts.symbol ? symbol : ''),
        number: enteredNumD,
        currency: (isCrypto && !opts.symbol ? ' ' + currency : '')
      };

      var localized_u_p = {
        sign: (num < 0 ? '-' : ''),
        symbol: (opts.symbol ? symbol : ''),
        number: numStr,
        currency: (isCrypto && !opts.symbol ? ' ' + currency : '')
      };

      return {
        input: enteredNum,
        entered: enteredNumD,
        entered_u: entered_u_p.sign + entered_u_p.symbol + entered_u_p.number + entered_u_p.currency,
        entered_u_p: entered_u_p,
        localized: localized_u_p.sign + localized_u_p.number,
        localized_u: localized_u_p.sign + localized_u_p.symbol + localized_u_p.number + localized_u_p.currency,
        localized_u_p: localized_u_p
      };
    };

    function formatPercent() {
      numStr = Math.abs(num).toLocaleString(opts.language, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
      return {
        input: enteredNum,
        entered: enteredNum,
        entered_u: (num < 0 ? '-' : '') + enteredNum + '%',
        localized: (num < 0 ? '-' : '') + numStr,
        localized_u: (num < 0 ? '-' : '') + numStr + '%'
      };
    };
  };

  // Trim a string to n (25 default) chars max.
  root.trim = function(str, opts) {
    if (!str || str.length == 0) {
      return;
    }

    opts = opts || {};
    opts.n = opts.n || 25;

    var pos = (opts.n - 3) / 2;

    if (str.length > opts.n) {
      str = str.slice(0, pos) + '...' + str.slice(-pos-1);
    }
    return str;
  };

	return root;
});
