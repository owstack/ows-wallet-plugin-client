'use strict';

angular.module('owsWalletPluginClient.api').factory('Servlet', function (lodash) {

  /**
   * Servlet
   */

  /**
   * Constructor.  An instance of this class must be obtained from Session.
   * @param {Object} plugin - An internal plugin object.
   * @return {Object} An instance of Servlet.
   * @constructor
   */
  function Servlet(servletObj) {
    lodash.assign(this, servletObj);
    return this;
  };

  return Servlet;
});
