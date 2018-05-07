'use strict';

angular.module('owsWalletPluginClient').config(function($ionicConfigProvider) {

  // Ionic platform defaults. Plugin may override in their config block.
  $ionicConfigProvider.tabs.position('bottom');

  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.navBar.positionPrimaryButtons('left');
  $ionicConfigProvider.navBar.positionSecondaryButtons('right');

  $ionicConfigProvider.backButton.icon('icon ion-ios-arrow-left').text('');
  $ionicConfigProvider.backButton.previousTitleText(false);

  $ionicConfigProvider.scrolling.jsScrolling(false);

}).run(function($rootScope, $log, ApiMessage, CSession) {

	var START_URL = '/start';

  // Start the plugin and get our session object.
  start().then(function(error) {
  	if (!error) {
		  // Get the session object and fire the '$pre.ready' event.
		  CSession.getInstance();
  	}
  });

  // Start communication with the host app.
  function start() {
    var request = {
     method: 'POST',
     url: START_URL,
     data: {}
    }

	  var state = {
	    statusCode: 100,
	    statusText: 'Initializing'
	  };

    return new ApiMessage(request).send().then(function(response) {
      $log.info('[client] START: ' + response.statusText + ' (' + response.statusCode + ')');

      state = {
        statusCode: response.statusCode,
        statusText: response.statusText
      };

      if (response.data.isCordova) {
      	setupForCordova();
      }

      $rootScope.$emit('$pre.start', state);

      return;

    }).catch(function(error) {
      $log.error('[client] START ERROR: ' + error.message + ' (' + error.statusCode + ')');

      state = {
        statusCode: error.statusCode,
        statusText: error.message
      };

      $rootScope.$emit('$pre.start', state);

      return state;
    });
  };

	// Tells ionic that we are running in a Cordova container. Ionic doesn't set this because we are not the root document.
  function setupForCordova() {
    angular.element(document.querySelector('body')).addClass('platform-cordova');
    angular.element(document.querySelector('ion-nav-view')).css('width', window.innerWidth + 'px');
  };

});
