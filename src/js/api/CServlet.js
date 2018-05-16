'use strict';

angular.module('owsWalletPluginClient.api').factory('CServlet', function (lodash) {

  /**
   * CServlet
   *
   * Provides access to servlet behavior. An instance of this class should be obtained from the
   * CSession instance.
   */

  /**
   * Constructor.  An instance of this class must be obtained from CSession.
   * @param {Object} plugin - An internal plugin object.
   * @return {Object} An instance of CServlet.
   * @constructor
   */
  function CServlet(servletObj) {
    lodash.assign(this, servletObj);
    return this;
  };

  return CServlet;
});
