'use strict';

angular.module('owsWalletPluginClient.api').factory('Constants', function () {

  /**
   * Constants
   *
   * Provides commonly used constant values.
   */

  /**
   * Constructor.
   * @constructor
   */
  function Constants() {
    throw new Error('Constants is a static class');
  };

  Constants.BITS_PER_BTC = 1e6;
  Constants.SATOSHI_PER_BTC = 1e8;

  Constants.currencyMap = function(currencyCode, property) {
    if (typeof currencyCode !== 'string') {
      return undefined;
    }
    var code = currencyCode.toUpperCase();

    if (!currencyMap.hasOwnProperty(code)){
      return undefined;
    }
    return currencyMap[code][property];
  };

  Constants.isCryptoCurrency = function(currencyCode) {
    return Constants.currencyMap(currencyCode, 'type') == 'crypto';
  };

  const currencyMap = {
    'AED': { symbol: 'د.إ', decimals: 2, type: 'fiat' },
    'AFN': { symbol: '؋', decimals: 2, type: 'fiat' },
    'ALL': { symbol: 'L', decimals: 2, type: 'fiat' },
    'AMD': { symbol: '֏', decimals: 2, type: 'fiat' },
    'ANG': { symbol: 'ƒ', decimals: 2, type: 'fiat' },
    'AOA': { symbol: 'Kz', decimals: 2, type: 'fiat' },
    'ARS': { symbol: '$', decimals: 2, type: 'fiat' },
    'AUD': { symbol: '$', decimals: 2, type: 'fiat' },
    'AWG': { symbol: 'ƒ', decimals: 2, type: 'fiat' },
    'AZN': { symbol: '₼', decimals: 2, type: 'fiat' },
    'BAM': { symbol: 'KM', decimals: 2, type: 'fiat' },
    'BBD': { symbol: '$', decimals: 2, type: 'fiat' },
    'BCH': { symbol: '฿', decimals: 8, type: 'crypto' },
    'BDT': { symbol: '৳', decimals: 2, type: 'fiat' },
    'BGN': { symbol: 'лв', decimals: 2, type: 'fiat' },
    'BHD': { symbol: '.د.ب', decimals: 2, type: 'fiat' },
    'BIF': { symbol: 'FBu', decimals: 2, type: 'fiat' },
    'BMD': { symbol: '$', decimals: 2, type: 'fiat' },
    'BND': { symbol: '$', decimals: 2, type: 'fiat' },
    'BOB': { symbol: '$b', decimals: 2, type: 'fiat' },
    'BRL': { symbol: 'R$', decimals: 2, type: 'fiat' },
    'BSD': { symbol: '$', decimals: 2, type: 'fiat' },
    'BTC': { symbol: '฿', decimals: 8, type: 'crypto' },
    'BTN': { symbol: 'Nu.', decimals: 2, type: 'fiat' },
    'BWP': { symbol: 'P', decimals: 2, type: 'fiat' },
    'BYR': { symbol: 'Br', decimals: 2, type: 'fiat' },
    'BYN': { symbol: 'Br', decimals: 2, type: 'fiat' },
    'BZD': { symbol: 'BZ$', decimals: 2, type: 'fiat' },
    'CAD': { symbol: '$', decimals: 2, type: 'fiat' },
    'CDF': { symbol: 'FC', decimals: 2, type: 'fiat' },
    'CHF': { symbol: 'CHF', decimals: 2, type: 'fiat' },
    'CLP': { symbol: '$', decimals: 2, type: 'fiat' },
    'CNY': { symbol: '¥', decimals: 2, type: 'fiat' },
    'COP': { symbol: '$', decimals: 2, type: 'fiat' },
    'CRC': { symbol: '₡', decimals: 2, type: 'fiat' },
    'CUC': { symbol: '$', decimals: 2, type: 'fiat' },
    'CUP': { symbol: '₱', decimals: 2, type: 'fiat' },
    'CVE': { symbol: '$', decimals: 2, type: 'fiat' },
    'CZK': { symbol: 'Kč', decimals: 2, type: 'fiat' },
    'DJF': { symbol: 'Fdj', decimals: 2, type: 'fiat' },
    'DKK': { symbol: 'kr', decimals: 2, type: 'fiat' },
    'DOP': { symbol: 'RD$', decimals: 2, type: 'fiat' },
    'DZD': { symbol: 'دج', decimals: 2, type: 'fiat' },
    'EEK': { symbol: 'kr', decimals: 2, type: 'fiat' },
    'EGP': { symbol: '£', decimals: 2, type: 'fiat' },
    'ERN': { symbol: 'Nfk', decimals: 2, type: 'fiat' },
    'ETB': { symbol: 'Br', decimals: 2, type: 'fiat' },
    'ETH': { symbol: 'Ξ', decimals: 2, type: 'crypto' },
    'EUR': { symbol: '€', decimals: 2, type: 'fiat' },
    'FJD': { symbol: '$', decimals: 2, type: 'fiat' },
    'FKP': { symbol: '£', decimals: 2, type: 'fiat' },
    'GBP': { symbol: '£', decimals: 2, type: 'fiat' },
    'GEL': { symbol: '₾', decimals: 2, type: 'fiat' },
    'GGP': { symbol: '£', decimals: 2, type: 'fiat' },
    'GHC': { symbol: '₵', decimals: 2, type: 'fiat' },
    'GHS': { symbol: 'GH₵', decimals: 2, type: 'fiat' },
    'GIP': { symbol: '£', decimals: 2, type: 'fiat' },
    'GMD': { symbol: 'D', decimals: 2, type: 'fiat' },
    'GNF': { symbol: 'FG', decimals: 2, type: 'fiat' },
    'GTQ': { symbol: 'Q', decimals: 2, type: 'fiat' },
    'GYD': { symbol: '$', decimals: 2, type: 'fiat' },
    'HKD': { symbol: '$', decimals: 2, type: 'fiat' },
    'HNL': { symbol: 'L', decimals: 2, type: 'fiat' },
    'HRK': { symbol: 'kn', decimals: 2, type: 'fiat' },
    'HTG': { symbol: 'G', decimals: 2, type: 'fiat' },
    'HUF': { symbol: 'Ft', decimals: 2, type: 'fiat' },
    'IDR': { symbol: 'Rp', decimals: 2, type: 'fiat' },
    'ILS': { symbol: '₪', decimals: 2, type: 'fiat' },
    'IMP': { symbol: '£', decimals: 2, type: 'fiat' },
    'INR': { symbol: '₹', decimals: 2, type: 'fiat' },
    'IQD': { symbol: 'ع.د', decimals: 2, type: 'fiat' },
    'IRR': { symbol: '﷼', decimals: 2, type: 'fiat' },
    'ISK': { symbol: 'kr', decimals: 2, type: 'fiat' },
    'JEP': { symbol: '£', decimals: 2, type: 'fiat' },
    'JMD': { symbol: 'J$', decimals: 2, type: 'fiat' },
    'JOD': { symbol: 'JD', decimals: 2, type: 'fiat' },
    'JPY': { symbol: '¥', decimals: 2, type: 'fiat' },
    'KES': { symbol: 'KSh', decimals: 2, type: 'fiat' },
    'KGS': { symbol: 'лв', decimals: 2, type: 'fiat' },
    'KHR': { symbol: '៛', decimals: 2, type: 'fiat' },
    'KMF': { symbol: 'CF', decimals: 2, type: 'fiat' },
    'KPW': { symbol: '₩', decimals: 2, type: 'fiat' },
    'KRW': { symbol: '₩', decimals: 2, type: 'fiat' },
    'KWD': { symbol: 'KD', decimals: 2, type: 'fiat' },
    'KYD': { symbol: '$', decimals: 2, type: 'fiat' },
    'KZT': { symbol: 'лв', decimals: 2, type: 'fiat' },
    'LAK': { symbol: '₭', decimals: 2, type: 'fiat' },
    'LBP': { symbol: '£', decimals: 2, type: 'fiat' },
    'LKR': { symbol: '₨', decimals: 2, type: 'fiat' },
    'LRD': { symbol: '$', decimals: 2, type: 'fiat' },
    'LSL': { symbol: 'M', decimals: 2, type: 'fiat' },
    'LTC': { symbol: 'Ł', decimals: 2, type: 'crypto' },
    'LTL': { symbol: 'Lt', decimals: 2, type: 'fiat' },
    'LVL': { symbol: 'Ls', decimals: 2, type: 'fiat' },
    'LYD': { symbol: 'LD', decimals: 2, type: 'fiat' },
    'MAD': { symbol: 'MAD', decimals: 2, type: 'fiat' },
    'MDL': { symbol: 'lei', decimals: 2, type: 'fiat' },
    'MGA': { symbol: 'Ar', decimals: 2, type: 'fiat' },
    'MKD': { symbol: 'ден', decimals: 2, type: 'fiat' },
    'MMK': { symbol: 'K', decimals: 2, type: 'fiat' },
    'MNT': { symbol: '₮', decimals: 2, type: 'fiat' },
    'MOP': { symbol: 'MOP$', decimals: 2, type: 'fiat' },
    'MRO': { symbol: 'UM', decimals: 2, type: 'fiat' },
    'MRU': { symbol: 'UM', decimals: 2, type: 'fiat' },
    'MUR': { symbol: '₨', decimals: 2, type: 'fiat' },
    'MVR': { symbol: 'Rf', decimals: 2, type: 'fiat' },
    'MWK': { symbol: 'MK', decimals: 2, type: 'fiat' },
    'MXN': { symbol: '$', decimals: 2, type: 'fiat' },
    'MYR': { symbol: 'RM', decimals: 2, type: 'fiat' },
    'MZN': { symbol: 'MT', decimals: 2, type: 'fiat' },
    'NAD': { symbol: '$', decimals: 2, type: 'fiat' },
    'NGN': { symbol: '₦', decimals: 2, type: 'fiat' },
    'NIO': { symbol: 'C$', decimals: 2, type: 'fiat' },
    'NOK': { symbol: 'kr', decimals: 2, type: 'fiat' },
    'NPR': { symbol: '₨', decimals: 2, type: 'fiat' },
    'NZD': { symbol: '$', decimals: 2, type: 'fiat' },
    'OMR': { symbol: '﷼', decimals: 2, type: 'fiat' },
    'PAB': { symbol: 'B/.', decimals: 2, type: 'fiat' },
    'PEN': { symbol: 'S/.', decimals: 2, type: 'fiat' },
    'PGK': { symbol: 'K', decimals: 2, type: 'fiat' },
    'PHP': { symbol: '₱', decimals: 2, type: 'fiat' },
    'PKR': { symbol: '₨', decimals: 2, type: 'fiat' },
    'PLN': { symbol: 'zł', decimals: 2, type: 'fiat' },
    'PYG': { symbol: 'Gs', decimals: 2, type: 'fiat' },
    'QAR': { symbol: '﷼', decimals: 2, type: 'fiat' },
    'RMB': { symbol: '￥', decimals: 2, type: 'fiat' },
    'RON': { symbol: 'lei', decimals: 2, type: 'fiat' },
    'RSD': { symbol: 'Дин.', decimals: 2, type: 'fiat' },
    'RUB': { symbol: '₽', decimals: 2, type: 'fiat' },
    'RWF': { symbol: 'R₣', decimals: 2, type: 'fiat' },
    'SAR': { symbol: '﷼', decimals: 2, type: 'fiat' },
    'SBD': { symbol: '$', decimals: 2, type: 'fiat' },
    'SCR': { symbol: '₨', decimals: 2, type: 'fiat' },
    'SDG': { symbol: 'ج.س.', decimals: 2, type: 'fiat' },
    'SEK': { symbol: 'kr', decimals: 2, type: 'fiat' },
    'SGD': { symbol: '$', decimals: 2, type: 'fiat' },
    'SHP': { symbol: '£', decimals: 2, type: 'fiat' },
    'SLL': { symbol: 'Le', decimals: 2, type: 'fiat' },
    'SOS': { symbol: 'S', decimals: 2, type: 'fiat' },
    'SRD': { symbol: '$', decimals: 2, type: 'fiat' },
    'SSP': { symbol: '£', decimals: 2, type: 'fiat' },
    'STD': { symbol: 'Db', decimals: 2, type: 'fiat' },
    'STN': { symbol: 'Db', decimals: 2, type: 'fiat' },
    'SVC': { symbol: '$', decimals: 2, type: 'fiat' },
    'SYP': { symbol: '£', decimals: 2, type: 'fiat' },
    'SZL': { symbol: 'E', decimals: 2, type: 'fiat' },
    'THB': { symbol: '฿', decimals: 2, type: 'fiat' },
    'TJS': { symbol: 'SM', decimals: 2, type: 'fiat' },
    'TMT': { symbol: 'T', decimals: 2, type: 'fiat' },
    'TND': { symbol: 'د.ت', decimals: 2, type: 'fiat' },
    'TOP': { symbol: 'T$', decimals: 2, type: 'fiat' },
    'TRL': { symbol: '₤', decimals: 2, type: 'fiat' },
    'TRY': { symbol: '₺', decimals: 2, type: 'fiat' },
    'TTD': { symbol: 'TT$', decimals: 2, type: 'fiat' },
    'TVD': { symbol: '$', decimals: 2, type: 'fiat' },
    'TWD': { symbol: 'NT$', decimals: 2, type: 'fiat' },
    'TZS': { symbol: 'TSh', decimals: 2, type: 'fiat' },
    'UAH': { symbol: '₴', decimals: 2, type: 'fiat' },
    'UGX': { symbol: 'USh', decimals: 2, type: 'fiat' },
    'USD': { symbol: '$', decimals: 2, type: 'fiat' },
    'UYU': { symbol: '$U', decimals: 2, type: 'fiat' },
    'UZS': { symbol: 'лв', decimals: 2, type: 'fiat' },
    'VEF': { symbol: 'Bs', decimals: 2, type: 'fiat' },
    'VND': { symbol: '₫', decimals: 2, type: 'fiat' },
    'VUV': { symbol: 'VT', decimals: 2, type: 'fiat' },
    'WST': { symbol: 'WS$', decimals: 2, type: 'fiat' },
    'XAF': { symbol: 'FCFA', decimals: 2, type: 'fiat' },
    'XBT': { symbol: 'Ƀ', decimals: 2, type: 'fiat' },
    'XCD': { symbol: '$', decimals: 2, type: 'fiat' },
    'XOF': { symbol: 'CFA', decimals: 2, type: 'fiat' },
    'XPF': { symbol: '₣', decimals: 2, type: 'fiat' },
    'YER': { symbol: '﷼', decimals: 2, type: 'fiat' },
    'ZAR': { symbol: 'R', decimals: 2, type: 'fiat' },
    'ZWD': { symbol: 'Z$', decimals: 2, type: 'fiat' }
  };

  return Constants;
});
