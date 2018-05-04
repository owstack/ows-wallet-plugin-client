'use strict';

angular.module('owsWalletPluginClient.api').factory('CError', function (lodash) {

  /**
   * CError
   *
   * Provides a wrapper for API error response messages coming from the host app.
   */

  /**
   * Constructor.
   * @return {CError} An instance of CError.
   * @constructor
   */
  function CError(message) {
    lodash.assign(this, message);

    this.statusCode = this.response.statusCode;
    this.message = this.response.statusText;

    return this;
  };

  return CError;
});
