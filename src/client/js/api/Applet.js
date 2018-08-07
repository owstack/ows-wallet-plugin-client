'use strict';

angular.module('owsWalletPluginClient.api').factory('Applet', function (lodash, ApiMessage,
  /* @namespace owsWalletPluginClient.api */ ApiError) {

  /**
   * Applet
   */

   /**
   * Applet Events
   * -------------
   * 
   * Each of the following events provide the following arguments to the subscriber:
   *   appletObj - the subject Applet object
   *   walletId - the wallet identifier on which the applet is presented
   * 
   * '$pre.beforeEnter' - broadcast when opening an applet, before the applet is shown
   * '$pre.afterEnter' - broadcast when opening an applet, after the applet is shown
   * '$pre.beforeLeave' - broadcast when closing an applet, before before the applet is hidden
   * '$pre.afterLeave' - broadcast when closing an applet, after the applet is hidden
   */

  /**
   * Constructor.  An instance of this class must be obtained from Session.
   * @param {Object} appletObj - An internal Plugin object.
   * @param {String} sessionId - This applets session id.
   * @return {Object} An instance of Applet.
   * @constructor
   */
  function Applet(appletObj, sessionId) {
    lodash.assign(this, appletObj);
    this.sessionId = sessionId;
    return this;
  };

  /**
   * Show the applet. This call starts visible presentation.
   * @return {Promise} A promise at completion.
   */
  Applet.prototype.show = function() {
    var request = {
      method: 'PUT',
      url: '/applet/show',
      data: {
        sessionId: this.sessionId
      }
    };

    return new ApiMessage(request).send().then(function() {
      return;

    }).catch(function(error) {
      // Error logged
    });
  };

  /**
   * Hide the splash screen, if presented.
   * @return {Promise} A promise at completion.
   */
  Applet.prototype.hideSplash = function() {
    var request = {
      method: 'DELETE',
      url: '/applet/splash',
      data: {
        sessionId: this.sessionId
      }
    };

    return new ApiMessage(request).send().then(function(response) {
      return;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  return Applet;
});
