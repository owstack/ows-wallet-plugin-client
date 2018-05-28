'use strict';

angular.module('owsWalletPluginClient').provider('$pluginConfig', function(lodash) {

  var provider = this;
  provider.platform = {};
  var PLATFORM = 'platform';

  var configProperties = {
    router: {
      routes: PLATFORM
    },
    platform: {}
  };

  createConfig(configProperties, provider, '');

  // Default configuration
  setPlatformConfig('default', {
    router: {
      routes: []
    }
  });

  // iOS (it is the default already)
  setPlatformConfig('ios', {
    router: {
      routes: []
    }
  });

  // Android
  setPlatformConfig('android', {
    router: {
      routes: []
    }
  });

  // NodeWebKit
  setPlatformConfig('nodewebkit', {
    router: {
      routes: []
    }
  });

  // Create methods for each config to get/set
  function createConfig(configObj, providerObj) {
    lodash.forEach(configObj, function(value) {
      // Create a method for the provider/config methods that will be exposed
      providerObj = function(newValue) {
        if (arguments.length) {
          configObj = newValue;
          return providerObj;
        }
        return configObj;
      };
    });
  }

  // Used to set configs
  function setConfig(configs) {
    configProperties = platformConfigs;
    provider.platform[platformName] = {};

    addConfig(configProperties, configProperties.platform[platformName]);

    createConfig(configProperties.platform[platformName], provider.platform[platformName], '');
  }

  // Used to set platform configuration.
  function setPlatformConfig(platformName, platformConfigs) {
    configProperties.platform[platformName] = platformConfigs;
    provider.platform[platformName] = {};

    addConfig(configProperties, configProperties.platform[platformName]);

    createConfig(configProperties.platform[platformName], provider.platform[platformName], '');
  }

  // Used to recursively add new platform configuration.
  function addConfig(configObj, platformObj) {
    for (var n in configObj) {
      if (n != PLATFORM && configObj.hasOwnProperty(n)) {
        if (angular.isObject(configObj[n])) {
          if (lodash.isUndefined(platformObj[n])) {
            platformObj[n] = {};
          }
          addConfig(configObj[n], platformObj[n]);

        } else if (lodash.isUndefined(platformObj[n])) {
          platformObj[n] = null;
        }
      }
    }
  }

  // Create methods for each configuration to get/set.
  function createConfig(configObj, providerObj, platformPath) {
    lodash.forEach(configObj, function(value, namespace) {

      if (angular.isObject(configObj[namespace])) {
        // Recursively drill down the config object so we can create a method for each one.
        providerObj[namespace] = {};
        createConfig(configObj[namespace], providerObj[namespace], platformPath + '.' + namespace);

      } else {
        // Create a method for the provider/config methods that will be exposed.
        providerObj[namespace] = function(newValue) {
          if (arguments.length) {
            configObj[namespace] = newValue;
            return providerObj;
          }
          if (configObj[namespace] == PLATFORM) {
            // If the config is set to 'platform', then get this config's platform value.
            var platformConfig = stringObj(configProperties.platform, owswallet.Plugin.platform() + platformPath + '.' + namespace);
            if (platformConfig || platformConfig === false) {
              return platformConfig;
            }
            // Didn't find a specific platform config, now try the default.
            return stringObj(configProperties.platform, 'default' + platformPath + '.' + namespace);
          }
          return configObj[namespace];
        };
      }

    });
  }

  function stringObj(obj, str) {
    str = str.split(".");
    for (var i = 0; i < str.length; i++) {
      if (obj && !lodash.isUndefined(obj[str[i]])) {
        obj = obj[str[i]];
      } else {
        return null;
      }
    }
    return obj;
  }

  provider.setPlatformConfig = setPlatformConfig;

  // Service definition for internal use
  provider.$get = function() {
    return provider;
  };

});
