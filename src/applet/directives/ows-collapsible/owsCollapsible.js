'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsCollapsible', function($rootScope, $timeout) {

  var collapsible = '\
		<div class="head-content" ng-style="{\'height\': collapsibleItemHeight}"\
		  ng-class="{\'collapsible\': headerIsCollapsible, \'is-collapsing\': isCollapsing}">\
      <div ng-transclude="header"></div>\
    </div>\
  ';

  var template = '\
  <div id="ows-collapsible" class="view-content has-header">\
    <!-- Header -->\
    <div class="head-wrapper ng-hide" ng-show="headerIsCollapsible">' +
      collapsible + '\
    </div>\
    <ion-content delegate-handle="owsCollapsibleScroll" on-scroll="getScrollPosition()"\
      ng-style="{\'margin-top\': contentMargin, \'height\': visibleContentHeight}"\
      ng-class="{\'collapsible\': headerIsCollapsible}" class="ion-content-ows-collapsible">\
      <div class="content-wrapper" ng-style="{\'transform\': contentTransform, \'padding-bottom\': contentPaddingBottom}">\
        <!-- -->\
        <!-- -->\
        <!-- -->\
        <!-- Start header duplicate (for Android compatibility) -->\
        <div class="head-wrapper ng-hide" ng-show="!headerIsCollapsible">' +
          collapsible + '\
        </div>\
        <!-- End header duplicate (for Android compatibility) -->\
        <!-- -->\
        <!-- -->\
        <div ng-transclude="body"></div>\
      </div>\
    </ion-content>\
  </div>\
	';

  return {
    restrict: 'E',
		transclude: {
      'header': 'owsCollapsibleHeader',
      'body': 'owsCollapsibleBody'
    },
    scope: {
/*
      maxHeight: '@',
      minHeight: '@',
      topStart: '@',
      topEnd: '@',
*/
      model: '='
    },
    controller: 'OWSCollapsibleCtrl',
    template: template,
    link: function (scope, element, attrs) {
      angular.extend(scope.model, {
        reset: function() {
          scope.reset();
        }
      });

      scope.$watch('model.listener', function(listener) {
        scope.model.listener = listener;
      });
      
      scope.$watch('model.maxHeight', function(height) {
        scope.headerMaxHeight = height || scope.headerMaxHeight;
        scope.contentMargin = scope.headerMaxHeight + 'px';
        scope.collapsibleItemHeight = scope.headerMaxHeight + 'px';
      });

      scope.$watch('model.minHeight', function(height) {
        scope.headerMinHeight = height || scope.headerMinHeight;
      });

      scope.$watch('model.topStart', function(top) {
        scope.headerTop = top || scope.headerTop;
      });

      scope.$watch('model.topEnd', function(top) {
        scope.headerTopFinal = top || scope.headerTopFinal;
      });

      scope.$watch('model.animationSpeed', function(speed) {
        scope.animationSpeed = speed || scope.animationSpeed;
      });
    }
	};
});
