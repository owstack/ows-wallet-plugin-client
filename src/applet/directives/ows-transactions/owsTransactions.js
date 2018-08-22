'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsTransactions', function() {

  var template = '\
    <ion-list id="ows-transactions">\
      <ion-item class="item-divider" ng-class="{\'has-label\': listName}">\
        {{listName}}\
      </ion-item>\
			<ion-item class="item-icon-left icon-left-lg" ng-class="{\'has-click\': onClick, \'has-detail\': tx.subtitle}"\
				ng-repeat="tx in transactions track by $index" ng-click="{{onClick}}(tx)">\
			  <!-- Icon (left side) -->\
			  <i class="icon lg-icon left-icon">\
		      <div class="tx-icon received" style="{{styleIconReceived}}" ng-if="tx.type == \'received\'"></div>\
		      <div class="tx-icon sent" style="{{styleIconSent}}" ng-if="tx.type == \'sent\'"></div>\
			  </i>\
			  <!-- Amount (right side) -->\
			  <div class="tx-note">\
			    <span class="tx-amount" ng-class="{\'recent\': tx.type == \'recent\', \'received\': tx.type == \'received\', \'sent\': tx.type == \'sent\'}">\
		        {{format(tx.amount, tx.currency).localized_u}}\
			    </span>\
			    <div class="tx-time">\
			      <time ng-if="tx.time && createdWithinPastDay(tx.time * 1000)">\
			        {{tx.time * 1000 | amTimeAgo}}\
			      </time>\
			      <time ng-if="tx.time && !createdWithinPastDay(tx.time * 1000)">\
			        {{tx.time * 1000 | amDateFormat:\'MMM D, YYYY\'}}\
			      </time>\
			    </div>\
			  </div>\
			  <!-- Description -->\
			  <div class="tx-description">\
		      <span ng-if="tx.title" class="tx-title ellipsis">\
		        {{tx.title}}\
		      </span>\
	        <div ng-if="tx.subtitle" class="tx-subtitle ellipsis">\
	        	{{tx.subtitle}}\
	        </div>\
		      <span ng-if="!tx.title" translate>\
						<span ng-show="tx.type == \'received\'" translate>Received</span>\
						<span ng-show="tx.type == \'sent\'" translate>Sent</span>\
		      </span>\
			  </div>\
			</ion-item>\
    </ion-list>\
	';

	// Transactions binding must be two-way. see http://davidcai.github.io/blog/posts/directive-at-vs-equal/ and
	// https://stackoverflow.com/questions/16646607/how-to-use-ng-repeat-within-template-of-a-directive-in-angular-js

  return {
    restrict: 'E',
    scope: {
    	listName: '@',
    	transactions: '=',
    	styleIconReceived: '@',
    	styleIconSent: '@',
    	onClick: '@'
    },
    controller: 'OWSTransactionsCtrl',
    template: template,
    link: function (scope, element, attrs) {
      scope.$watch('transactions', function(value) {
      	scope.transactions = value;
      });
    }
	};
});
