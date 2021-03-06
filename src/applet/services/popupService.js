'use strict';

angular.module('owsWalletPluginClient.services').service('popupService', function($log, $ionicPopup, $timeout, $window, gettextCatalog, lodash) {

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
    $window.top.navigator.notification.alert(message, cb, title, okText);
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
    $window.top.navigator.notification.confirm(message, onConfirm, title, [cancelText, okText]);
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
    $window.top.navigator.notification.prompt(message, onPrompt, title, [okText, cancelText], opts.defaultText);
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
