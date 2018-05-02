'use strict';

angular.module('owsWalletPluginClient.api').factory('CContext', function (pluginClientService) {

  /**
   * CContext
   *
   * This class provides the base context for bootstrapping an applet by retrieving and creating 
   * the session object.
   */

  /**
   * Constructor.
   * @return {CContext} An instance of CContext.
   * @constructor
   */
  function CContext() {
    throw new Error('CContext is a static class');
  };

  /**
   * Return the applet session.
   * @return {Promise<CSession>} A promise to the session.
   * @static
   */
  CContext.getSession = function() {
    var request = {
     method: 'GET',
     url: '/session/' + sessionId(),
     responseObj: 'CSession'
    }
    return pluginClientService.sendMessage(request);
  };

  /**
   * Get the sessionId from the URL.
   * @return {string} The seesion id.
   * @private
   */
  function sessionId() {
    var sessionId = window.location.search.substring(window.location.search.indexOf('sessionId=') + 10);
    if (sessionId.indexOf('&') >= 0) {
      sessionId = sessionId.substring(0, sessionId.indexOf('&'));
    }
    return sessionId;
  };

  return CContext;
});
