'use strict';

angular.module('owsWalletPluginClient.api').factory('Constants', function (
  /* @namespace owsWalletPluginClient.api */ ApiError) {

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
    throw new ApiError({
      message: 'IMPLEMENTATION_ERROR',
      detail: 'Constants is a static class'
    });
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
    'AED': { name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, type: 'fiat' },
    'AFN': { name: 'Afghan Afghani', symbol: '؋', decimals: 2, type: 'fiat' },
    'ALL': { name: 'Albanian Lek', symbol: 'L', decimals: 2, type: 'fiat' },
    'AMD': { name: 'Armenian Dram', symbol: '֏', decimals: 2, type: 'fiat' },
    'ANG': { name: 'Netherlands Antillean Guilder', symbol: 'ƒ', decimals: 2, type: 'fiat' },
    'AOA': { name: 'Angolan Kwanza', symbol: 'Kz', decimals: 2, type: 'fiat' },
    'ARS': { name: 'Argentine Peso', symbol: '$', decimals: 2, type: 'fiat' },
    'AUD': { name: 'Australian Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'AWG': { name: 'Aruban Florin', symbol: 'ƒ', decimals: 2, type: 'fiat' },
    'AZN': { name: 'Azerbaijani Manat', symbol: '₼', decimals: 2, type: 'fiat' },
    'BAM': { name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', decimals: 2, type: 'fiat' },
    'BBD': { name: 'Barbadian Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'BCH': { name: 'Bitcoin Cash', symbol: '฿', decimals: 8, type: 'crypto' },
    'BDT': { name: 'Bangladeshi Taka', symbol: '৳', decimals: 2, type: 'fiat' },
    'BGN': { name: 'Bulgarian Lev', symbol: 'лв', decimals: 2, type: 'fiat' },
    'BHD': { name: 'Bahraini Dinar', symbol: '.د.ب', decimals: 2, type: 'fiat' },
    'BIF': { name: 'Burundian Franc', symbol: 'FBu', decimals: 2, type: 'fiat' },
    'BMD': { name: 'Bermudan Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'BND': { name: 'Brunei Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'BOB': { name: 'Bolivian Bolíviano', symbol: '$b', decimals: 2, type: 'fiat' },
    'BRL': { name: 'Brasilian Real', symbol: 'R$', decimals: 2, type: 'fiat' },
    'BSD': { name: 'Bahamian Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'BTC': { name: 'Bitcoin', symbol: '฿', decimals: 8, type: 'crypto' },
    'BTN': { name: 'Bhutanese Ngultrum', symbol: 'Nu.', decimals: 2, type: 'fiat' },
    'BWP': { name: 'Botswanan Pula', symbol: 'P', decimals: 2, type: 'fiat' },
    'BYR': { name: 'Belarusian Ruble', symbol: 'Br', decimals: 2, type: 'fiat' },
    'BYN': { name: 'Belarusian Ruble', symbol: 'Br', decimals: 2, type: 'fiat' },
    'BZD': { name: 'Belize Dollar', symbol: 'BZ$', decimals: 2, type: 'fiat' },
    'CAD': { name: 'Canadian Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'CDF': { name: 'Congolese Franc', symbol: 'FC', decimals: 2, type: 'fiat' },
    'CHF': { name: 'Swiss Franc', symbol: 'CHF', decimals: 2, type: 'fiat' },
    'CLP': { name: 'Chilean Peso', symbol: '$', decimals: 2, type: 'fiat' },
    'CNY': { name: 'Chinese Yuan', symbol: '¥', decimals: 2, type: 'fiat' },
    'COP': { name: 'Colombian Peso', symbol: '$', decimals: 2, type: 'fiat' },
    'CRC': { name: 'Costa Rican Colón', symbol: '₡', decimals: 2, type: 'fiat' },
    'CUC': { name: 'Cuban Convertible Peso', symbol: '$', decimals: 2, type: 'fiat' },
    'CUP': { name: 'Cuban Peso', symbol: '₱', decimals: 2, type: 'fiat' },
    'CVE': { name: 'Cape Verdean Escudo', symbol: '$', decimals: 2, type: 'fiat' },
    'CZK': { name: 'Czech Koruna', symbol: 'Kč', decimals: 2, type: 'fiat' },
    'DJF': { name: 'Djiboutian Franc', symbol: 'Fdj', decimals: 2, type: 'fiat' },
    'DKK': { name: 'Danish Krone', symbol: 'kr', decimals: 2, type: 'fiat' },
    'DOP': { name: 'Dominican Peso', symbol: 'RD$', decimals: 2, type: 'fiat' },
    'DZD': { name: 'Algerian Dinar', symbol: 'دج', decimals: 2, type: 'fiat' },
    'EEK': { name: 'Estonian Kroon', symbol: 'kr', decimals: 2, type: 'fiat' },
    'EGP': { name: 'Egyptian Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'ERN': { name: 'Eritrean Nakfa', symbol: 'Nfk', decimals: 2, type: 'fiat' },
    'ETB': { name: 'Ethiopian Birr', symbol: 'Br', decimals: 2, type: 'fiat' },
    'ETC': { name: 'Ethereum Classic', symbol: '⟠', decimals: 2, type: 'crypto' },
    'ETH': { name: 'Ethereum', symbol: 'Ξ', decimals: 2, type: 'crypto' },
    'EUR': { name: 'Eurozone Euro', symbol: '€', decimals: 2, type: 'fiat' },
    'FJD': { name: 'Fijian Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'FKP': { name: 'Falkland Islands Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'GBP': { name: 'Pound Sterling', symbol: '£', decimals: 2, type: 'fiat' },
    'GEL': { name: 'Georgian Lari', symbol: '₾', decimals: 2, type: 'fiat' },
    'GGP': { name: 'Guernsey Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'GHC': { name: 'Ghanaian Cedi', symbol: '₵', decimals: 2, type: 'fiat' },
    'GHS': { name: 'Ghanaian Cedi', symbol: 'GH₵', decimals: 2, type: 'fiat' },
    'GIP': { name: 'Gibraltar Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'GMD': { name: 'Gambian Dalasi', symbol: 'D', decimals: 2, type: 'fiat' },
    'GNF': { name: 'Guinean Franc', symbol: 'FG', decimals: 2, type: 'fiat' },
    'GTQ': { name: 'Guatemalan Quetzal', symbol: 'Q', decimals: 2, type: 'fiat' },
    'GYD': { name: 'Guyanaese Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'HKD': { name: 'Hong Kong Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'HNL': { name: 'Honduran Lempira', symbol: 'L', decimals: 2, type: 'fiat' },
    'HRK': { name: 'Croatian Kuna', symbol: 'kn', decimals: 2, type: 'fiat' },
    'HTG': { name: 'Haitian Gourde', symbol: 'G', decimals: 2, type: 'fiat' },
    'HUF': { name: 'Hungarian Forint', symbol: 'Ft', decimals: 2, type: 'fiat' },
    'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 2, type: 'fiat' },
    'ILS': { name: 'Israeli Shekel', symbol: '₪', decimals: 2, type: 'fiat' },
    'IMP': { name: 'Manx Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'INR': { name: 'Indian Rupee', symbol: '₹', decimals: 2, type: 'fiat' },
    'IQD': { name: 'Iraqi Dinar', symbol: 'ع.د', decimals: 2, type: 'fiat' },
    'IRR': { name: 'Iranian Rial', symbol: '﷼', decimals: 2, type: 'fiat' },
    'ISK': { name: 'Icelandic Króna', symbol: 'kr', decimals: 2, type: 'fiat' },
    'JEP': { name: 'Jersey Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'JMD': { name: 'Jamaican Dollar', symbol: 'J$', decimals: 2, type: 'fiat' },
    'JOD': { name: 'Jordanian Dinar', symbol: 'JD', decimals: 2, type: 'fiat' },
    'JPY': { name: 'Japanese Yen', symbol: '¥', decimals: 2, type: 'fiat' },
    'KES': { name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2, type: 'fiat' },
    'KGS': { name: 'Kyrgyzstani Som', symbol: 'лв', decimals: 2, type: 'fiat' },
    'KHR': { name: 'Cambodian Riel', symbol: '៛', decimals: 2, type: 'fiat' },
    'KMF': { name: 'Comorian Franc', symbol: 'CF', decimals: 2, type: 'fiat' },
    'KPW': { name: 'North Korean Won', symbol: '₩', decimals: 2, type: 'fiat' },
    'KRW': { name: 'South Korean Won', symbol: '₩', decimals: 2, type: 'fiat' },
    'KWD': { name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 2, type: 'fiat' },
    'KYD': { name: 'Cayman Islands Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'KZT': { name: 'Kazakhstani Tenge', symbol: 'лв', decimals: 2, type: 'fiat' },
    'LAK': { name: 'Laotian Kip', symbol: '₭', decimals: 2, type: 'fiat' },
    'LBP': { name: 'Lebanese Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'LKR': { name: 'Sri Lankan Rupee', symbol: '₨', decimals: 2, type: 'fiat' },
    'LRD': { name: 'Liberian Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'LSL': { name: 'Lesotho Loti', symbol: 'M', decimals: 2, type: 'fiat' },
    'LTC': { name: 'Litecoin', symbol: 'Ł', decimals: 2, type: 'crypto' },
    'LTL': { name: 'Lithuanian Litas', symbol: 'Lt', decimals: 2, type: 'fiat' },
    'LVL': { name: 'Latvian Lats', symbol: 'Ls', decimals: 2, type: 'fiat' },
    'LYD': { name: 'Libyan Dinar', symbol: 'LD', decimals: 2, type: 'fiat' },
    'MAD': { name: 'Moroccan Dirham', symbol: 'MAD', decimals: 2, type: 'fiat' },
    'MDL': { name: 'Moldovan Leu', symbol: 'lei', decimals: 2, type: 'fiat' },
    'MGA': { name: 'Malagasy Ariary', symbol: 'Ar', decimals: 2, type: 'fiat' },
    'MKD': { name: 'Macedonian Denar', symbol: 'ден', decimals: 2, type: 'fiat' },
    'MMK': { name: 'Myanma Kyat', symbol: 'K', decimals: 2, type: 'fiat' },
    'MNT': { name: 'Mongolian Tugrik', symbol: '₮', decimals: 2, type: 'fiat' },
    'MOP': { name: 'Macanese Pataca', symbol: 'MOP$', decimals: 2, type: 'fiat' },
    'MRO': { name: 'Mauritanian Ouguiya', symbol: 'UM', decimals: 2, type: 'fiat' },
    'MRU': { name: 'Mauritanian Ouguiya', symbol: 'UM', decimals: 2, type: 'fiat' },
    'MUR': { name: 'Mauritian Rupee', symbol: '₨', decimals: 2, type: 'fiat' },
    'MVR': { name: 'Maldivian Rufiyaa', symbol: 'Rf', decimals: 2, type: 'fiat' },
    'MWK': { name: 'Malawian Kwacha', symbol: 'MK', decimals: 2, type: 'fiat' },
    'MXN': { name: 'Mexican Peso', symbol: '$', decimals: 2, type: 'fiat' },
    'MYR': { name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2, type: 'fiat' },
    'MZN': { name: 'Mozambican Metical', symbol: 'MT', decimals: 2, type: 'fiat' },
    'NAD': { name: 'Namibian Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'NGN': { name: 'Nigerian Naira', symbol: '₦', decimals: 2, type: 'fiat' },
    'NIO': { name: 'Nicaraguan Córdoba', symbol: 'C$', decimals: 2, type: 'fiat' },
    'NOK': { name: 'Norwegian Krone', symbol: 'kr', decimals: 2, type: 'fiat' },
    'NPR': { name: 'Nepalese Rupee', symbol: '₨', decimals: 2, type: 'fiat' },
    'NZD': { name: 'New Zealand Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'OMR': { name: 'Omani Rial', symbol: '﷼', decimals: 2, type: 'fiat' },
    'PAB': { name: 'Panamanian Balboa', symbol: 'B/.', decimals: 2, type: 'fiat' },
    'PEN': { name: 'Peruvian Nuevo Sol', symbol: 'S/.', decimals: 2, type: 'fiat' },
    'PGK': { name: 'Papua New Guinean Kina', symbol: 'K', decimals: 2, type: 'fiat' },
    'PHP': { name: 'Philippine Peso', symbol: '₱', decimals: 2, type: 'fiat' },
    'PKR': { name: 'Pakistani Rupee', symbol: '₨', decimals: 2, type: 'fiat' },
    'PLN': { name: 'Polish Zloty', symbol: 'zł', decimals: 2, type: 'fiat' },
    'PYG': { name: 'Paraguayan Guarani', symbol: 'Gs', decimals: 2, type: 'fiat' },
    'QAR': { name: 'Qatari Rial', symbol: '﷼', decimals: 2, type: 'fiat' },
    'RMB': { name: 'Renminbi', symbol: '￥', decimals: 2, type: 'fiat' },
    'RON': { name: 'Romanian Leu', symbol: 'lei', decimals: 2, type: 'fiat' },
    'RSD': { name: 'Serbian Dinar', symbol: 'Дин.', decimals: 2, type: 'fiat' },
    'RUB': { name: 'Russian Ruble', symbol: '₽', decimals: 2, type: 'fiat' },
    'RWF': { name: 'Rwandan Franc', symbol: 'R₣', decimals: 2, type: 'fiat' },
    'SAR': { name: 'Saudi Riyal', symbol: '﷼', decimals: 2, type: 'fiat' },
    'SBD': { name: 'Solomon Islands Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'SCR': { name: 'Seychellois Rupee', symbol: '₨', decimals: 2, type: 'fiat' },
    'SDG': { name: 'Sudanese Pound', symbol: 'ج.س.', decimals: 2, type: 'fiat' },
    'SEK': { name: 'Swedish Krona', symbol: 'kr', decimals: 2, type: 'fiat' },
    'SGD': { name: 'Singapore Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'SHP': { name: 'Saint Helena Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'SLL': { name: 'Sierra Leonean Leone', symbol: 'Le', decimals: 2, type: 'fiat' },
    'SOS': { name: 'Somali Shilling', symbol: 'S', decimals: 2, type: 'fiat' },
    'SRD': { name: 'Surinamese Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'SSP': { name: 'South Sudanese Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'STD': { name: 'São Tomé and Príncipe Dobra', symbol: 'Db', decimals: 2, type: 'fiat' },
    'STN': { name: 'São Tomé and Príncipe Dobra', symbol: 'Db', decimals: 2, type: 'fiat' },
    'SVC': { name: 'Salvadoran Colón', symbol: '$', decimals: 2, type: 'fiat' },
    'SYP': { name: 'Syrian Pound', symbol: '£', decimals: 2, type: 'fiat' },
    'SZL': { name: 'Swazi Lilangeni', symbol: 'E', decimals: 2, type: 'fiat' },
    'THB': { name: 'Thai Baht', symbol: '฿', decimals: 2, type: 'fiat' },
    'TJS': { name: 'Tajikistani Somoni', symbol: 'SM', decimals: 2, type: 'fiat' },
    'TMT': { name: 'Turkmenistani Manat', symbol: 'T', decimals: 2, type: 'fiat' },
    'TND': { name: 'Tunisian Dinar', symbol: 'د.ت', decimals: 2, type: 'fiat' },
    'TOP': { name: 'Tongan Paʻanga', symbol: 'T$', decimals: 2, type: 'fiat' },
    'TRL': { name: 'Lira', symbol: '₤', decimals: 2, type: 'fiat' },
    'TRY': { name: 'Turkish Lira', symbol: '₺', decimals: 2, type: 'fiat' },
    'TTD': { name: 'Trinidad and Tobago Dollar', symbol: 'TT$', decimals: 2, type: 'fiat' },
    'TVD': { name: 'Tuvaluan Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'TWD': { name: 'New Taiwan Dollar', symbol: 'NT$', decimals: 2, type: 'fiat' },
    'TZS': { name: 'Tanzanian Shilling', symbol: 'TSh', decimals: 2, type: 'fiat' },
    'UAH': { name: 'Ukrainian Hryvnia', symbol: '₴', decimals: 2, type: 'fiat' },
    'UGX': { name: 'Ugandan Shilling', symbol: 'USh', decimals: 2, type: 'fiat' },
    'USD': { name: 'US Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'UYU': { name: 'Uruguayan Peso', symbol: '$U', decimals: 2, type: 'fiat' },
    'UZS': { name: 'Uzbekistan Som', symbol: 'лв', decimals: 2, type: 'fiat' },
    'VEF': { name: 'Venezuelan Bolívar Fuerte', symbol: 'Bs', decimals: 2, type: 'fiat' },
    'VND': { name: 'Vietnamese Dong', symbol: '₫', decimals: 2, type: 'fiat' },
    'VUV': { name: 'Vanuatu Vatu', symbol: 'VT', decimals: 2, type: 'fiat' },
    'WST': { name: 'Samoan Tala', symbol: 'WS$', decimals: 2, type: 'fiat' },
    'XAF': { name: 'CFA Franc BEAC', symbol: 'FCFA', decimals: 2, type: 'fiat' },
    'XBT': { name: 'Bitcoin', symbol: 'Ƀ', decimals: 2, type: 'fiat' },
    'XCD': { name: 'East Caribbean Dollar', symbol: '$', decimals: 2, type: 'fiat' },
    'XOF': { name: 'CFA Franc BCEAO', symbol: 'CFA', decimals: 2, type: 'fiat' },
    'XPF': { name: 'CFP Franc', symbol: '₣', decimals: 2, type: 'fiat' },
    'YER': { name: 'Yemeni Rial', symbol: '﷼', decimals: 2, type: 'fiat' },
    'ZAR': { name: 'South African Rand', symbol: 'R', decimals: 2, type: 'fiat' },
    'ZWD': { name: 'Zimbabwean Dollar', symbol: 'Z$', decimals: 2, type: 'fiat' }
  };

  return Constants;
});
