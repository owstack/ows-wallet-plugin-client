'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsKeypad', function($log) {

  var template = '\
		<div id="ows-keypad" ng-controller="OWSKeypadCtrl">\
			<div class="keypad">\
			  <div class="row">\
			    <div class="col digit" ng-click="pushDigit(\'1\')">1</div>\
			    <div class="col digit" ng-click="pushDigit(\'2\')">2</div>\
			    <div class="col digit" ng-click="pushDigit(\'3\')">3</div>\
			  </div>\
			  <div class="row">\
			    <div class="col digit" ng-click="pushDigit(\'4\')">4</div>\
			    <div class="col digit" ng-click="pushDigit(\'5\')">5</div>\
			    <div class="col digit" ng-click="pushDigit(\'6\')">6</div>\
			  </div>\
			  <div class="row">\
			    <div class="col digit" ng-click="pushDigit(\'7\')">7</div>\
			    <div class="col digit" ng-click="pushDigit(\'8\')">8</div>\
			    <div class="col digit" ng-click="pushDigit(\'9\')">9</div>\
			  </div>\
			  <div class="row">\
			    <div class="col digit" ng-click="pushDigit(\'.\')">.</div>\
			    <div class="col digit" ng-click="pushDigit(\'0\')">0</div>\
			    <div class="col digit" ng-click="removeDigit()">\
			      <img svg src="{{buttonDelSrc}}">\
			    </div>\
			  </div>\
			</div>\
		</div>\
	';

  return {
    restrict: 'E',
    scope: {
    	buttonDelSrc: '@',
	    config: '@'
    },
    controller: 'OWSKeypadCtrl',
    template: template,
    link: function (scope, element, attrs) {
      scope.$watch('config', function(value) {
      	scope.config = value;
      });
    }
	};
});
