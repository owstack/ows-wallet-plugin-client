'use strict';

angular.module('owsWalletPluginClient.directives')
  /**
   * Replaces img tag with its svg content to allow for CSS styling of the svg.
   */
  .directive('svg', function($http) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var imgId = attrs.id;
        var imgClass = attrs.class;
        var imgUrl = attrs.src || attrs.ngSrc;
        var svg;

        // Load svg content
        $http.get(imgUrl).success(function(data, status) {
          svg = angular.element(data);
          for (var i = svg.length - 1; i >= 0; i--) {
            if (svg[i].constructor == SVGSVGElement) {
              svg = angular.element(svg[i]);
              break;
            }
          }

          if (typeof imgId !== 'undefined') {
            svg.attr('id', imgId);
          }

          if (typeof imgClass !== 'undefined') {
            svg.attr('class', imgClass);
          }

          // Custom attributes
          //
          // Get key value pairs for svg attrs.
          var svgAttrs = [];
          var pairs = attrs.svg.split(';');
          for (var i = 0; i < pairs.length; i++) {
            var a = pairs[i].split(':');
            svgAttrs.push({
              key: a[0],
              value: a[1]
            });
          }

          // Set custom attributes on the svg.
          var elem;
          var groups = svg.find('g');
          for (var i = 0; i < groups.length; i++) {
            elem = angular.element(groups[i]);
            for (var j = 0; j < svgAttrs.length; j++) {
              if (elem.attr(svgAttrs[j].key)) {
                elem.attr(svgAttrs[j].key, svgAttrs[j].value);
              }
            }
          }

          // Remove invalid attributes.
          svg = svg.removeAttr('xmlns:a');

          // Replace img tag with svg.
          element.replaceWith(svg);
        });

        scope.$on('$destroy', function() {
          if (svg) {
            svg.remove();
          }
        });
      }
    };
  });
    