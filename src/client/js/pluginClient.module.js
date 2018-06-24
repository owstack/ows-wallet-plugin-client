'use strict';

var modules = [
  'gettext',
	'ngLodash',
  'pathToRegexpModule',
	'owsWalletPluginClient.impl.api',
	'owsWalletPluginClient.impl.apiHandlers',
	'owsWalletPluginClient.impl.services',
	'owsWalletPluginClient.api',
	'owsWalletPluginClient.directives',
	'owsWalletPluginClient.filters',
	'owsWalletPluginClient.services'
];

angular.module('owsWalletPluginClient', modules);

angular.module('owsWalletPluginClient.impl.api', []);
angular.module('owsWalletPluginClient.impl.apiHandlers', []);
angular.module('owsWalletPluginClient.impl.services', []);
angular.module('owsWalletPluginClient.api', []).namespace();
angular.module('owsWalletPluginClient.directives', []);
angular.module('owsWalletPluginClient.filters', []);
angular.module('owsWalletPluginClient.services', []);
