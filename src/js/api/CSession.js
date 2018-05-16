'use strict';

angular.module('owsWalletPluginClient.api').factory('CSession', function ($rootScope, lodash, apiHelpers, apiLog, ApiMessage, CApplet, CServlet, CError, CWallet) {

  /**
   * CSession
   *
   * This class provides session functionality including reading and writing persistent data. An instance of
   * this class should be obtained by calling CSession.getInstance().
   */

   var instance;

  /**
   * Constructor.
   * @return {Object} The single instance of CSession.
   * @constructor
   */
  function CSession() {
    var self = this;

    if (instance) {
      return instance;
    }
    instance = this;

    getSession().then(function(sessionObj) {
      // Assign the session data to ourself.
      lodash.assign(self, sessionObj);

      switch (self.plugin.header.kind) {
        case 'applet': self.plugin = new CApplet(self.plugin); break;
        case 'servlet': self.plugin = new CServlet(self.plugin); break;
      };

      $rootScope.$emit('Local/Initialized', 'session');
    
    }).catch(function(error) {
      apiLog.error('CSession(): ' + JSON.stringify(error));

    });

    // Get our session data.
    function getSession() {
      var request = {
       method: 'GET',
       url: '/session/' + apiHelpers.sessionId(),
       responseObj: {}
      }

      return new ApiMessage(request).send();
    };

    return this;
  };

  /**
   * Get the single session object or create the session.
   * @return {Object} The single session object.
   */
  CSession.getInstance = function() {
    return instance || new CSession();
  };

  /**
   * Write all session data to persistent storage.
   * @return {Promise} A promise at completion.
   */
  CSession.prototype.flush = function() {
    var request = {
      method: 'POST',
      url: '/session/flush',
      data: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      return repsonse;

    }).catch(function(error) {
      apiLog.error('CSession.flush():' + JSON.stringify(error));
      
    });
  };

  /**
   * Retrieve session data by name.
   * @param {String} name - User specified data name defined using set(name, value).
   * @return {Promise<Object>} A promise for stored value.
   */
  CSession.prototype.get = function(name) {
    var self = this;
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/var/' + name,
      responseObj: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      self[name] = {};
      lodash.assign(self[name], response);
      return repsonse;

    }).catch(function(error) {
      apiLog.error('CSession.get(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Restore all session data from persistent storage. A 'data' property is created on the session.
   * @return {Promise} A promise at completion with param 'data' or an error.
   */
  CSession.prototype.restore = function() {
    var self = this;
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/restore',
      data: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      self.data = {};
      lodash.assign(self.data, response);
      return response;

    }).catch(function(error) {
      apiLog.error('CSession.restore(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Set session data by name. A 'data' property is created on the session.
   * @param {String} name - Location to store the specified value.
   * @param {Object} value - The data value to store.
   * @return {Promise} A promise at completion with param 'value' or an error.
   */
  CSession.prototype.set = function(name, value) {
    var self = this;
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/var/' + name,
      data: value
    }

    return new ApiMessage(request).send().then(function(response) {
      self.data = self.data || {};
      lodash.merge(self.data, response);
      return response;

    }).catch(function(error) {
      apiLog.error('CSession.set(): ' + JSON.stringify(error));
      
    });
  };

  /**
   * Prompts the user to choose a wallet from a wallet chooser UI. The selected wallet is returned as a new CWallet instance.
   * @return {CWallet} An instance of the chosen CWallet.
   * @static
   */
  CSession.prototype.chooseWallet = function() {
    var self = this;
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/choosewallet',
      responseObj: 'CWallet',
      opts: {
        timeout: -1
      }
    }

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      apiLog.error('CSession.chooseWallet(): ' + JSON.stringify(error));
      
    });
  };

  return CSession;
});
