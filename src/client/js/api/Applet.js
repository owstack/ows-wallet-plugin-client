'use strict';

angular.module('owsWalletPluginClient.api').factory('Applet', function (lodash) {

  /**
   * Applet
   *
   * Provides access to applet behavior. An instance of this class should be obtained from the
   * Session instance.
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
   * @param {Object} plugin - An internal Plugin object.
   * @return {Object} An instance of Applet.
   * @constructor
   */
  function Applet(appletObj) {
    lodash.assign(this, appletObj);
    return this;
  };

  /**
   * Hides the splash image after starting.
   * @return {Promise} A promise at completion.
   */
  Applet.prototype.hideSplash = function() {
    var request = {
      method: 'POST',
      url: '/applet/' + this.header.id + '/config',
      data: {
        showSplash: false
      }
    };

    return new ApiMessage(request).send();
  };

  return Applet;
});
