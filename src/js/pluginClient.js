'use strict';

var modules = [
  'gettext',
	'ngLodash',
	'owsWalletPluginClient.api',
	'owsWalletPluginClient.impl'
];

var owsWalletPluginClient = angular.module('owsWalletPluginClient', modules);

angular.module('owsWalletPluginClient.api', []);
angular.module('owsWalletPluginClient.impl', []);