'use strict';

var modules = [
  'gettext',
	'ngLodash',
  'pathToRegexpModule',
	'owsWalletPluginClient.api',
	'owsWalletPluginClient.impl',
	'owsWalletPluginClient.filters',
	'owsWalletPluginClient.services'
];

var owsWalletPluginClient = angular.module('owsWalletPluginClient', modules);

angular.module('owsWalletPluginClient.api', []);
angular.module('owsWalletPluginClient.impl', []);
angular.module('owsWalletPluginClient.filters', []);
angular.module('owsWalletPluginClient.services', []);
