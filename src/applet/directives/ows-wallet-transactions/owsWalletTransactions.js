'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsWalletTransactions', function() {

  var template = '\
    <ion-list id="ows-wallet-transactions">\
			<ion-item class="has-click item-icon-left icon-left-lg" ng-repeat="tx in transactions track by $index" ng-click="{{onClick}}(tx)">\
			  <!-- Icon -->\
			  <i class="icon lg-icon left-icon">\
			    <span ng-if="isUnconfirmed(tx)">\
			      <div class="tx-icon confirming" style="{{styleIconConfirming}}"></div>\
			    </span>\
			    <span ng-if="!isUnconfirmed(tx)">\
			      <div class="tx-icon received" style="{{styleIconReceived}}" ng-if="tx.action == \'received\'"></div>\
			      <div class="tx-icon sent" style="{{styleIconSent}}" ng-if="tx.action == \'sent\'"></div>\
			      <div class="tx-icon moved" style="{{styleIconMoved}}" ng-if="tx.action == \'moved\'"></div>\
			    </span>\
			  </i>\
			  <!-- Amount (right side) -->\
			  <div class="tx-detail">\
			    <span ng-class="{\'tx-amount recent\': tx.recent, \'tx-amount received\': tx.action == \'received\', \'tx-amount sent\': tx.action == \'sent\',\
			      \'tx-amount moved\': tx.action == \'moved\'}">\
			      <span ng-if="tx.action == \'sent\'">–</span>\
			      <span ng-if="tx.action == \'invalid\'" translate>\
			        (possible double spend)\
			      </span>\
			      <span ng-if="tx.action != \'invalid\'">\
			        {{tx.amountStr}}\
			      </span>\
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
			  <!-- Confirmed -->\
			  <div class="tx-description" ng-if="!isUnconfirmed(tx)">\
			    <!-- Received -->\
			    <div ng-show="tx.action == \'received\'">\
			      <span ng-if="tx.note.body" class="ellipsis">\
			        {{tx.note.body}}\
			      </span>\
			      <span ng-if="!tx.note.body" translate>\
			        Received\
			      </span>\
			      <span ng-if="tx.lowFees || tx.lowAmount">\
			        <i class="ion-alert-circled"></i>\
			      </span>\
			    </div>\
			    <!-- Sent -->\
			    <div ng-show="tx.action == \'sent\'">\
			      <div ng-if="tx.message" class="ellipsis">\
			        {{tx.message}}\
			      </div>\
			      <div ng-if="!tx.message && tx.note.body" class="ellipsis">\
			        {{tx.note.body}}\
			      </div>\
			      <div ng-if="!tx.message && !tx.note.body && addressbook[tx.addressTo]" class="ellipsis">\
			        {{addressbook[tx.addressTo].name || addressbook[tx.addressTo]}}\
			      </div>\
			      <div ng-if="!tx.message && !tx.note.body && !addressbook[tx.addressTo]" translate>\
			        Sent\
			      </div>\
			    </div>\
			    <!-- Moved -->\
			    <div ng-show="tx.action == \'moved\'">\
			      <div ng-if="tx.note.body" class="ellipsis">\
			        {{tx.note.body}}\
			      </div>\
			      <div ng-if="!tx.note.body" translate>\
			        Moved\
			      </div>\
			    </div>\
			    <!-- Invalid -->\
			    <span ng-if="tx.action == \'invalid\'" translate>\
			      Invalid\
			    </span>\
			  </div>\
			  <!-- Unconfirmed -->\
			  <div ng-if="isUnconfirmed(tx)">\
			    <span ng-if="tx.action == \'sent\' || tx.action == \'moved\'" class="ellipsis">\
			      {{addressbook[tx.addressTo].name || addressbook[tx.addressTo] || \'Sending\'|translate}}\
			    </span>\
			    <span ng-if="tx.action == \'received\'" translate>\
			      Receiving\
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
    	transactions: '=',
    	styleIconConfirming: '@',
    	styleIconReceived: '@',
    	styleIconSent: '@',
    	styleIconMoved: '@',
    	onClick: '@'
    },
    controller: 'OWSWalletTransactionsCtrl',
    template: template,
    link: function (scope, element, attrs) {
      scope.$watch('transactions', function(value) {
      	scope.transactions = value;
      });
    }
	};
});
