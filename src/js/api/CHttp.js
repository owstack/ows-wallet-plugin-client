'use strict';

angular.module('owsWalletPluginClient.api').factory('CHttp', function (apiLog, lodash, $http) {

  /**
   * CHttp
   *
   * Provides a wrapper for $http.
   */

	var REQUIRED_CONFIG = [
		'url'
	];

  /**
   * Constructor.
   * @return {CHttp} An instance of CHttp.
   * @constructor
   */
  function CHttp(config) {
  	checkRequiredConfig();
  	validateConfig();

    lodash.assign(this, config);

    // Private functions
    //
    function checkRequiredConfig() {
	    var validRequest = Object.keys(lodash.pick(data, REQUIRED_CONFIG)).length == REQUIRED_CONFIG.length;

	    if (!validRequest) {
	  		throw new Error('Missing required arguments for CHttp, you must include \'' + REQUIRED_PARAMS.toString() + '\'');
	  	}
	  };

    function validateConfig() {
    	// Check format for url.
	    if (!this.url.match(/^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/g)) {
	    	throw new Error('Invalid URL for CHttp \'' + this.url + '\'');
	    }

	    // Append a '/' is not present.
	    if (this.url.slice(-1) != '/') {
	    	this.url += '/';
	    }
    };

    return this;
  };

  /**
   * Create a GUID.
   * @return {String} A GUID string value.
   */
  CHttp.prototype.guid = function() {
    return Date.now().toString();
  };

  /**
   * Make an HTTP GET request.
   * @param {String} endpoint - The URI to the resource.
   * @return {Promise<Object>} A promise for the response.
   */
  CHttp.prototype.get = function(endpoint) {
  	return new Promise(function(resolve, reject) {
	    apilog.debug('GET ' + encodeURI(this.url + endpoint));

	    var getData = {
	      method: 'GET',
	      url: encodeURI(this.url + endpoint),
	      headers: {
	        'Content-Type': 'application/json',
	        'Accept': 'application/json'
	      }
	    };

	    $http(getData).then(function(response) {
	      apiLog.debug('GET SUCCESS: ' + endpoint);
	      resolve(response);

	    }).catch(function(error) {
	      apiLog.error('GET ERROR: ' + endpoint + ', ' + error.statusText);
	      reject(error.statusText);

	    });
	  });
  };

  /**
   * Make an HTTP POST.
   * @param {String} endpoint - The URI to the resource.
   * @param {Object} data - The data object to post.
   * @return {Promise<Object>} A promise for the response.
   */
  CHttp.prototype.post = function(endpoint, data) {
  	return new Promise(function(resolve, reject) {
	    apiLog.debug('POST ' + encodeURI(this.url + endpoint) + ' data = ' + JSON.stringify(data));

	    var postData = {
	      method: 'POST',
	      url: encodeURI(this.url + endpoint),
	      headers: {
	        'Content-Type': 'application/json',
	        'Accept': 'application/json'
	      },
	      data: data
	    };

	    $http(postData).then(function(response) {
	      apiLog.deebug('POST SUCCESS: ' + endpoint);
	      resolve(response);

	    }).catch(function(error) {
	      apiLog.error('POST ERROR: ' + endpoint + ', ' + error.statusText);
	      reject(error.statusText);

	    });
    });
  };

  return CHttp;
});
