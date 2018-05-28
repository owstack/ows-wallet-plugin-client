'use strict';

angular.module('owsWalletPluginClient').config(function($provide, $logProvider, historicLogServiceProvider) {

	// Setup logging.
  $logProvider.debugEnabled(true);

  $provide.decorator('$log', ['$delegate', function($delegate) {
    var isCordova = isCordova();
    var historicLogService = historicLogServiceProvider.$get();

    historicLogService.getLevels().forEach(function(levelDesc) {
      var level = levelDesc.level;
      var orig = $delegate[level];

      $delegate[level] = function() {
        if (level == 'error') {
          console.log(arguments);
        }

        var args = Array.prototype.slice.call(arguments);

        args = args.map(function(v) {
          try {
            if (typeof v == 'undefined') {
            	v = 'undefined';
            }
            if (!v) {
            	v = 'null';
            }
            if (typeof v == 'object') {
              if (v.message) {
                v = v.message;
              }
              else {
                v = JSON.stringify(v);
              }
            }
            // Trim output in mobile.
            if (isCordova) {
              v = v.toString();
              if (v.length > 3000) {
                v = v.substr(0, 2997) + '...';
              }
            }
          } catch (e) {
            console.log('Error at log decorator:', e);
            v = 'undefined';
          }
          return v;
        });

        try {
          if (isCordova) {
            console.log(args.join(' '));
          }

          historicLogService.add(level, args.join(' '));
          orig.apply(null, args);
        } catch (e) {
          console.log('ERROR (at log decorator):', e, args[0]);
        }
      };
    });

    // Get the isCordova boolean from the URL.
    function isCordova() {
      var isCordova = window.location.search.substring(window.location.search.indexOf('isCordova=') + 10);
      if (isCordova.indexOf('&') >= 0) {
        isCordova = isCordova.substring(0, isCordova.indexOf('&'));
      }
      return (isCordova == 'true');
    };

    return $delegate;
  }]);

}).run(function(launchService) {

  // Just bump the launchService.

});
