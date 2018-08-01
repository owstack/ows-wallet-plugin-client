'use strict';

angular.module('owsWalletPluginClient.api').factory('Servlet', function (lodash) {

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

  return Servlet;
});
