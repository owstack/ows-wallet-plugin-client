'use strict';

angular.module('owsWalletPluginClient.api').factory('ApiError', function (lodash) {

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
   */
  function ApiError(errorObj) {
    lodash.assign(this, errorObj);
    return this;
  };

  return ApiError;
});
