'use strict';

angular.module('owsWalletPluginClient.api').factory('ApiError', function ($log, lodash) {

  /**
   * ApiError
   *
   * Provides a wrapper for messages coming from the host app.
   */

  /**
   * Constructor.
   * @return {ApiError} An instance of ApiError.
   * @constructor
   *
   * errorObj: {
   *   code: <number>
   *   source: <string>
   *   message: <string>
   *   detail: <string>
   * }
   *
   * code - a numeric error code, e.g., HTTP status code
   * source - the source of the error, e.g., a url
   * message - machine readable error message
   * detail = human readable error message
   */
  function ApiError(errorObj) {
    errorObj.code = errorObj.code || 500;
    errorObj.source = errorObj.source || 'unknown source';
    errorObj.message = errorObj.message || 'UNKNOWN_ERROR';
    errorObj.detail = errorObj.detail || 'An unspecified error has occured.';

    lodash.assign(this, errorObj);
    $log.error('(' + this.code + ') '+ this.source + ' - ' + this.message + ': \'' + this.detail + '\'');
    return this;
  };

  return ApiError;
});
