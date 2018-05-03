'use strict';

angular.module('owsWalletPluginClient.api').factory('CApplet', function (lodash, CScope) {

  /**
   * CApplet
   *
   * This class provides access to applet behavior. An instance of this class should be obtained
   * from the CSession instance provided by the '$pre.ready' event.
   */

  /**
   * Applet Properties
   * -----------------
   * 
   * Root scope provides access to the folling applet functions and properties.
   * 
   * appletService.open - Open an applet.
   *   <div ng-click="applet.open(applet)"></div>
   *   
   * appletService.close - Close an open applet
   *   <div ng-click="applet.close()"></div>
   *   
   * applet.header - Applet header property.
   *   <span>{{applet.header.name}}</span>
   *   
   * applet.path - Return the qualified path to the specified resource.
   *   <img ng-src="{{applet.path+'img/my-image.png'}}">
   *   
   * applet.model - Applet model property.
   *   <circular-slider
   *     max="{{c.applet.model.csMaximum}}">
   *   </circular-slider>
   *   
   * applet.view - Applet view property.
   *   <div ng-style="{'background':applet.view.background}"></div>
   */

   /**
   * Applet Events
   * -------------
   * 
   * Each of the following events provide the following arguments to the subscriber:
   *   applet - the subject Applet object
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
  function CApplet(applet) {
    lodash.assign(this, applet);
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

  /**
   * Set or get an applet property. Available property names are:
   *   'title' - set the applet header bar text.
   *
   * Get a property by omitting the value.
   * Set a property by specifying a name-value pair.
   *
   * @param {String} name - The applet property name to set or get.
   * @param {String} [value] - The value to set.
   * @return {String} The value of the specified property.
   * @return {Promise<Object>} A promise for the value of the specified property.
   */
  CApplet.prototype.property = function(name, value) {
    var request = {
      method: 'POST',
      url: '/applet/' + this.header.id + '/property/' + name,
      data: {
        value: value
      }
    }

    return new ApiMessage(request).send().then(function(value) {
      CScope.refresh();
      return value;
    });
  };

  /**
   * Set or get a set of applet properties. Available property names are:
   *   'title' - set the applet header bar text.
   *
   * Set properties by providing an object of name-value pairs.
   * Get properties by providing an array of names, one for each property.
   * 
   * @param {String} set - The applet property set; either an array or an object of name-values.
   * @return {Promise} A promise at completion.
   */
  CApplet.prototype.propertySet = function(set) {
    var request = {
      method: 'POST',
      url: '/applet/' + this.header.id + '/propertyset',
      data: {
        set: set
      }
    }
    
    return new ApiMessage(request).send().then(function(response) {
      CScope.refresh();
    });
  };

  return CApplet;
});
