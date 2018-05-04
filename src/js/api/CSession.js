'use strict';

angular.module('owsWalletPluginClient.api').factory('CSession', function ($rootScope, $log, lodash, ApiMessage, CApplet, CError) {

  /**
   * CSession
   *
   * This class provides session functionality including reading and writing persistent data. An instance of
   * this class should be obtained from the '$pre.ready' event or by calling CSession.getInstance().
   */

   var START_URL = '/start';
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

    var state = {
      statusCode: 100,
      statusText: 'Initializing'
    };

    start();

    /**
     * Private methods
     */

    function start() {
      var request = {
       method: 'POST',
       url: START_URL,
       data: {}
      }

      return new ApiMessage(request).send().then(function(response) {
        $log.info('[client] START: ' + response.statusText + ' (' + response.statusCode + ')');

        state = {
          statusCode: response.statusCode,
          statusText: response.statusText
        };

        $rootScope.$emit('$pre.start', state);

        }).catch(function(error) {
          $log.error('[client] START ERROR: ' + error.message + ' (' + error.statusCode + ')');

          state = {
            statusCode: error.statusCode,
            statusText: error.message
          };

          $rootScope.$emit('$pre.start', state);

        }).then(function() {
          return getSession();

        }).then(function(sessionObj) {
          // Assign the session data to ourself.
          lodash.assign(self, sessionObj);

          if (!self.id) {
            $log.error('[client] ERROR: unexpected response while retrieving session');
          }

          // Notify plugin that we're ready to run.
          $rootScope.$emit('$pre.ready', self);

        });
    };

    function getSession() {
      var request = {
       method: 'GET',
       url: '/session/' + sessionId(),
       responseObj: {}
      }

      return new ApiMessage(request).send();
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

    return this;
  };

  /**
   * Get the single session object or create the session.
   * @return {CSession} The single session object.
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
     url: '/session/flush'
    }

    return new ApiMessage(request).send();
  };

  /**
   * Retrieve session data by name.
   * @param {String} name - User specified data name defined using set(name, value).
   * @return {Promise<Object>} A promise for stored value.
   */
  CSession.prototype.get = function(name) {
    var request = {
     method: 'GET',
     url: '/session/' + this.id + '/var/' + name,
     responseObj: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      if (typeof response != 'CError') {
        self[name] = {};
        lodash.assign(self[name], response);
      }
      return repsonse;
    });
  };

  /**
   * Return the applet for this session. An 'applet' property is created on the session.
   * @return {Promise<CApplet>} A promise at completion with param 'applet' or an error.
   */
  CSession.prototype.getApplet = function () {
    var request = {
     method: 'GET',
     url: '/session/' + this.id + '/applet',
     responseObj: CApplet
    }

    return new ApiMessage(request).send().then(function(response) {
      if (typeof response != 'CError') {
        self.applet = {};
        lodash.assign(self.applet, response);
      }
      return response;
    });
  };

  /**
   * Restore all session data from persistent storage. A 'data' property is created on the session.
   * @return {Promise} A promise at completion with param 'data' or an error.
   */
  CSession.prototype.restore = function() {
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/restore',
      data: {}
    }

    return new ApiMessage(request).send().then(function(response) {
      if (typeof response != 'CError') {
        self.data = {};
        lodash.assign(self.data, response);
      }
      return response;
    });
  };

  /**
   * Set session data by name. A 'data' property is created on the session.
   * @param {String} name - Location to store the specified value.
   * @param {Object} value - The data value to store.
   * @return {Promise} A promise at completion with param 'value' or an error.
   */
  CSession.prototype.set = function(name, value) {
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/var/' + name,
      data: value
    }

    return new ApiMessage(request).send().then(function(response) {
      if (typeof response != 'CError') {
        self.data = self.data || {};
        lodash.merge(self.data, response);
      }
      return response;
    });

  };

  return CSession;
});
