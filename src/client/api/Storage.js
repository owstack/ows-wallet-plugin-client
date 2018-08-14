'use strict';

angular.module('owsWalletPluginClient.api').factory('Storage', function (lodash,
  /* @namespace owsWalletPluginClient.api */ Session) {

  /**
   * Storage
   *
   * During instance construction the following accessors for each key are created.
   *
   *   get..(key) - Retrieve a previously stored value.
   *   set..(value) - Set the value at the specifed key.
   *   remove..(key) - Remove the value from storage.
   *
   * Each accessor is named for the specified key. The name is formed by removing dashes ('-') and camel casing the result.
   *
   *   Examples:
   *
   *   If key is 'value' then accessors are 'getValue(key)', 'setValue()', 'removeValue()'
   *   If key is 'myvalue' then accessors are 'getMyvalue(key)', 'setMyvalue(value)', 'removeMyvalue(key)'
   *   If key is 'my-value' then accessors are 'getMyValue(key)', 'setMyValue(value)', 'removeMyValue(key)'
   *   If key is 'my_value' then accessors are 'getMyValue(key)', 'setMyValue(value)', 'removeMyValue(key)'
   *   If key is 'my value' then accessors are 'getMyValue(key)', 'setMyValue(value)', 'removeMyValue(key)'
   *   If key is '--my-value--' then accessors are 'getMyValue(key)', 'setMyValue(value)', 'removeMyValue(key)'
   *
   * Namespace.
   *
   * Using a namespace is helpful when storing the same data (using the same keys) for multiple 'environments' (e.g., network types,
   * or wallets). A namespace can effectively create an abstraction for the storage user.
   *
   * Each key may be associated with a namespace provided to the contructor. The namespace applies to all accessors created for
   * the instance. The presence or absence of a namespace does not affect accessor naming. The namespace is prepended to the key name
   * (as specified, before camel casing) and is separated from the key name by a '.' (dot).  Internally, the final storage key is
   * 'namespace.key' (or simply 'key' if no namespace is specified).
   *
   * 'key' and 'namespace' are sanitized by removing all characters except a-z, A-Z, 0-9, '-'.
   */

  /**
   * Constructor.
   * @param {String} keys - A collection of keys each referencing an item stored using the returned instance.
   * @param {String} namespace [optional] - A named area of storage where values are stored. The namespace configures
   * the instance but does not affect the accessor names.
   * @constructor
   */
  function Storage(keys, namespace) {
    var self = this;
    var session = Session.getInstance();

    var ns = namespace || '';
    ns = ns.replace(/[^\w\d-]/g, '');
    if (ns.length > 0) {
      ns += '.';
    }

    /**
     * Public functions
     */

    // Create initial storage accessors.
    createAccessors(keys);

    // Add new storage accessors.
    this.addStorage = function(keys) {
      createAccessors(keys);
    };

    /**
     * Private functions
     */

    // Create accessor functions for each key.
    function createAccessors(keys) {
      var fname;
      lodash.forEach(keys, function(key) {

        key.replace(/[^\w\d-]/g, '');

        // get<key>
        fname = createFnName('get', key);
        self[fname] = function() {
          return getKey(ns + key);
        };

        // set<key>
        fname = createFnName('set', key);
        self[fname] = function(value) {
          return setKey(ns + key, value);
        };

        // remove<key>
        fname = createFnName('remove', key);
        self[fname] = function() {
          return removeKey(ns + key);
        };

      });
    };

    function createFnName(prefix, str) {
      return lodash.camelCase(prefix + '-' + str);
    };

    function getKey(key) {
      return session.getValue(key);
    };

    function setKey(key, value) {
      return session.setValue(key, value);
    };

    function removeKey(key) {
      return session.removeValue(key);
    };

    return this;
  };
 
  return Storage;
});
