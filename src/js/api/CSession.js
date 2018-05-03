'use strict';

angular.module('owsWalletPluginClient.api').factory('CSession', function (lodash, pluginClientService) {

  /**
   * CSession
   *
   * This class provides session functionality including reading and writing persistent data. An instance of
   * this class should be obtained from the '$pre.ready' event or the CContext class.
   */

   var instance;

  /**
   * Constructor.  An instance of this class must be obtained from CContext.
   * @param {AppletSession} session - An internal Session object.
   * @return {Object} An instance of CSession.
   * @constructor
   */
  function CSession() {
    var self = this;

    if (instance) {
      return instance;
    }
    instance = this;

    var state = {
      statusCode: -1,
      statusText: ''
    };

    start();

    /**
     * Priviledged methods
     */

    this.isValid = function() {
      return sessionState.statusCode >= 200 && sessionState.statusCode <= 299;
    };

    /**
     * Private methods
     */

    function start() {
      var request = {
       method: 'POST',
       url: START_URL,
       data: {}
      }

      pluginClientService.sendMessage(request).then(function(response) {
        $log.info('[client] START: ' + response.statusText + ' (' + response.statusCode + ')');

        state = {
          statusCode: 200,
          statusText: response.statusText
        };

        getSession().then(function(session) {

          pluginClientService.refreshScope(function(error) {
            if (!error) {
              $rootScope.$emit('$pre.ready', self);
            }
          });

        }).catch(function(error) {
          throw error;
        });

      }, function(error) {
        $log.error('[client] START ERROR: ' + error.message + ' (' + error.statusCode + ')');

        state = {
          statusCode: error.statusCode,
          statusText: error.message
        };

      });
    };

    function getSession() {
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

    return this;
  };

  /**
   * Get the single session object or create the session.
   * @return {CSession} The single session object.
   */
  Csession.getInstance = function() {
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
    return pluginClientService.sendMessage(request);
  };

  /**
   * Retrieve session data by name.
   * @param {String} name - User specified data name defined using set(name, value).
   * @return {Promise<Object>} A promise for stored value.
   */
  CSession.prototype.get = function(name) {
    var request = {
     method: 'GET',
     url: '/session/' + this.id + '/var/' + name
    }
    return pluginClientService.sendMessage(request);
  };

  /**
   * Return the applet for this session.
   * @return {Promise<CApplet>} A promise for the applet.
   */
  CSession.prototype.getApplet = function () {
    return this.applet;
/*
    var request = {
      method: 'GET',
      url: '/session/' + this.id + '/applet',
      responseObj: 'CApplet'
    }
    return pluginClientService.sendMessage(request);
*/
  };

  /**
   * Restore all session data from persistent storage.
   * @return {Promise} A promise at completion.
   */
  CSession.prototype.restore = function() {
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/restore',
      data: {}
    }

    pluginClientService.sendMessage(request);
  };

  /**
   * Set session data by name.
   * @param {String} name - Location to store the specified value.
   * @param {Object} value - The data value to store.
   * @param {Boolean} [publish] - Publish the specified session data to the view scope as 'applet.session.<name>'.
   * @return {Promise} A promise at completion.
   */
  CSession.prototype.set = function(name, value, publish) {
    var request = {
      method: 'POST',
      url: '/session/' + this.id + '/var/' + name + (publish ? '/publish' : ''),
      data: {
        value: value
      }
    }

    pluginClientService.sendMessage(request).then(function(response) {
      if (publish) {
        pluginClientService.refreshScope();
      }
    });
  };

  return CSession;
});
