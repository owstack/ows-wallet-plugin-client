'use strict';

angular.module('owsWalletPluginClient.directives').directive('hideTabs', function($rootScope) {
  return {
    link: function(scope, elem, attrs, ctrl) {
      scope.$on("$ionicView.beforeEnter", function(event, data) {
        if (!attrs.hideTabs || (attrs.hideTabs == 'true')) {
          $rootScope.hideTabs = 'tabs-item-hide';
        } else {
          $rootScope.hideTabs = '';
        }
      });
    }
  };
});
