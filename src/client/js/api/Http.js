'use strict';

angular.module('owsWalletPluginClient.api').factory('Http', function ($log, lodash, $http, System) {

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
  function Http(url, config) {
    var self = this;
    this.url = url.toLowerCase();
    this.config = config;

    validate();

    // Private functions
    //
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
    return Date.now().toString();
  };

  /**
   * Make an HTTP GET request.
   * @param {String} endpoint - The URI to the resource.
   * @return {Promise<Object>} A promise for the response.
   */
  Http.prototype.get = function(endpoint) {
    var self = this;
  	return new Promise(function(resolve, reject) {
      var url = encodeURI(self.url + endpoint);

	    $log.debug('GET ' + url);

	    $http.get(url, self.config).then(function(response) {
	      $log.debug('GET SUCCESS: ' + JSON.stringify(response));
	      resolve(response);

	    }).catch(function(error) {
	      $log.error('GET ERROR: ' + url + ', ' + JSON.stringify(error));
	      reject(error);

	    });
	  });
  };

  /**
   * Make an HTTP POST.
   * @param {String} endpoint - The URI to the resource.
   * @param {Object} data - The data object to post.
   * @return {Promise<Object>} A promise for the response.
   */
  Http.prototype.post = function(endpoint, data) {
    var self = this;
  	return new Promise(function(resolve, reject) {
      var url = encodeURI(self.url + endpoint);

	    $log.debug('POST ' + url + ' ' + JSON.stringify(data));

	    $http.post(url, data, self.config).then(function(response) {
	      $log.debug('POST SUCCESS: ' + url + ' '+ JSON.stringify(response));
	      resolve(response);

	    }).catch(function(error) {
	      $log.error('POST ERROR: ' + url + ', ' + JSON.stringify(error));
	      reject(error);

	    });
    });
  };

  return Http;
});
