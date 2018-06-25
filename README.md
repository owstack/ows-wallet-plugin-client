OWS Wallet Plugin Client
=======

The plugin client framework and API for OWS Wallet.

## Features

### owsWallet.Plugin
#### Platform
##### isCordova()
##### isNodeWebKit()
##### isSafari()
##### isMobile()
##### isAndroid()
##### isIOS()
##### isIPhoneX()
##### userAgent()
#### State
##### start(callback)
##### ready(callback)
##### openForBusiness(pluginIds, callback)
### API Reference
#### ApiError
#### Applet
#### Constants
#### Device
#### Host
#### Http
#### PluginAPIHelper
#### Servlet
#### Session
#### Settings
#### Storage
#### Transaction
#### Utils
#### Wallet
### Services
#### $log
#### $pluginConfigProvider
### API module namespace
### Applet libary
#### Directives
##### svg
#### Filters
#####orderObjectBy
#### Services
##### externalLinkService
##### nodeWebkitService
##### popupService
### Servlet library

## Installation

Install [bower](http://bower.io/) and [grunt](http://gruntjs.com/getting-started) if you haven't already:

```sh
npm install -g bower
npm install -g grunt-cli
```

Build:

```sh
bower install
npm install
grunt
```

Build outputs are written to the release/ directory.

## Support

* [GitHub Issues](https://github.com/owstack/ows-wallet-plugin-client/issues)
  * Open an issue if you are having problems with this project

## License

This plugin is released under the MIT License.  Please refer to the [LICENSE](https://github.com/owstack/ows-wallet-plugin-client/blob/master/LICENSE) file that accompanies this project for more information including complete terms and conditions.
