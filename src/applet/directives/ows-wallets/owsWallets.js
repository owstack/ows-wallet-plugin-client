'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsWallets', function(gettextCatalog) {

  var template = '\
    <ion-list id="ows-wallets">\
      <div class="item item-divider" ng-show="title" translate>\
        {{title}}\
      </div>\
      <a class="item item-icon-left item-icon-right" ng-class="{\'has-detail\': wallet.error}" ng-click="onClick(wallet)"\
        ng-repeat="wallet in wallets track by wallet.id">\
        <img svg="fill: {{wallet.color}}" ng-src="img/icon-{{wallet.currency.toLowerCase()}}.svg">\
        <span class="item-description">\
	        <h2>{{wallet.name}}</h2>\
	        <div class="item-detail">\
	          <p class="error" ng-show="wallet.error" translate>Wallet Error</p>\
	        </div>\
        </span>\
        <span class="item-note" ng-class="{\'two-lines\': wallet.status.alternativeIsoCode != wallet.currency}">\
          <h2>\
            {{wallet.format().balance}}\
          </h2>\
          <p ng-if="wallet.status.alternativeIsoCode != wallet.currency">\
            {{wallet.format().balanceAlternative}}\
          </p>\
        </span>\
        <i class="icon ion-ios-arrow-right"></i>\
      </a>\
    </ion-list>\
	';

	// Wallets binding must be two-way. see http://davidcai.github.io/blog/posts/directive-at-vs-equal/ and
	// https://stackoverflow.com/questions/16646607/how-to-use-ng-repeat-within-template-of-a-directive-in-angular-js

  return {
    restrict: 'E',
    scope: {
    	wallets: '=',
    	title: '@',
    	onClick: '='
    },
    controller: 'OWSWalletsCtrl',
    template: template,
    link: function (scope, element, attrs) {
      scope.$watch('wallets', function(value) {
      	scope.wallets = value;
      });
    }
	};
});
