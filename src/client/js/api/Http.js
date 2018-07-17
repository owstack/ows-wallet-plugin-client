'use strict';

angular.module('owsWalletPluginClient.api').factory('Http', function ($log, lodash, $http, $window) {

  /**
   * Http
   *
   * Provides a wrapper for $http.
   */

  /**
   * Constructor.
   * @return {Http} An instance of Http.
   * @constructor
   */
  function Http(url, config, recoveryHandler) {
    var self = this;
    this.url = url.toLowerCase();
    this.config = config;

    var retries = [];

    validate();

    /**
     * Make an HTTP GET request.
     * @param {String} endpoint - The URI to the resource.
     * @return {Promise<Object>} A promise for the response.
     */
    this.get = function(endpoint) {
      return new Promise(function(resolve, reject) {
        var url = encodeURI(self.url + endpoint);

        $log.debug('GET ' + url);

        doGet(url, self.config).then(function(response) {
          $log.debug('GET SUCCESS: ' + JSON.stringify(response));
          resolve(response);

        }).catch(function(error) {
          $log.error('GET ERROR: ' + url + ', ' + JSON.stringify(error));

          var retryKey = 'GET' + endpoint;
          if (recoveryHandler  && !retries.includes(retryKey)) {
            // Execute the recoveryHandler and retry the GET request up to one time.
            recoveryHandler(error).then(function() {

              retries.push(retryKey);
              return self.get(endpoint); // Retry request.

            }).catch(function(error) {
              lodash.pull(retries, retryKey);
              reject(error);
            });

          } else {
            reject(error);
          }

        });
      });
    };

    /**
     * Make an HTTP POST.
     * @param {String} endpoint - The URI to the resource.
     * @param {Object} data - The data object to post.
     * @return {Promise<Object>} A promise for the response.
     */
    this.post = function(endpoint, data) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var url = encodeURI(self.url + endpoint);

        $log.debug('POST ' + url + ' ' + JSON.stringify(data));

        doPost(url, data, self.config).then(function(response) {
          $log.debug('POST SUCCESS: ' + url + ' ' + JSON.stringify(response));
          resolve(response);

        }).catch(function(error) {
          $log.error('POST ERROR: ' + url + ', ' + JSON.stringify(error));

          var retryKey = 'POST' + endpoint;
          if (recoveryHandler && !retries.includes(retryKey)) {
            // Execute the recoveryHandler and retry the POST request up to one time.
            recoveryHandler(error).then(function() {
              retries.push(retryKey);
              return self.post(endpoint, data); // Retry request.

            }).catch(function(error) {
              lodash.pull(retries, retryKey);
              reject(error);
            });

          } else {
            lodash.pull(retries, retryKey);
            reject(error);
          }

        });
      });
    };

    /*
     * Private functions
     */

    var doGet = $http.get;
    var doPost = $http.post;

    // On Cordova platform use the cordova-plugin-http to avoid WkWebView preflight.
    // See https://github.com/ionic-team/cordova-plugin-ionic-webview/issues/70
    //
    // Promisify cordova-plugin-http calls and handle i/o to match Angular $http interface.
    if (owswallet.Plugin.isCordova()) {

      doGet = function(url, config) {
        return new Promise(function(resolve, reject) {
          $window.top.cordova.plugin.http.get(url, null, config.headers, function success(response) {
            response.data = JSON.parse(response.data);
            resolve(response);
           }, function failure(response) {
            response.data = JSON.parse(response.error);
            reject(response);
           });
        });
      };

      doPost = function(url, data, config) {
        return new Promise(function(resolve, reject) {
          $window.top.cordova.plugin.http.setDataSerializer('json');
          $window.top.cordova.plugin.http.post(url, data, config.headers, function success(response) {
            response.data = JSON.parse(response.data);
            resolve(response);
           }, function failure(response) {
            response.data = JSON.parse(response.error);
            reject(response);
           });
        });
      };

    }

    function validate() {
    	// Check format for url.
      // Matches http(s)://<domain>.<tld>:<port>
      //
      // where,
      //   domain - 2+ character string up to last '.', can include '-'
      //   tld - matches 2-63 character string after last '.'
      //   port - matches 1-5 numerals
      //   Does not match query params
	    if (!self.url.match(/(http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,63}(:[0-9]{1,5})?(\/[a-z0-9\/]*)?/g)) {
	    	throw new Error('Invalid URL for Http() \'' + self.url + '\'');
	    }

	    // Append a '/' is not present.
	    if (self.url.slice(-1) != '/') {
	    	self.url += '/';
	    }
    };

    return this;
  };

  /**
   * Create a GUID.
   * @return {String} A GUID string value.
   */
  Http.guid = function() {
    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    return uuidv4();
  };

  return Http;
});
