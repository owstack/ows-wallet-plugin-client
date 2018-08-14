'use strict';

angular.module('owsWalletPluginClient.api').factory('Servlet', function (lodash, ApiMessage,
  /* @namespace owsWalletPluginClient.api */ ApiError) {

  /**
   * Servlet
   */

  /**
   * Constructor.  An instance of this class must be obtained from Session.
   * @param {Object} servletObj - An internal Plugin object.
   * @param {String} sessionId - This applets session id.
   * @return {Object} An instance of Servlet.
   * @constructor
   */
  function Servlet(servletObj, sessionId) {
    lodash.assign(this, servletObj);
    this.sessionId = sessionId;
    return this;
  };

  /**
   * Set the run-in-background state for th servlet.
   * @return {Promise} A promise at completion.
   */
  Servlet.prototype.runInBackground = function(state) {
    var request = {
      method: 'POST',
      url: '/plugin/preferences',
      data: {
        runInBackground: state
      }
    };

    return new ApiMessage(request).send().then(function() {
      return;

    }).catch(function(error) {
      throw new ApiError(error);

    });
  };

  return Servlet;
});
