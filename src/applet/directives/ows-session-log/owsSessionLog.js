'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsSessionLog', function($log) {

  var template = '\
	  <div id="ows-session-log">\
	    <div ng-show="filteredLogs.length == 0" translate>\
	      No Entries For this log level. Adjust setting in app at Settings > About > Session Log.\
	    </div>\
	    <ion-list ng-show="filteredLogs.length > 0">\
	      <ion-item class="item-text-wrap enable_text_select log-entry">\
	        <ul ng-show="filteredLogs.length > 0">\
	          <li ng-repeat="l in filteredLogs">\
	            <span ng-class="{\'warning\': l.level==\'warn\', \'debug\': l.level==\'debug\', \'info\': l.level==\'info\', \'error\': l.level==\'error\'}">\
	              <span class="log-timestamp">[{{l.timestamp}}]</span>\
	              <span class="log-level">[{{l.level}}]</span>\
	              <span class="log-client" ng-if="!isCordova">[{{pluginName}}]</span>\
	              {{l.msg}}\
	            </span>\
	          </li>\
	        </ul>\
	      </ion-item>\
	    </ion-list>\
    </div>\
	';

  return {
    restrict: 'E',
    scope: {},
    controller: 'OWSSessionLogCtrl',
    template: template,
    link: function (scope, element, attrs) {}
	};
});
