'use strict';

angular.module('owsWalletPluginClient.api').factory('CEnvironment', function ($log, CContext) {

  /**
   * CEnvironment
   *
   * This class provides a singleton object with reference to the complete applet runtime environment
   * including session and applet oebjects.
   */

  var instance;

  /**
   * Constructor. This is a singleton class. An instance may be obtained using either
   *   var env = new CEnvironment();
   *   var env - CEnvironment.getInstance();
   *
   * @return {Object} The single instance of CEnvironment.
   * @constructor
   */
  function CEnvironment() {
  	var self = this;

		if (instance) {
    	return instance;
    }
    instance = self;

    CContext.getSession().then(function(session) {
      self.session = session;
      return self.session.getApplet();

    }).catch(function(error) {
      $log.error("Failed to get session: " + error.message + ' (' + error.statusCode + ')');
      throw error;

    }).then(function(applet) {
      self.applet = applet;

    }).catch(function(error) {
      $log.error("Failed to Initialize: " + error.message + ' (' + error.statusCode + ')');
    });
  };

  /**
   * Return the single instance of this class.
   * @return {CEnvironment} The single instance of this class.
   */
  CEnvironment.getInstance = function() {
    return instance || new CEnvironment();
  };

  return CEnvironment;
});
