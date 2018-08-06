'use strict';

angular.module('owsWalletPluginClient.api').factory('Session', function ($rootScope, lodash, apiHelpers, ApiMessage,
  /* @namespace owsWalletPluginClient.api */ Applet,
  /* @namespace owsWalletPluginClient.api */ ApiError,
  /* @namespace owsWalletPluginClient.api */ Servlet,
  /* @namespace owsWalletPluginClient.api */ Wallet) {

  /**
   * Session
   *
   * This class provides session functionality including reading and writing persistent data. An instance of
   * this class should be obtained by calling Session.getInstance().
   */

   var instance;

  /**
   * Constructor.
   * @return {Object} The single instance of Session.
   * @constructor
   */
  function Session() {
    var self = this;

    if (instance) {
      return instance;
    }
    instance = self;

    return getSession().then(function(response) {
      // Assign the session data to ourself.
      lodash.assign(self, response.data);

      switch (self.plugin.header.kind) {
        case 'applet': self.plugin = new Applet(self.plugin, self.id); break;
        case 'servlet': self.plugin = new Servlet(self.plugin, self.id); break;
      };

      $rootScope.$emit('Local/Initialized', 'session');
      return self;
    
    }).catch(function(error) {
      throw new ApiError(error);

    });

    // Get our session data.
    function getSession() {
      var request = {
       method: 'GET',
       url: '/session/' + apiHelpers.sessionId()
      };

      return new ApiMessage(request).send();
    };
  };

  /**
   * Get the single session object or create the session.
   * @return {Object} The single session object.
   */
  Session.getInstance = function() {
    return instance || new Session();
  };

 /**
   * Close this session and necessarily shutdown the plugin.
   * @param {Object} opts - Options during close.
   * @return {Promise} A promise at completion.
   *
   * opts = {
   *   confirm: <boolean>
   * };
   */
  Session.prototype.close = function(opts) {
    var request = {
      method: 'DELETE',
      url: '/session/' + this.header.id,
      data: {
        opts: opts
      }
    };

    return new ApiMessage(request).send().then(function() {
      // No response will be received or expected; the plugin will shutdown.

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  /**
   * Write all session data to persistent storage.
   * @return {Promise} A promise at completion.
   */
  Session.prototype.flush = function() {
    var request = {
      method: 'POST',
      url: '/session/flush',
      data: {}
    };

    return new ApiMessage(request).send().then(function(response) {
      return response;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  /**
   * Restore all session data from persistent storage. A 'data' property is created on the session.
   * @return {Promise} A promise at completion with param 'data' or an error.
   */
  Session.prototype.restore = function() {
    var self = this;
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/restore',
      data: {}
    };

    return new ApiMessage(request).send().then(function(response) {
      self.data = {};
      lodash.assign(self.data, response);
      return response;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  /**
   * Retrieve session data by name.
   * @param {String} name - User specified data name defined using set(name, value).
   * @return {Promise<Object>} A promise for stored value.
   */
  Session.prototype.getValue = function(name) {
    var self = this;
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/var/' + name
    };

    return new ApiMessage(request).send().then(function(response) {
      self[name] = {};
      lodash.assign(self[name], response.data);
      return response.data;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  /**
   * Set session data by name. A 'data' property is created on the session.
   * @param {String} name - Location to store the specified value.
   * @param {Object} value - The data value to store.
   * @return {Promise} A promise at completion with param 'value' or an error.
   */
  Session.prototype.setValue = function(name, value) {
    var self = this;
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/var/' + name,
      data: value
    };

    return new ApiMessage(request).send().then(function(response) {
      self.data = self.data || {};
      self.data[name] = response.data;
      return response.data;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  /**
   * Remove session data by name.
   * @param {String} name - Location to store the specified value.
   * @return {Promise} A promise at completion.
   */
  Session.prototype.removeValue = function(name) {
    var self = this;
    var request = {
      method: 'DELETE',
      url: '/session/' + this.id + '/var/' + name
    };

    return new ApiMessage(request).send().then(function(response) {
      return response.data;

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  /**
   * Broadcast an event to any interesteed listener; either the host app or another plugin. For routing, this event is
   * re-broadcast to all plugins from from the host app. This function does not return any value; sent events do not provide
   * feedback about delivery.
   * @param {String} eventName - The name of the event being sent, should be listened for by receivers wanting to receive this event.
   * @param {Object} value - The event data payload.
   */
  Session.prototype.broadcastEvent = function(eventName, eventData) {
    var request = {
      method: 'POST',
      url: '/event',
      data: {
        name: eventName,
        data: eventData
      }
    };

    return new ApiMessage(request).send();
  };

  /**
   * Prompts the user to choose a wallet from a wallet chooser UI. The selected wallet is returned as a new Wallet instance.
   * @return {Wallet} An instance of the chosen Wallet.
   */
  Session.prototype.chooseWallet = function() {
    var self = this;
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/choosewallet',
      opts: {
        timeout: -1
      }
    };

    return new ApiMessage(request).send().then(function(response) {
      return new Wallet(response.data);

    }).catch(function(error) {
      throw new ApiError(error);
      
    });
  };

  return Session;
});
