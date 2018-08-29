'use strict';

angular.module('owsWalletPluginClient.controllers').controller('OWSCollapsibleCtrl', function($rootScope, $scope, $window, $ionicScrollDelegate, $timeout) {

  // Defaults for managing collapsible view.
  var NAV_BAR_HEIGHT = 44; // app nav bar content height
  var CONTENT_INSET_TOP = owswallet.Plugin.safeAreaInsets().top + NAV_BAR_HEIGHT;
  var CONTENT_INSET_BOTTOM = owswallet.Plugin.safeAreaInsets().bottom;
  var HEADER_MAX_HEIGHT = 80; // Maximum total height of header
  var HEADER_MIN_HEIGHT = 44; // Minimum (collapsed) height of header
  var HEADER_TOP = 20; // Initial top position of the scaled content inside the header
  var HEADER_TOP_FINAL = 15; // Final top position of the scaled content inside the header
  var HEADER_CONTENT_MIN_SCALE = 0.5; // Smallest scaling of fullsize content
  var TAB_BAR_HEIGHT = 49; // Height of a visible tab bar.

  $scope.headerIsCollapsible = !owswallet.Plugin.isAndroid();

  // Set a default values which can be overridden by the directive link.
  $scope.headerMaxHeight = HEADER_MAX_HEIGHT;
  $scope.headerMinHeight = HEADER_MIN_HEIGHT;
  $scope.headerTop = HEADER_TOP;
  $scope.headerTopFinal = HEADER_TOP_FINAL;

  $scope.contentMargin = $scope.headerMaxHeight + 'px';
  $scope.collapsibleItemHeight = $scope.headerMaxHeight + 'px';

  const animationFrameInterval = 16.67; // ms (60hz)
  $scope.animationSpeed = 200; // ms

  var headerHeight = $scope.headerMaxHeight - $scope.headerMinHeight;
  var lastScrollPos = 0;
  var resetInProgress = false;

  $scope.getScrollPosition = function() {
    if (resetInProgress) {
      return;
    }
    var scrollPos = $ionicScrollDelegate.$getByHandle('owsCollapsibleScroll').getScrollPosition().top;
    refreshHeader(scrollPos);
  };

  $scope.reset = function() {
    function doReset() {
      if (lastScrollPos >= 0) {
        if (lastScrollPos > headerHeight) {
          refreshHeader(headerHeight, true);
        } else {
          refreshHeader(Math.max(lastScrollPos - animationStep, 0), true);
        }

        if (lastScrollPos > 0) {
          window.requestAnimationFrame(doReset);
        } else {
          resetInProgress = false;
        }
      }
    };

    resetInProgress = true;
    var animationStep = headerHeight / ($scope.animationSpeed / animationFrameInterval);
    window.requestAnimationFrame(doReset);
  };

  function refreshHeader(scrollPos, skipAnimationRequest) {
    if (!$scope.headerIsCollapsible) {
      return;
    }

    if (scrollPos == undefined) {
      lastScrollPos = 0;
      scrollPos = 0;
    }
    lastScrollPos = scrollPos;

    // Set collapsed header height.
    var collapsibleItemHeight = $scope.headerMaxHeight - scrollPos;
    if (collapsibleItemHeight < $scope.headerMinHeight) {
      collapsibleItemHeight = $scope.headerMinHeight;
    }
    if (collapsibleItemHeight > $scope.headerMaxHeight) {
      collapsibleItemHeight = $scope.headerMaxHeight;
    }

    // Calculate percentage collapsed.
    var collapsibleItemPercent = (collapsibleItemHeight - $scope.headerMinHeight) / ($scope.headerMaxHeight - $scope.headerMinHeight);

    // Set the scaled size of the header content based on current scale.
    var collapsibleItemContentScale = HEADER_CONTENT_MIN_SCALE + (collapsibleItemPercent * (1 - HEADER_CONTENT_MIN_SCALE));

    // Set the top of the view content below the header.
    var contentMargin = collapsibleItemHeight;

    // Set the top position for the header.
    var headerTop = $scope.headerTopFinal - (collapsibleItemPercent * ($scope.headerTopFinal - $scope.headerTop));

    // Update in case tab bar state has changed.
    var tabBarOffset = ($rootScope.hideTabs == '' ? TAB_BAR_HEIGHT : 0);

    // Apply results to view.
    if (skipAnimationRequest) {
      update();
    } else {
      $window.requestAnimationFrame(function() {
        update();
      });
    }

    function update() {
      $scope.collapsibleItemHeight = collapsibleItemHeight + 'px';
      $scope.visibleContentHeight = $window.screen.height - CONTENT_INSET_TOP - contentMargin - tabBarOffset + 'px';
      $scope.contentMargin = contentMargin + 'px';
      $scope.contentTransform = 'translateY(' + ($scope.headerMaxHeight - collapsibleItemHeight) + 'px)';
      $scope.collapsibleItemScale = 'scale3d(' + collapsibleItemContentScale + ',' + collapsibleItemContentScale + ',' + collapsibleItemContentScale + ') translateY(' + headerTop + 'px)';
      $scope.isCollapsing = collapsibleItemHeight < $scope.headerMaxHeight;
      $scope.$digest();

      notifyState();
    };

    function notifyState() {
      if ($scope.model) {
        $scope.model.percentage = collapsibleItemPercent;
        $scope.model.headerHeight = collapsibleItemHeight;
        $scope.model.bodyHeight = parseInt($scope.visibleContentHeight);
        $scope.model.scale = $scope.collapsibleItemScale;
        $scope.model.opacity = collapsibleItemPercent;

        if ($scope.model.listener) {
          $scope.model.listener();
        }
      }
    };
  };

});
