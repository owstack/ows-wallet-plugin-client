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
    
'use strict';

angular.module('owsWalletPluginClient.filters', []).filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];

    angular.forEach(items, function(item) {
      filtered.push(item);
    });

    filtered.sort(function(a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });

    if (reverse) {
      filtered.reverse();
    }
    return filtered;
  };
});

'use strict';

angular.module('owsWalletPluginClient.services').service('externalLinkService', function(nodeWebkitService, popupService, gettextCatalog, $window, $log, $timeout) {

	var root = {};
  var isNodeWebKit;

  owswallet.Plugin.ready(function(){
    isNodeWebKit = owswallet.Plugin.isNodeWebKit();
  });

  root.open = function(url, optIn, title, message, okText, cancelText) {
    var old = $window.handleOpenURL;

    $window.handleOpenURL = function(url) {
      // Ignore external URLs
      $log.debug('Skip: ' + url);
    };

    if (isNodeWebKit) {
      nodeWebkitService.openExternalLink(url);
      restoreHandleOpenURL(old);
    } else {
      if (optIn) {
        popupService.showConfirm(title, message, okText, cancelText, function(res) {
          if (res) {
            window.open(url, '_system');
          }
          restoreHandleOpenURL(old);
        });
      } else {
        window.open(url, '_system');
        restoreHandleOpenURL(old);
      }
    }
  };

  function restoreHandleOpenURL(old) {
    $timeout(function() {
      $window.handleOpenURL = old;
    }, 500);
  };

  return root;
});

'use strict';

angular.module('owsWalletPluginClient.services').service('nodeWebkitService', function() {

	var root = {};

  root.readFromClipboard = function() {
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();
    return clipboard.get();
  };

  root.writeToClipboard = function(text) {
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();
    return clipboard.set(text);
  };

  root.openExternalLink = function(url) {
    var gui = require('nw.gui');
    return gui.Shell.openExternal(url);
  };

  return root;
});

'use strict';

angular.module('owsWalletPluginClient.services').service('popupService', function($log, $ionicPopup, $timeout, gettextCatalog, lodash) {

  var isCordova;
  
  owswallet.Plugin.ready(function() {
    isCordova = owswallet.Plugin.isCordova();
  });

  /*************** Ionic ****************/

  var _ionicAlert = function(title, message, cb, okText) {
    cb = cb || function() {};
    $ionicPopup.alert({
      title: title,
      subTitle: message,
      okType: 'button-clear button-primary',
      okText: okText || gettextCatalog.getString('OK'),
    }).then(cb);
  };

  var _ionicConfirm = function(title, message, okText, cancelText, cb) {
    cb = cb || function() {};
    $ionicPopup.confirm({
      title: title,
      subTitle: message,
      cancelText: cancelText,
      cancelType: 'button-clear button-secondary',
      okText: okText,
      okType: 'button-clear button-primary'
    }).then(function(res) {
      return cb(res);
    });
  };

  var _ionicPrompt = function(title, message, opts, cb) {
    opts = opts || {};
    cb = cb || function() {};
    $ionicPopup.prompt({
      title: title,
      subTitle: message,
      cssClass: opts.class,
      template: '<input ng-model="data.response" type="' + opts.inputType + '" value ="" autocomplete="off" autofocus>',
      inputPlaceholder: opts.inputPlaceholder,
      defaultText: opts.defaultText
    }).then(function(res) {
      return cb(res);
    });
  };

  /*************** Cordova ****************/

  var _cordovaAlert = function(title, message, cb, okText) {
    cb = cb || function() {};
    title = title || '';
    okText = okText || gettextCatalog.getString('OK');
    navigator.notification.alert(message, cb, title, okText);
  };

  var _cordovaConfirm = function(title, message, okText, cancelText, cb) {
    cb = cb || function() {};
    var onConfirm = function(buttonIndex) {
      if (buttonIndex == 2) {
        return cb(true);
      } else {
        return cb(false);
      }
    }
    okText = okText || gettextCatalog.getString('OK');
    cancelText = cancelText || gettextCatalog.getString('Cancel');
    title = title || '';
    navigator.notification.confirm(message, onConfirm, title, [cancelText, okText]);
  };

  var _cordovaPrompt = function(title, message, opts, cb) {
    cb = cb || function() {};
    var onPrompt = function(results) {
      if (results.buttonIndex == 1) {
        return cb(results.input1);
      } else {
        return cb();
      }
    }
    var okText = gettextCatalog.getString('OK');
    var cancelText = gettextCatalog.getString('Cancel');
    title = title || '';
    navigator.notification.prompt(message, onPrompt, title, [okText, cancelText], opts.defaultText);
  };

  /**
   * Show a simple alert popup
   *
   * @param {String} Title (optional)
   * @param {String} Message
   * @param {Callback} Function (optional)
   */

  this.showAlert = function(title, message, cb, okText) {
    title = (lodash.isEmpty(title) ? '' : title);
    message = (lodash.isEmpty(message) ? '' : message);

    var msg = (message && message.message) ? message.message : msg;
    $log.warn(title ? (title + ': ' + message) : message);

    if (isCordova) {
      _cordovaAlert(title, message, cb, okText);
    } else {
      _ionicAlert(title, message, cb, okText);
    }
  };

  /**
   * Show a simple confirm popup
   *
   * @param {String} Title (optional)
   * @param {String} Message
   * @param {String} okText (optional)
   * @param {String} cancelText (optional)
   * @param {Callback} Function
   * @returns {Callback} OK: true, Cancel: false
   */

  this.showConfirm = function(title, message, okText, cancelText, cb) {
    title = (lodash.isEmpty(title) ? '' : title);
    message = (lodash.isEmpty(message) ? '' : message);

    $log.warn(title ? (title + ': ' + message) : message);

    if (isCordova) {
      _cordovaConfirm(title, message, okText, cancelText, cb);
    } else {
      _ionicConfirm(title, message, okText, cancelText, cb);
    }
  };

  /**
   * Show a simple prompt popup
   *
   * @param {String} Title (optional)
   * @param {String} Message
   * @param {Object} Object{ inputType, inputPlaceholder, defaultText } (optional)
   * @param {Callback} Function
   * @returns {Callback} Return the value of the input if user presses OK
   */

  this.showPrompt = function(title, message, opts, cb) {
    title = (lodash.isEmpty(title) ? '' : title);
    message = (lodash.isEmpty(message) ? '' : message);

    $log.warn(title ? (title + ': ' + message) : message);
    opts = opts ||  {};

    if (isCordova && !opts.forceHTMLPrompt) {
      _cordovaPrompt(title, message, opts, cb);
    } else {
      _ionicPrompt(title, message, opts, cb);
    }
  };

});
