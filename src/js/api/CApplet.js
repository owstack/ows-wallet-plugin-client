'use strict';

angular.module('owsWalletPluginClient.api').factory('CApplet', function (lodash) {

  /**
   * CApplet
   *
   * Provides access to applet behavior. An instance of this class should be obtained from the
   * CSession instance.
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
   * Constructor.  An instance of this class must be obtained from CSession.
   * @param {Applet} applet - An internal Applet object.
   * @return {Object} An instance of CApplet.
   * @constructor
   */
  function CApplet(appletObj) {
    lodash.assign(this, appletObj);
    return this;
  };

  /**
   * Initialize a plugin service.
   * @param {String} pluginId - The plugin ID that identifies a registered service.
   * @return {Promise<Object>} A promise for the specified service object.
   */
  CApplet.prototype.initService = function(pluginId) {
    var request = {
      method: 'POST',
      url: '/applet/' + this.header.id + '/service/' + pluginId + '/init',
      data: {}
    }

    return new ApiMessage(request).send();
  };

  /**
   * Hides the splash image after starting.
   * @return {Promise} A promise at completion.
   */
  CApplet.prototype.hideSplash = function() {
    var request = {
      method: 'POST',
      url: '/applet/' + this.header.id + '/config',
      data: {
        showSplash: false
      }
    }

    return new ApiMessage(request).send();
  };

  return CApplet;
});
