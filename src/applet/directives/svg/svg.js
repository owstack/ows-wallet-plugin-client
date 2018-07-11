'use strict';

/**
 * Replaces img tag with its svg content to allow for CSS styling of the svg.
 */
angular.module('owsWalletPluginClient.directives').directive('svg', function($http, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var imgId = attrs.id;
      var imgClass = attrs.class;
      var imgUrl = attrs.src || attrs.ngSrc;
      var loadedUrl;
      var svg;

      element.addClass('ng-hide');
      loadSVG(imgUrl);

      scope.$watch(function() {
          return element.attr('ng-src');
      }, function(imgUrl) {
        loadSVG(imgUrl);
      });

      scope.$on('$destroy', function() {
        if (svg) {
          svg.remove();
        }
      });

      function loadSVG(imgUrl) {
        // If the controller has not yet loaded an image then force load a blank image.
        // This prevents a 404 fetch error on a bad image url (the expression).
        if (imgUrl) {
          // Don't load the same image more than once.
          if (loadedUrl != imgUrl) {
            loadedUrl = imgUrl;
            $http.get(imgUrl).success(function(data, status) {
              doLoad(data);
            });
          }
        } else {
          doLoad(blankSVG);
        }

        function doLoad(data) {
          if (svg) {
            svg.remove();
          }

          // Allow possible svg to be removed from DOM.
          $timeout(function() {
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
            // Allows attribute values to be set dynamically (e.g., fill color).
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

            // Add svg after the img tag.
            element.after(svg);
          });
        };

        function blankSVG() {
          return '\
            <?xml version="1.0" encoding="UTF-8"?>\
            <svg width="80px" height="80px" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
              <!-- Generator: sketchtool 47.1 (45422) - http://www.bohemiancoding.com/sketch -->\
              <title>img/icon-blank</title>\
              <desc>Created with sketchtool.</desc>\
              <defs></defs>\
              <g id="Applet-images" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                <g id="img/icon-blank">\
                  <g id="blank"></g>\
                </g>\
              </g>\
            </svg>\
          '
        };
      };
    }
  };
});
  