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

  // Set a default values which can be overridden by the directive link.
  $scope.headerMaxHeight = HEADER_MAX_HEIGHT;
  $scope.headerMinHeight = HEADER_MIN_HEIGHT;
  $scope.headerTop = HEADER_TOP;
  $scope.headerTopFinal = HEADER_TOP_FINAL;

  $scope.contentMargin = $scope.headerMaxHeight + 'px';
  $scope.collapsibleItemHeight = $scope.headerMaxHeight + 'px';

  // The most padding necessary to allow for header collapse when there is no view content.
  var paddingMax = $window.screen.height - CONTENT_INSET_TOP - $scope.headerMinHeight;

  var lastScrollPos = undefined;

  $scope.headerIsCollapsible = !owswallet.Plugin.isAndroid();

  $scope.getScrollPosition = function() {
    var position = $ionicScrollDelegate.$getByHandle('owsCollapsibleScroll').getScrollPosition().top;
    refreshHeader(position);
    refreshSubscribers();
  };

  function refreshHeader(scrollPos) {
    if (!$scope.headerIsCollapsible) {
      return;
    }

    if (scrollPos == undefined && lastScrollPos == undefined) {
      lastScrollPos = 0;
    }

    if (scrollPos == undefined) {
      scrollPos = lastScrollPos;
    }
    lastScrollPos = scrollPos;

    function outerHeight(el) {
      var height = el.offsetHeight;
      var style = getComputedStyle(el);

      height -= parseInt(style.paddingBottom);
      height += parseInt(style.marginTop) + parseInt(style.marginBottom);
      return height;
    };

    // Set collapsed header height.
    var collapsibleItemHeight = $scope.headerMaxHeight - scrollPos;
    if (collapsibleItemHeight < $scope.headerMinHeight) {
      collapsibleItemHeight = $scope.headerMinHeight;
    }
    if (collapsibleItemHeight > $scope.headerMaxHeight) {
      collapsibleItemHeight = $scope.headerMaxHeight;
    }

    // Calculate percentage collapsed.
    $scope.collapsibleItemPercent = (collapsibleItemHeight - $scope.headerMinHeight) / ($scope.headerMaxHeight - $scope.headerMinHeight);

    // Set the scaled size of the header content based on current scale.
    var collapsibleItemContentScale = HEADER_CONTENT_MIN_SCALE + ($scope.collapsibleItemPercent * (1 - HEADER_CONTENT_MIN_SCALE));

    // Set the top of the view content below the header.
    var contentMargin = collapsibleItemHeight;

    // Set the top position for the header.
    var headerTop = $scope.headerTopFinal - ($scope.collapsibleItemPercent * ($scope.headerTopFinal - $scope.headerTop));

    // Vary opacity for elements displayed when header is collapsed.
    $scope.elementOpacity = $scope.collapsibleItemPercent;
    $scope.elementOpacityInverse = 1 - $scope.elementOpacity;

    // Compute the amount of bottom padding needed to allow content that does not fill the view to collapse the header.
    var contentPaddingBottom = paddingMax - outerHeight(document.getElementsByClassName('scrollable-ows-collapsible-content')[0]);
    if (contentPaddingBottom < 0) {
      contentPaddingBottom = 0;
    }

    // Apply results to view.
    $window.requestAnimationFrame(function() {
      $scope.collapsibleItemHeight = collapsibleItemHeight + 'px';

      var tabBarOffset = ($rootScope.hideTabs == '' ? TAB_BAR_HEIGHT : 0);
      $scope.contentHeight = $window.screen.height - CONTENT_INSET_TOP - contentMargin - tabBarOffset + 'px';

      // Apply bottom margin to the scroll container to prevent the scroll container from moving down on resize events (margin takes up the space).
      // Only apply if the content is larger than the visible space.
      if (outerHeight(document.getElementsByClassName('scrollable-ows-collapsible-content')[0]) >= parseInt($scope.contentHeight)) {
        document.querySelector('.ion-content-ows-collapsible .scroll').style.marginBottom = $scope.headerMaxHeight + 'px';
      }
  
      $scope.contentMargin = contentMargin + 'px';
      $scope.contentTransform = 'translateY(' + ($scope.headerMaxHeight - collapsibleItemHeight) + 'px)';
      $scope.collapsibleItemScale = 'scale3d(' + collapsibleItemContentScale + ',' + collapsibleItemContentScale + ',' + collapsibleItemContentScale + ') translateY(' + headerTop + 'px)';
      $scope.isCollapsing = collapsibleItemHeight < $scope.headerMaxHeight;
      $scope.contentPaddingBottom = contentPaddingBottom + 'px';
      $scope.$digest();
    });
  };

  function refreshSubscribers() {
    // Apply scale to subscribers.
    var scalable = document.querySelectorAll('[ows-collapsible="scale"]');
    for (var i=0; i < scalable.length; i++) {
      angular.element(scalable[i]).css('transform', $scope.collapsibleItemScale);
    }

    // Apply opacity to subscribers.
    var opacity = document.querySelectorAll('[ows-collapsible="opacity"]');
    for (var i=0; i < opacity.length; i++) {
      angular.element(opacity[i]).css('opacity', $scope.elementOpacity);
    }

    // Apply inverse opacity to subscribers.
    var opacityInverse = document.querySelectorAll('[ows-collapsible="opacityInverse"]');
    for (var i=0; i < opacityInverse.length; i++) {
      angular.element(opacityInverse[i]).css('opacity', $scope.elementOpacityInverse);
    }
  };

});
