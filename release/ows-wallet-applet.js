//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = new Array();

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw new Error('code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')');
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data) {
      var newData = qr8BitByte(data);
      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw new Error(row + ',' + col);
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;
      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg';
      qrSvg += ' width="' + size + 'px"';
      qrSvg += ' height="' + size + 'px"';
      qrSvg += ' xmlns="http://www.w3.org/2000/svg"';
      qrSvg += '>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createImgTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createImgTag(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytes = function(s) {
    var bytes = new Array();
    for (var i = 0; i < s.length; i += 1) {
      var c = s.charCodeAt(i);
      bytes.push(c & 0xff);
    }
    return bytes;
  };

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw new Error();
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw new Error(count + ' != ' + numChars);
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = new Array();
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw new Error('bad maskPattern:' + maskPattern);
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw new Error('mode:' + mode);
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw new Error('mode:' + mode);
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw new Error('mode:' + mode);
        }

      } else {
        throw new Error('type:' + type);
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw new Error('glog(' + n + ')');
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw new Error(num.length + '/' + shift);
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectLevel) {

      switch(errorCorrectLevel) {
      case QRErrorCorrectLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);

      if (typeof rsBlock == 'undefined') {
        throw new Error('bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectLevel:' + errorCorrectLevel);
      }

      var length = rsBlock.length / 3;

      var list = new Array();

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = new Array();
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = new Array();

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw new Error('n:' + n);
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw new Error('unexpected end of file./' + _buflen);
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw new Error('c:' + c);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw new Error('length over');
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw new Error('dup key:' + key);
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createImgTag = function(width, height, getPixel, alt) {

    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    var img = '';
    img += '<img';
    img += '\u0020src="';
    img += 'data:image/gif;base64,';
    img += base64;
    img += '"';
    img += '\u0020width="';
    img += width;
    img += '"';
    img += '\u0020height="';
    img += height;
    img += '"';
    if (alt) {
      img += '\u0020alt="';
      img += alt;
      img += '"';
    }
    img += '/>';

    return img;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));

//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript UTF8 Support (optional)
//
// Copyright (c) 2011 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

!function(qrcode) {

  //---------------------------------------------------------------------
  // overwrite qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytes = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}(qrcode);

/*
 * angular-qrcode v6.3.0
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

angular.module('monospaced.qrcode', [])
  .directive('qrcode', ['$window', function($window) {

    var canvas2D = !!$window.CanvasRenderingContext2D,
        levels = {
          'L': 'Low',
          'M': 'Medium',
          'Q': 'Quartile',
          'H': 'High'
        },
        draw = function(context, qr, modules, tile, color) {
          for (var row = 0; row < modules; row++) {
            for (var col = 0; col < modules; col++) {
              var w = (Math.ceil((col + 1) * tile) - Math.floor(col * tile)),
                  h = (Math.ceil((row + 1) * tile) - Math.floor(row * tile));

              context.fillStyle = qr.isDark(row, col) ? color.foreground : color.background;
              context.fillRect(Math.round(col * tile),
                               Math.round(row * tile), w, h);
            }
          }
        };

    return {
      restrict: 'E',
      template: '<canvas class="qrcode"></canvas>',
      link: function(scope, element, attrs) {
        var domElement = element[0],
            $canvas = element.find('canvas'),
            canvas = $canvas[0],
            context = canvas2D ? canvas.getContext('2d') : null,
            download = 'download' in attrs,
            href = attrs.href,
            link = download || href ? document.createElement('a') : '',
            trim = /^\s+|\s+$/g,
            error,
            version,
            errorCorrectionLevel,
            data,
            size,
            modules,
            tile,
            qr,
            $img,
            color = {
              foreground: '#000',
              background: '#fff'
            },
            setColor = function(value) {
              color.foreground = value || color.foreground;
            },
            setBackground = function(value) {
              color.background = value || color.background;
            },
            setVersion = function(value) {
              version = Math.max(1, Math.min(parseInt(value, 10), 40)) || 5;
            },
            setErrorCorrectionLevel = function(value) {
              errorCorrectionLevel = value in levels ? value : 'M';
            },
            setData = function(value) {
              if (!value) {
                return;
              }

              data = value.replace(trim, '');
              qr = qrcode(version, errorCorrectionLevel);
              qr.addData(data);

              try {
                qr.make();
              } catch(e) {
                error = e.message;
                return;
              }

              error = false;
              modules = qr.getModuleCount();
            },
            setSize = function(value) {
              size = parseInt(value, 10) || modules * 2;
              tile = size / modules;
              canvas.width = canvas.height = size;
            },
            render = function() {
              if (!qr) {
                return;
              }

              if (error) {
                if (link) {
                  link.removeAttribute('download');
                  link.title = '';
                  link.href = '#_';
                }
                if (!canvas2D) {
                  domElement.innerHTML = '<img src width="' + size + '"' +
                                         'height="' + size + '"' +
                                         'class="qrcode">';
                }
                scope.$emit('qrcode:error', error);
                return;
              }

              if (download) {
                domElement.download = 'qrcode.png';
                domElement.title = 'Download QR code';
              }

              if (canvas2D) {
                draw(context, qr, modules, tile, color);

                if (download) {
                  domElement.href = canvas.toDataURL('image/png');
                  return;
                }
              } else {
                domElement.innerHTML = qr.createImgTag(tile, 0);
                $img = element.find('img');
                $img.addClass('qrcode');

                if (download) {
                  domElement.href = $img[0].src;
                  return;
                }
              }

              if (href) {
                domElement.href = href;
              }
            };

        if (link) {
          link.className = 'qrcode-link';
          $canvas.wrap(link);
          domElement = domElement.firstChild;
        }

        setColor(attrs.color);
        setBackground(attrs.background);
        setVersion(attrs.version);
        setErrorCorrectionLevel(attrs.errorCorrectionLevel);
        setSize(attrs.size);

        attrs.$observe('version', function(value) {
          if (!value) {
            return;
          }

          setVersion(value);
          setData(data);
          setSize(size);
          render();
        });

        attrs.$observe('errorCorrectionLevel', function(value) {
          if (!value) {
            return;
          }

          setErrorCorrectionLevel(value);
          setData(data);
          setSize(size);
          render();
        });

        attrs.$observe('data', function(value) {
          if (!value) {
            return;
          }

          setData(value);
          setSize(size);
          render();
        });

        attrs.$observe('size', function(value) {
          if (!value) {
            return;
          }

          setSize(value);
          render();
        });

        attrs.$observe('color', function(value) {
          if (!value) {
            return;
          }

          setColor(value);
          render();
        });

        attrs.$observe('background', function(value) {
          if (!value) {
            return;
          }

          setBackground(value);
          render();
        });

        attrs.$observe('href', function(value) {
          if (!value) {
            return;
          }

          href = value;
          render();
        });
      }
    };
  }]);

'use strict';

angular.module('owsWalletPluginClient.directives').directive('hideTabs', ['$rootScope', function($rootScope) {
  return {
    link: function(scope, elem, attrs, ctrl) {
      scope.$on("$ionicView.beforeEnter", function(event, data) {
        if (!attrs.hideTabs || (attrs.hideTabs == 'true')) {
          $rootScope.hideTabs = 'tabs-item-hide';
        } else {
          $rootScope.hideTabs = '';
        }
      });
    }
  };
}]);

'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsCollapsible', ['$rootScope', '$timeout', function($rootScope, $timeout) {

  var collapsible = '\
		<div class="head-content" ng-style="{\'height\': collapsibleItemHeight}"\
		  ng-class="{\'collapsible\': headerIsCollapsible, \'is-collapsing\': isCollapsing}">\
      <div ng-transclude="header"></div>\
    </div>\
  ';

  var template = '\
  <div id="ows-collapsible" class="view-content has-header">\
    <!-- Header -->\
    <div class="head-wrapper ng-hide" ng-show="headerIsCollapsible">' +
      collapsible + '\
    </div>\
    <ion-content delegate-handle="owsCollapsibleScroll" on-scroll="getScrollPosition()"\
      ng-style="{\'margin-top\': contentMargin, \'height\': visibleContentHeight}"\
      ng-class="{\'collapsible\': headerIsCollapsible}" class="ion-content-ows-collapsible">\
      <div class="content-wrapper" ng-style="{\'transform\': contentTransform, \'padding-bottom\': contentPaddingBottom}">\
        <!-- -->\
        <!-- -->\
        <!-- -->\
        <!-- Start header duplicate (for Android compatibility) -->\
        <div class="head-wrapper ng-hide" ng-show="!headerIsCollapsible">' +
          collapsible + '\
        </div>\
        <!-- End header duplicate (for Android compatibility) -->\
        <!-- -->\
        <!-- -->\
        <div ng-transclude="body"></div>\
      </div>\
    </ion-content>\
  </div>\
	';

  return {
    restrict: 'E',
		transclude: {
      'header': 'owsCollapsibleHeader',
      'body': 'owsCollapsibleBody'
    },
    scope: {
/*
      maxHeight: '@',
      minHeight: '@',
      topStart: '@',
      topEnd: '@',
*/
      model: '='
    },
    controller: 'OWSCollapsibleCtrl',
    template: template,
    link: function (scope, element, attrs) {
      angular.extend(scope.model, {
        reset: function() {
          scope.reset();
        }
      });

      scope.$watch('model.listener', function(listener) {
        scope.model.listener = listener;
      });
      
      scope.$watch('model.maxHeight', function(height) {
        scope.headerMaxHeight = height || scope.headerMaxHeight;
        scope.contentMargin = scope.headerMaxHeight + 'px';
        scope.collapsibleItemHeight = scope.headerMaxHeight + 'px';
      });

      scope.$watch('model.minHeight', function(height) {
        scope.headerMinHeight = height || scope.headerMinHeight;
      });

      scope.$watch('model.topStart', function(top) {
        scope.headerTop = top || scope.headerTop;
      });

      scope.$watch('model.topEnd', function(top) {
        scope.headerTopFinal = top || scope.headerTopFinal;
      });

      scope.$watch('model.animationSpeed', function(speed) {
        scope.animationSpeed = speed || scope.animationSpeed;
      });
    }
	};
}]);

'use strict';

angular.module('owsWalletPluginClient.controllers').controller('OWSCollapsibleCtrl', ['$rootScope', '$scope', '$window', '$ionicScrollDelegate', '$timeout', function($rootScope, $scope, $window, $ionicScrollDelegate, $timeout) {

  // Defaults for managing collapsible view.
  var NAV_BAR_HEIGHT = 44; // app nav bar content height
  var CONTENT_INSET_TOP = owswallet.Plugin.safeAreaInsets().top + NAV_BAR_HEIGHT;
  var CONTENT_INSET_BOTTOM = owswallet.Plugin.safeAreaInsets().bottom;
  var HEADER_MAX_HEIGHT = 80; // Maximum total height of header
  var HEADER_MIN_HEIGHT = 44; // Minimum (collapsed) height of header
  var HEADER_TOP = 20; // Initial top position of the scaled content inside the header
  var HEADER_TOP_FINAL = 15; // Final top position of the scaled content inside the header
  var HEADER_CONTENT_MIN_SCALE = 0.5; // Smallest scaling of fullsize content
  var TAB_BAR_HEIGHT = 49; // Height of a visible tab bar.

  $scope.headerIsCollapsible = !owswallet.Plugin.isAndroid();

  // Set a default values which can be overridden by the directive link.
  $scope.headerMaxHeight = HEADER_MAX_HEIGHT;
  $scope.headerMinHeight = HEADER_MIN_HEIGHT;
  $scope.headerTop = HEADER_TOP;
  $scope.headerTopFinal = HEADER_TOP_FINAL;

  $scope.contentMargin = $scope.headerMaxHeight + 'px';
  $scope.collapsibleItemHeight = $scope.headerMaxHeight + 'px';

  const animationFrameInterval = 16.67; // ms (60hz)
  $scope.animationSpeed = 200; // ms

  var headerHeight = $scope.headerMaxHeight - $scope.headerMinHeight;
  var lastScrollPos = 0;
  var resetInProgress = false;

  $scope.getScrollPosition = function() {
    if (resetInProgress) {
      return;
    }
    var scrollPos = $ionicScrollDelegate.$getByHandle('owsCollapsibleScroll').getScrollPosition().top;
    refreshHeader(scrollPos);
  };

  $scope.reset = function() {
    function doReset() {
      if (lastScrollPos >= 0) {
        if (lastScrollPos > headerHeight) {
          refreshHeader(headerHeight, true);
        } else {
          refreshHeader(Math.max(lastScrollPos - animationStep, 0), true);
        }

        if (lastScrollPos > 0) {
          window.requestAnimationFrame(doReset);
        } else {
          resetInProgress = false;
        }
      }
    };

    resetInProgress = true;
    var animationStep = headerHeight / ($scope.animationSpeed / animationFrameInterval);
    window.requestAnimationFrame(doReset);
  };

  function refreshHeader(scrollPos, skipAnimationRequest) {
    if (!$scope.headerIsCollapsible) {
      return;
    }

    if (scrollPos == undefined) {
      lastScrollPos = 0;
      scrollPos = 0;
    }
    lastScrollPos = scrollPos;

    // Set collapsed header height.
    var collapsibleItemHeight = $scope.headerMaxHeight - scrollPos;
    if (collapsibleItemHeight < $scope.headerMinHeight) {
      collapsibleItemHeight = $scope.headerMinHeight;
    }
    if (collapsibleItemHeight > $scope.headerMaxHeight) {
      collapsibleItemHeight = $scope.headerMaxHeight;
    }

    // Calculate percentage collapsed.
    var collapsibleItemPercent = (collapsibleItemHeight - $scope.headerMinHeight) / ($scope.headerMaxHeight - $scope.headerMinHeight);

    // Set the scaled size of the header content based on current scale.
    var collapsibleItemContentScale = HEADER_CONTENT_MIN_SCALE + (collapsibleItemPercent * (1 - HEADER_CONTENT_MIN_SCALE));

    // Set the top of the view content below the header.
    var contentMargin = collapsibleItemHeight;

    // Set the top position for the header.
    var headerTop = $scope.headerTopFinal - (collapsibleItemPercent * ($scope.headerTopFinal - $scope.headerTop));

    // Update in case tab bar state has changed.
    var tabBarOffset = ($rootScope.hideTabs == '' ? TAB_BAR_HEIGHT : 0);

    // Apply results to view.
    if (skipAnimationRequest) {
      update();
    } else {
      $window.requestAnimationFrame(function() {
        update();
      });
    }

    function update() {
      $scope.collapsibleItemHeight = collapsibleItemHeight + 'px';
      $scope.visibleContentHeight = $window.screen.height - CONTENT_INSET_TOP - contentMargin - tabBarOffset + 'px';
      $scope.contentMargin = contentMargin + 'px';
      $scope.contentTransform = 'translateY(' + ($scope.headerMaxHeight - collapsibleItemHeight) + 'px)';
      $scope.collapsibleItemScale = 'scale3d(' + collapsibleItemContentScale + ',' + collapsibleItemContentScale + ',' + collapsibleItemContentScale + ') translateY(' + headerTop + 'px)';
      $scope.isCollapsing = collapsibleItemHeight < $scope.headerMaxHeight;
      $scope.$digest();

      notifyState();
    };

    function notifyState() {
      if ($scope.model) {
        $scope.model.percentage = collapsibleItemPercent;
        $scope.model.headerHeight = collapsibleItemHeight;
        $scope.model.bodyHeight = parseInt($scope.visibleContentHeight);
        $scope.model.scale = $scope.collapsibleItemScale;
        $scope.model.opacity = collapsibleItemPercent;

        if ($scope.model.listener) {
          $scope.model.listener();
        }
      }
    };
  };

}]);

'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsKeypad', function() {

  var template = '\
		<div id="ows-keypad">\
			<div class="keypad">\
			  <div class="row">\
			    <div class="col digit" ng-click="pushDigit(\'1\')">1</div>\
			    <div class="col digit" ng-click="pushDigit(\'2\')">2</div>\
			    <div class="col digit" ng-click="pushDigit(\'3\')">3</div>\
			  </div>\
			  <div class="row">\
			    <div class="col digit" ng-click="pushDigit(\'4\')">4</div>\
			    <div class="col digit" ng-click="pushDigit(\'5\')">5</div>\
			    <div class="col digit" ng-click="pushDigit(\'6\')">6</div>\
			  </div>\
			  <div class="row">\
			    <div class="col digit" ng-click="pushDigit(\'7\')">7</div>\
			    <div class="col digit" ng-click="pushDigit(\'8\')">8</div>\
			    <div class="col digit" ng-click="pushDigit(\'9\')">9</div>\
			  </div>\
			  <div class="row">\
			    <div class="col digit" ng-click="pushDigit(\'.\')">.</div>\
			    <div class="col digit" ng-click="pushDigit(\'0\')">0</div>\
			    <div class="col digit" ng-click="removeDigit()">\
			      <img svg ng-src="{{buttonDelSrc}}">\
			    </div>\
			  </div>\
			</div>\
		</div>\
	';

  return {
    restrict: 'E',
    scope: {
    	buttonDelSrc: '@',
	    config: '@'
    },
    controller: 'OWSKeypadCtrl',
    template: template,
    link: function (scope, element, attrs) {
      scope.$watch('config', function(value) {
      	scope.config = value;
      });
    }
	};
});

'use strict';

angular.module('owsWalletPluginClient.controllers').controller('OWSKeypadCtrl', ['$rootScope', '$scope', '$timeout', '$log', 'lodash', 'stringUtils', 'owsWalletPluginClient.api.BN', 'owsWalletPluginClient.api.Constants', function($rootScope, $scope, $timeout, $log, lodash, stringUtils,
  /* @namespace owsWalletPluginClient.api */ BN,
  /* @namespace owsWalletPluginClient.api */ Constants) {

  var language = 'en';
  var lengthExpressionLimit = 9;
  var placeholder = false;
  var value = { entered: 0 };

  var currencies = [];
  var currencyIndex = 0;

  var usdRates;
  var currencyToggleCache = {};

  $scope.$watch('config', function(config, oldConfig) {
    if (config != oldConfig && config.length > 0) {
      config = JSON.parse(config);
      var previousCurrencyIndex = currencyIndex;

      language = config.language || language;
      lengthExpressionLimit = config.lengthExpressionLimit || lengthExpressionLimit;
      usdRates = config.usdRates || usdRates;
      currencies = config.currencies || currencies;

      if (config.value) {
        // Reject if value currency is not configured on keypad.
        if (currencies.indexOf(config.value.currency) < 0) {
          return $log.error('Keypad not configured for currency \'' + config.value.currency +'\'');
        }

        // Handle value change.
        if (config.value.currency == currencies[currencyIndex]) {
          // Value currency is same as current keypad currency, just apply the value.
          value.entered = config.value.amount;

        } else {
          // Value currency is different than the current keypad currency, compute value through
          // USD exchange rate.
          var usdValue = BN.div(config.value.amount, usdRates[config.value.currency]);
          value.entered = BN.multiply(usdValue, usdRates[currencies[currencyIndex]]);
        }
        clearCurrencyCache();

      } else {

        // Handle currency change.
        if (typeof config.currencyIndex == 'number' || config.currencyIndex == undefined) {
          currencyIndex = (config.currencyIndex != undefined ? config.currencyIndex : currencyIndex);
        }

        if (currencies.length > 1) {
          if (!usdRates) {
            return; // Cannot do anything without rates.
          }

          // Apply a currency conversion if the currency is changed.
          if (currencyIndex != previousCurrencyIndex) {

            currencyToggleCache[currencies[previousCurrencyIndex]] = {
              value: value.entered,
              placeholder: placeholder
            };

            var cacheEntry = currencyToggleCache[currencies[currencyIndex]];
            if (cacheEntry) {
              value.entered = cacheEntry.value;
              placeholder = cacheEntry.placeholder;

            } else {
              // Compute value through USD exchange rate.
              var usdValue = BN.div(value.entered, usdRates[currencies[previousCurrencyIndex]]);
              value.entered = BN.multiply(usdValue, usdRates[currencies[currencyIndex]]);
              placeholder = false;
            }
          }
        }
      }

      update();
    }
  });

  function clearCurrencyCache() {
    currencyToggleCache = {};
  };

  function update() {
    var formatOpts = {
      language: language,
      isCrypto: Constants.isCryptoCurrency(currencies[currencyIndex]),
      noZeroDecimals: true
    };
    value = stringUtils.format(value.entered, currencies[currencyIndex], formatOpts);

    var valueHtml =
      value.entered_u_p.sign +
      value.entered_u_p.symbol +
      value.entered_u_p.number.slice(0,-1) +
      '<span class="' + (placeholder ? 'placeholder' : '') + '">' + value.entered_u_p.number.slice(-1) + '</span>' +
      value.entered_u_p.currency;

    $timeout(function() {
      $scope.$apply();
    });

    $rootScope.$emit('Local/KeypadState', {
      lengthExpressionLimit: lengthExpressionLimit,
      currency: currencies[currencyIndex],
      nextCurrency: currencies[(currencyIndex+1 >= currencies.length ? 0 : currencyIndex+1)],
      nextCurrencyIndex: (currencyIndex+1 >= currencies.length ? 0 : currencyIndex+1),
      amount: stringUtils.float(value.entered),
      amountHtml: valueHtml,
      placeholder: placeholder
    });
  };

  $scope.pushDigit = function(digit) {
    var entered = value.entered;

    if (digit != '.' && entered.indexOf('.') < 0 && entered.length >= lengthExpressionLimit) {
      return;

    } else if (entered.indexOf('.') > -1 && digit == '.') {
      return;

    } else if (entered == '0' && placeholder && digit == '0') {
      placeholder = false;

    } else if (entered == '0' && !placeholder && digit == '0') {
      return;

    } else if (entered == '0' && !placeholder && digit == '.') {
      entered = '0.0';
      placeholder = true;

    } else if (entered == '0' && placeholder && digit == '.') {
      entered = '0.0';

    } else if (entered == '0' && placeholder) {
      entered = digit;
      placeholder = false;

    } else if (entered == '0' && !placeholder) {
      entered = digit;

    } else if (entered == '0.0' && placeholder) {
      entered = '0.' + digit;
      placeholder = false;

    } else if (digit == '.') {
      entered += '.0';
      placeholder = true;

    } else if (placeholder) {
      entered = entered.slice(0, -1) + digit;
      placeholder = false;

    } else {
      entered += digit;
      placeholder = false;
    }

    value.entered = entered;
    update();
    clearCurrencyCache();
  };

  $scope.removeDigit = function() {
    var entered = value.entered;

    if (entered == '0' && placeholder) {
      return;

    } else if (entered == '0' && !placeholder) {
      placeholder = true;

    } else if (entered.length == 1 && placeholder) {
      entered = '0';
      placeholder = true;

    } else if (entered == '0.0' && placeholder) {
      entered = '0';

    } else if (entered.slice(-2) == '.0' && placeholder) {
      entered = entered.slice(0, -2);
      placeholder = false;

    } else if (entered.slice(-2, -1) == '.' && !placeholder) {
      entered = entered.slice(0,-1) + '0';
      placeholder = true;

    } else {
      entered = entered.slice(0, -1) || '0';
    }

    value.entered = entered;
    update();
    clearCurrencyCache();
  };

}]);

'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsSessionLog', function() {

  var template = '\
	  <div id="ows-session-log">\
	    <div ng-show="filteredLogs.length == 0" translate>\
	      No Entries For this log level. Adjust setting in app at Settings > About > Session Log.\
	    </div>\
	    <ion-list ng-show="filteredLogs.length > 0">\
	      <ion-item class="item-text-wrap enable_text_select log-entry">\
	        <ul ng-show="filteredLogs.length > 0">\
	          <li ng-repeat="l in filteredLogs">\
	            <span ng-class="{\'warning\': l.level==\'warn\', \'debug\': l.level==\'debug\', \'info\': l.level==\'info\', \'error\': l.level==\'error\'}">\
	              <span class="log-timestamp">[{{l.timestamp}}]</span>\
	              <span class="log-level">[{{l.level}}]</span>\
	              <span class="log-client" ng-if="!isCordova">[{{pluginName}}]</span>\
	              {{l.msg}}\
	            </span>\
	          </li>\
	        </ul>\
	      </ion-item>\
	    </ion-list>\
    </div>\
	';

  return {
    restrict: 'E',
    scope: {},
    controller: 'OWSSessionLogCtrl',
    template: template,
    link: function (scope, element, attrs) {}
	};
});

'use strict';

angular.module('owsWalletPluginClient.controllers').controller('OWSSessionLogCtrl', ['$scope', '$timeout', '$window', '$ionicScrollDelegate', 'historicLogService', 'lodash', 'gettextCatalog', 'owsWalletPluginClient.api.Session', function($scope, $timeout, $window, $ionicScrollDelegate, historicLogService, lodash, gettextCatalog,
  /* @namespace owsWalletPluginClient.api */ Session) {

  var session = Session.getInstance();
  var pluginId = session.plugin.header.id + '@' + session.plugin.header.version;
  $scope.pluginName = session.plugin.header.name + '@' + session.plugin.header.version;
  $scope.isCordova = owswallet.Plugin.isCordova();

  var logLevel = session.logLevel;
  var logLevels = historicLogService.getLevels();

  var selectedLevel = historicLogService.getLevel(logLevel);
  filterLogs(selectedLevel.weight);

  $timeout(function() {
    $ionicScrollDelegate.scrollBottom();
  }, 200);

  $scope.prepareLogs = function() {
    var log = pluginId + ' session logs\n Be careful, this could contain sensitive private data.\n\n';
    log += historicLogService.get().map(function(v) {
      return '[' + v.timestamp + '][' + v.level + ']' + v.msg;
    }).join('\n');

    return log;
  };

  $scope.sendLogs = function() {
    var body = $scope.prepareLogs();

    $window.top.plugins.socialsharing.shareViaEmail(
      body,
      pluginId + ' session logs',
      null, // TO: must be null or an array
      null, // CC: must be null or an array
      null, // BCC: must be null or an array
      null, // FILES: can be null, a string, or an array
      function() {},
      function() {}
    );
  };

  function filterLogs(weight) {
    $scope.filteredLogs = historicLogService.get(weight);
  };

}]);

'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsTransactions', function() {

  var template = '\
    <ion-list id="ows-transactions">\
      <ion-item class="item-divider" ng-class="{\'has-label\': listName}">\
        {{listName}}\
      </ion-item>\
			<ion-item class="item-icon-left icon-left-lg" ng-class="{\'has-click\': onClick, \'has-detail\': tx.subtitle}"\
				ng-repeat="tx in transactions track by $index" ng-click="{{onClick}}(tx)">\
			  <!-- Icon (left side) -->\
			  <i class="icon lg-icon left-icon">\
		      <div class="tx-icon received" style="{{styleIconReceived}}" ng-if="tx.type == \'received\'"></div>\
		      <div class="tx-icon sent" style="{{styleIconSent}}" ng-if="tx.type == \'sent\'"></div>\
			  </i>\
			  <!-- Amount (right side) -->\
			  <div class="tx-note">\
			    <span class="tx-amount" ng-class="{\'recent\': tx.type == \'recent\', \'received\': tx.type == \'received\', \'sent\': tx.type == \'sent\'}">\
		        {{format(tx.amount, tx.currency).localized_u}}\
			    </span>\
			    <div class="tx-time">\
			      <time ng-if="tx.time && createdWithinPastDay(tx.time * 1000)">\
			        {{tx.time * 1000 | amTimeAgo}}\
			      </time>\
			      <time ng-if="tx.time && !createdWithinPastDay(tx.time * 1000)">\
			        {{tx.time * 1000 | amDateFormat:\'MMM D, YYYY\'}}\
			      </time>\
			    </div>\
			  </div>\
			  <!-- Description -->\
			  <div class="tx-description">\
		      <span ng-if="tx.title" class="tx-title ellipsis">\
		        {{tx.title}}\
		      </span>\
	        <div ng-if="tx.subtitle" class="tx-subtitle ellipsis">\
	        	{{tx.subtitle}}\
	        </div>\
		      <span ng-if="!tx.title" translate>\
						<span ng-show="tx.type == \'received\'" translate>Received</span>\
						<span ng-show="tx.type == \'sent\'" translate>Sent</span>\
		      </span>\
			  </div>\
			</ion-item>\
    </ion-list>\
	';

	// Transactions binding must be two-way. see http://davidcai.github.io/blog/posts/directive-at-vs-equal/ and
	// https://stackoverflow.com/questions/16646607/how-to-use-ng-repeat-within-template-of-a-directive-in-angular-js

  return {
    restrict: 'E',
    scope: {
    	listName: '@',
    	transactions: '=',
    	styleIconReceived: '@',
    	styleIconSent: '@',
    	onClick: '@'
    },
    controller: 'OWSTransactionsCtrl',
    template: template,
    link: function (scope, element, attrs) {
      scope.$watch('transactions', function(value) {
      	scope.transactions = value;
      });
    }
	};
});

'use strict';

angular.module('owsWalletPluginClient.controllers').controller('OWSTransactionsCtrl', ['$scope', 'stringUtils', function($scope, stringUtils) {

	$scope.format = stringUtils.format;

}]);

'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsWalletTransactions', function() {

  var template = '\
    <ion-list id="ows-wallet-transactions">\
			<ion-item class="has-click item-icon-left icon-left-lg" ng-repeat="tx in transactions track by $index" ng-click="{{onClick}}(tx)">\
			  <!-- Icon -->\
			  <i class="icon lg-icon left-icon">\
			    <span ng-if="isUnconfirmed(tx)">\
			      <div class="tx-icon confirming" style="{{styleIconConfirming}}"></div>\
			    </span>\
			    <span ng-if="!isUnconfirmed(tx)">\
			      <div class="tx-icon received" style="{{styleIconReceived}}" ng-if="tx.action == \'received\'"></div>\
			      <div class="tx-icon sent" style="{{styleIconSent}}" ng-if="tx.action == \'sent\'"></div>\
			      <div class="tx-icon moved" style="{{styleIconMoved}}" ng-if="tx.action == \'moved\'"></div>\
			    </span>\
			  </i>\
			  <!-- Amount (right side) -->\
			  <div class="tx-detail">\
			    <span ng-class="{\'tx-amount recent\': tx.recent, \'tx-amount received\': tx.action == \'received\', \'tx-amount sent\': tx.action == \'sent\',\
			      \'tx-amount moved\': tx.action == \'moved\'}">\
			      <span ng-if="tx.action == \'sent\'">–</span>\
			      <span ng-if="tx.action == \'invalid\'" translate>\
			        (possible double spend)\
			      </span>\
			      <span ng-if="tx.action != \'invalid\'">\
			        {{tx.amountStr}}\
			      </span>\
			    </span>\
			    <div class="tx-time">\
			      <time ng-if="tx.time && createdWithinPastDay(tx.time * 1000)">\
			        {{tx.time * 1000 | amTimeAgo}}\
			      </time>\
			      <time ng-if="tx.time && !createdWithinPastDay(tx.time * 1000)">\
			        {{tx.time * 1000 | amDateFormat:\'MMM D, YYYY\'}}\
			      </time>\
			    </div>\
			  </div>\
			  <!-- Confirmed -->\
			  <div class="tx-description" ng-if="!isUnconfirmed(tx)">\
			    <!-- Received -->\
			    <div ng-show="tx.action == \'received\'">\
			      <span ng-if="tx.note.body" class="ellipsis">\
			        {{tx.note.body}}\
			      </span>\
			      <span ng-if="!tx.note.body" translate>\
			        Received\
			      </span>\
			      <span ng-if="tx.lowFees || tx.lowAmount">\
			        <i class="ion-alert-circled"></i>\
			      </span>\
			    </div>\
			    <!-- Sent -->\
			    <div ng-show="tx.action == \'sent\'">\
			      <div ng-if="tx.message" class="ellipsis">\
			        {{tx.message}}\
			      </div>\
			      <div ng-if="!tx.message && tx.note.body" class="ellipsis">\
			        {{tx.note.body}}\
			      </div>\
			      <div ng-if="!tx.message && !tx.note.body && addressbook[tx.addressTo]" class="ellipsis">\
			        {{addressbook[tx.addressTo].name || addressbook[tx.addressTo]}}\
			      </div>\
			      <div ng-if="!tx.message && !tx.note.body && !addressbook[tx.addressTo]" translate>\
			        Sent\
			      </div>\
			    </div>\
			    <!-- Moved -->\
			    <div ng-show="tx.action == \'moved\'">\
			      <div ng-if="tx.note.body" class="ellipsis">\
			        {{tx.note.body}}\
			      </div>\
			      <div ng-if="!tx.note.body" translate>\
			        Moved\
			      </div>\
			    </div>\
			    <!-- Invalid -->\
			    <span ng-if="tx.action == \'invalid\'" translate>\
			      Invalid\
			    </span>\
			  </div>\
			  <!-- Unconfirmed -->\
			  <div ng-if="isUnconfirmed(tx)">\
			    <span ng-if="tx.action == \'sent\' || tx.action == \'moved\'" class="ellipsis">\
			      {{addressbook[tx.addressTo].name || addressbook[tx.addressTo] || \'Sending\'|translate}}\
			    </span>\
			    <span ng-if="tx.action == \'received\'" translate>\
			      Receiving\
			    </span>\
			  </div>\
			</ion-item>\
    </ion-list>\
	';

	// Transactions binding must be two-way. see http://davidcai.github.io/blog/posts/directive-at-vs-equal/ and
	// https://stackoverflow.com/questions/16646607/how-to-use-ng-repeat-within-template-of-a-directive-in-angular-js

  return {
    restrict: 'E',
    scope: {
    	transactions: '=',
    	styleIconConfirming: '@',
    	styleIconReceived: '@',
    	styleIconSent: '@',
    	styleIconMoved: '@',
    	onClick: '@'
    },
    controller: 'OWSWalletTransactionsCtrl',
    template: template,
    link: function (scope, element, attrs) {
      scope.$watch('transactions', function(value) {
      	scope.transactions = value;
      });
    }
	};
});

'use strict';

angular.module('owsWalletPluginClient.controllers').controller('OWSWalletTransactionsCtrl', function() {

});

'use strict';

angular.module('owsWalletPluginClient.directives').directive('owsWallets', ['gettextCatalog', function(gettextCatalog) {

  var template = '\
    <ion-list id="ows-wallets">\
      <div class="item item-divider" ng-show="title" translate>\
        {{title}}\
      </div>\
      <a class="item item-icon-left item-icon-right" ng-class="{\'has-detail\': wallet.error}" ng-click="onClick(wallet)"\
        ng-repeat="wallet in wallets track by wallet.id">\
        <img svg="fill: {{wallet.color}}" ng-src="img/icon-{{wallet.currency.toLowerCase()}}.svg">\
        <span class="item-description">\
	        <h2>{{wallet.name}}</h2>\
	        <div class="item-detail">\
	          <p class="error" ng-show="wallet.error" translate>Wallet Error</p>\
	        </div>\
        </span>\
        <span class="item-note" ng-class="{\'two-lines\': wallet.status.alternativeIsoCode != wallet.currency}">\
          <h2>\
            {{wallet.format().balance}}\
          </h2>\
          <p ng-if="wallet.status.alternativeIsoCode != wallet.currency">\
            {{wallet.format().balanceAlternative}}\
          </p>\
        </span>\
        <i class="icon ion-ios-arrow-right"></i>\
      </a>\
    </ion-list>\
	';

	// Wallets binding must be two-way. see http://davidcai.github.io/blog/posts/directive-at-vs-equal/ and
	// https://stackoverflow.com/questions/16646607/how-to-use-ng-repeat-within-template-of-a-directive-in-angular-js

  return {
    restrict: 'E',
    scope: {
    	wallets: '=',
    	title: '@',
    	onClick: '='
    },
    controller: 'OWSWalletsCtrl',
    template: template,
    link: function (scope, element, attrs) {
      scope.$watch('wallets', function(value) {
      	scope.wallets = value;
      });
    }
	};
}]);

'use strict';

angular.module('owsWalletPluginClient.controllers').controller('OWSWalletsCtrl', function() {

});

'use strict';

angular.module('owsWalletPluginClient.directives').directive('showTabs', ['$rootScope', function($rootScope) {
  return {
    link: function(scope, elem, attrs, ctrl) {
      scope.$on("$ionicView.enter", function(event, data) {
        if (!attrs.showTabs || (attrs.showTabs == 'true')) {
          $rootScope.hideTabs = '';
        } else {
          $rootScope.hideTabs = 'tabs-item-hide';
        }
      });
    }
  };
}]);

'use strict';

/**
 * Replaces img tag with its svg content to allow for CSS styling of the svg.
 */
angular.module('owsWalletPluginClient.directives').directive('svg', ['$http', '$timeout', function($http, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var imgId = attrs.id;
      var imgClass = attrs.class;
      var imgUrl = attrs.src || attrs.ngSrc;
      var loadedUrl;
      var svg;

      element.addClass('ng-hide');
      loadSVG(imgUrl);

      scope.$watch(function() {
          return element.attr('ng-src');
      }, function(imgUrl) {
        loadSVG(imgUrl);
      });

      scope.$on('$destroy', function() {
        if (svg) {
          svg.remove();
        }
      });

      function loadSVG(imgUrl) {
        // If the controller has not yet loaded an image then force load a blank image.
        // This prevents a 404 fetch error on a bad image url (the expression).
        if (imgUrl) {
          // Don't load the same image more than once.
          if (loadedUrl != imgUrl) {
            loadedUrl = imgUrl;
            $http.get(imgUrl).success(function(data, status) {
              doLoad(data);
            });
          }
        } else {
          doLoad(blankSVG);
        }

        function doLoad(data) {
          if (svg) {
            svg.remove();
          }

          // Allow possible svg to be removed from DOM.
          $timeout(function() {
            svg = angular.element(data);
            for (var i = svg.length - 1; i >= 0; i--) {
              if (svg[i].constructor == SVGSVGElement) {
                svg = angular.element(svg[i]);
                break;
              }
            }

            if (typeof imgId !== 'undefined') {
              svg.attr('id', imgId);
            }

            if (typeof imgClass !== 'undefined') {
              svg.attr('class', imgClass);
            }

            // Custom attributes
            // Allows attribute values to be set dynamically (e.g., fill color).
            //
            // Get key value pairs for svg attrs.
            var svgAttrs = [];
            var pairs = attrs.svg.split(';');
            for (var i = 0; i < pairs.length; i++) {
              var a = pairs[i].split(':');
              svgAttrs.push({
                key: a[0],
                value: a[1]
              });
            }

            // Set custom attributes on the svg.
            var elem;
            var groups = svg.find('g');
            for (var i = 0; i < groups.length; i++) {
              elem = angular.element(groups[i]);
              for (var j = 0; j < svgAttrs.length; j++) {
                if (elem.attr(svgAttrs[j].key)) {
                  elem.attr(svgAttrs[j].key, svgAttrs[j].value);
                }
              }
            }

            // Remove invalid attributes.
            svg = svg.removeAttr('xmlns:a');

            // Add svg after the img tag.
            element.after(svg);
          });
        };

        function blankSVG() {
          return '\
            <?xml version="1.0" encoding="UTF-8"?>\
            <svg width="80px" height="80px" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
              <!-- Generator: sketchtool 47.1 (45422) - http://www.bohemiancoding.com/sketch -->\
              <title>img/icon-blank</title>\
              <desc>Created with sketchtool.</desc>\
              <defs></defs>\
              <g id="Applet-images" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                <g id="img/icon-blank">\
                  <g id="blank"></g>\
                </g>\
              </g>\
            </svg>\
          '
        };
      };
    }
  };
}]);
  
'use strict';

angular.module('owsWalletPluginClient.filters', []).filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];

    angular.forEach(items, function(item) {
      filtered.push(item);
    });

    filtered.sort(function(a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });

    if (reverse) {
      filtered.reverse();
    }
    return filtered;
  };
});

'use strict';

angular.module('owsWalletPluginClient.services').service('externalLinkService', ['nodeWebkitService', 'popupService', 'gettextCatalog', '$window', '$log', '$timeout', function(nodeWebkitService, popupService, gettextCatalog, $window, $log, $timeout) {

	var root = {};
  var isNodeWebKit;

  owswallet.Plugin.ready(function(){
    isNodeWebKit = owswallet.Plugin.isNodeWebKit();
  });

  root.open = function(url, optIn, title, message, okText, cancelText) {
    var old = $window.top.handleOpenURL;

    $window.top.handleOpenURL = function(url) {
      // Ignore external URLs
      $log.debug('Skip: ' + url);
    };

    if (isNodeWebKit) {
      nodeWebkitService.openExternalLink(url);
      restoreHandleOpenURL(old);
    } else {
      if (optIn) {
        popupService.showConfirm(title, message, okText, cancelText, function(res) {
          if (res) {
            $window.top.open(url, '_system');
          }
          restoreHandleOpenURL(old);
        });
      } else {
        $window.top.open(url, '_system');
        restoreHandleOpenURL(old);
      }
    }
  };

  function restoreHandleOpenURL(old) {
    $timeout(function() {
      $window.top.handleOpenURL = old;
    }, 500);
  };

  return root;
}]);

'use strict';

angular.module('owsWalletPluginClient.services').service('nodeWebkitService', function() {

	var root = {};

  root.readFromClipboard = function() {
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();
    return clipboard.get();
  };

  root.writeToClipboard = function(text) {
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();
    return clipboard.set(text);
  };

  root.openExternalLink = function(url) {
    var gui = require('nw.gui');
    return gui.Shell.openExternal(url);
  };

  return root;
});

'use strict';

angular.module('owsWalletPluginClient.services').service('popupService', ['$log', '$ionicPopup', '$timeout', '$window', 'gettextCatalog', 'lodash', function($log, $ionicPopup, $timeout, $window, gettextCatalog, lodash) {

  var isCordova;
  
  owswallet.Plugin.ready(function() {
    isCordova = owswallet.Plugin.isCordova();
  });

  /*************** Ionic ****************/

  var _ionicAlert = function(title, message, cb, okText) {
    cb = cb || function() {};
    $ionicPopup.alert({
      title: title,
      subTitle: message,
      okType: 'button-clear button-primary',
      okText: okText || gettextCatalog.getString('OK'),
    }).then(cb);
  };

  var _ionicConfirm = function(title, message, okText, cancelText, cb) {
    cb = cb || function() {};
    $ionicPopup.confirm({
      title: title,
      subTitle: message,
      cancelText: cancelText,
      cancelType: 'button-clear button-secondary',
      okText: okText,
      okType: 'button-clear button-primary'
    }).then(function(res) {
      return cb(res);
    });
  };

  var _ionicPrompt = function(title, message, opts, cb) {
    opts = opts || {};
    cb = cb || function() {};
    $ionicPopup.prompt({
      title: title,
      subTitle: message,
      cssClass: opts.class,
      template: '<input ng-model="data.response" type="' + opts.inputType + '" value ="" autocomplete="off" autofocus>',
      inputPlaceholder: opts.inputPlaceholder,
      defaultText: opts.defaultText
    }).then(function(res) {
      return cb(res);
    });
  };

  /*************** Cordova ****************/

  var _cordovaAlert = function(title, message, cb, okText) {
    cb = cb || function() {};
    title = title || '';
    okText = okText || gettextCatalog.getString('OK');
    $window.top.navigator.notification.alert(message, cb, title, okText);
  };

  var _cordovaConfirm = function(title, message, okText, cancelText, cb) {
    cb = cb || function() {};
    var onConfirm = function(buttonIndex) {
      if (buttonIndex == 2) {
        return cb(true);
      } else {
        return cb(false);
      }
    }
    okText = okText || gettextCatalog.getString('OK');
    cancelText = cancelText || gettextCatalog.getString('Cancel');
    title = title || '';
    $window.top.navigator.notification.confirm(message, onConfirm, title, [cancelText, okText]);
  };

  var _cordovaPrompt = function(title, message, opts, cb) {
    cb = cb || function() {};
    var onPrompt = function(results) {
      if (results.buttonIndex == 1) {
        return cb(results.input1);
      } else {
        return cb();
      }
    }
    var okText = gettextCatalog.getString('OK');
    var cancelText = gettextCatalog.getString('Cancel');
    title = title || '';
    $window.top.navigator.notification.prompt(message, onPrompt, title, [okText, cancelText], opts.defaultText);
  };

  /**
   * Show a simple alert popup
   *
   * @param {String} Title (optional)
   * @param {String} Message
   * @param {Callback} Function (optional)
   */

  this.showAlert = function(title, message, cb, okText) {
    title = (lodash.isEmpty(title) ? '' : title);
    message = (lodash.isEmpty(message) ? '' : message);

    var msg = (message && message.message) ? message.message : msg;
    $log.warn(title ? (title + ': ' + message) : message);

    if (isCordova) {
      _cordovaAlert(title, message, cb, okText);
    } else {
      _ionicAlert(title, message, cb, okText);
    }
  };

  /**
   * Show a simple confirm popup
   *
   * @param {String} Title (optional)
   * @param {String} Message
   * @param {String} okText (optional)
   * @param {String} cancelText (optional)
   * @param {Callback} Function
   * @returns {Callback} OK: true, Cancel: false
   */

  this.showConfirm = function(title, message, okText, cancelText, cb) {
    title = (lodash.isEmpty(title) ? '' : title);
    message = (lodash.isEmpty(message) ? '' : message);

    $log.warn(title ? (title + ': ' + message) : message);

    if (isCordova) {
      _cordovaConfirm(title, message, okText, cancelText, cb);
    } else {
      _ionicConfirm(title, message, okText, cancelText, cb);
    }
  };

  /**
   * Show a simple prompt popup
   *
   * @param {String} Title (optional)
   * @param {String} Message
   * @param {Object} Object{ inputType, inputPlaceholder, defaultText } (optional)
   * @param {Callback} Function
   * @returns {Callback} Return the value of the input if user presses OK
   */

  this.showPrompt = function(title, message, opts, cb) {
    title = (lodash.isEmpty(title) ? '' : title);
    message = (lodash.isEmpty(message) ? '' : message);

    $log.warn(title ? (title + ': ' + message) : message);
    opts = opts ||  {};

    if (isCordova && !opts.forceHTMLPrompt) {
      _cordovaPrompt(title, message, opts, cb);
    } else {
      _ionicPrompt(title, message, opts, cb);
    }
  };

}]);
