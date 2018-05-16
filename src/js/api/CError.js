'use strict';

angular.module('owsWalletPluginClient.api').factory('CError', function (lodash) {

  /**
   * CError
   *
   * Provides a wrapper for messages coming from the host app.
   */

  /**
   * Constructor.
   * @return {CError} An instance of CError.
   * @constructor
   *
   * errorObj: {
   *   code: <number>
   *   source: <string>
   *   message: <string>
   *   detail: <string>
   * }
   */
  function CError(errorObj) {
    lodash.assign(this, errorObj);
    return this;
  };

  return CError;
});
