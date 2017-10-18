/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkIgnore = checkIgnore;
exports.transform = transform;

var _idx = __webpack_require__(1);

var _idx2 = _interopRequireDefault(_idx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var regexsToIgnore = [/Branch init failed/gi, /GoogleAPI.*popup_closed_by_user/gi, /GoogleAPI.*access_denied/gi, /unhandled rejection was null or undefined/gi, /script error/gi, /object Object/gi, /GraphQL error: 503/gi, /GraphQL error: Unauthorized/gi, /GraphQL error: 401/gi, /Network error: Failed to fetch/gi, /\$ is not defined/gi, /event is not defined/gi, /maxItems has been hit. Ignoring errors until reset./gi, /Cannot read property 'load' of undefined/gi];

function checkIgnore(isUncaught, args, payload) {
  console.log("CHECKING: ", payload);
  try {
    if (payload.fingerprint) {
      var result = regexsToIgnore.some(function (pattern) {
        return payload.fingerprint.search(pattern) !== -1;
      });
      console.log("CHECKING GOT: ", result);
      return result;
    }
    console.log("NO FINGERPRINT");
    return false;
  } catch (e) {
    // if we did this wrong, lets log it so we can track why, and send the error anyway.
    console.error(e);
    return false;
  }
}

function transform(payload) {
  var message = (0, _idx2.default)(payload, function (_) {
    return _.body.message.body;
  }) || (0, _idx2.default)(payload, function (_) {
    return _.body.message;
  }) || (0, _idx2.default)(payload, function (_) {
    return _.body.trace.exception.message;
  }) || (0, _idx2.default)(payload, function (_) {
    return _.body.trace.extra.extraArgs[0].message;
  }) || (0, _idx2.default)(payload, function (_) {
    return _.body.trace.extra.extraArgs[1].message;
  }) || (0, _idx2.default)(payload, function (_) {
    return _.body.trace.extra.extraArgs[0];
  }) || (0, _idx2.default)(payload, function (_) {
    return _.body.trace.extra.extraArgs[1];
  });

  var description = (0, _idx2.default)(payload, function (_) {
    return _.body.trace.exception.description;
  }) || (0, _idx2.default)(payload, function (_) {
    return _.body.message.extra.error;
  });

  try {
    console.log("TRANSFORM: ", message, description);
    if (typeof message === 'string' && message !== '') {
      var shouldAddDescription = typeof description === 'string' && description !== message;
      payload.fingerprint = message + (shouldAddDescription ? " " + (description || '') : '');
    } else if (description && typeof description === 'string') {
      payload.fingerprint = description;
    }
  } catch (e) {
    console.log("ERROR IN TRANSFORM: ", e);
  }
}

console.log("TRYING TO CONFIGURE ROLLBAR");

if (typeof window !== 'undefined' && window.Rollbar) {
  console.log("WE HAVE A WINDOW AND ROLLBAR");
  var _window = window,
      Rollbar = _window.Rollbar;

  var nativeConsoleError = console.error;
  console.error = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var hasError = args.some(function (e) {
      return e instanceof Error;
    });
    if (hasError) {
      Rollbar.error.apply(Rollbar, args);
    } else {
      try {
        throw Error(args[0]);
      } catch (e) {
        Rollbar.error.apply(Rollbar, [e].concat(_toConsumableArray(args.slice(1))));
      }
    }
    return nativeConsoleError.apply(console, args);
  };

  Rollbar.global({
    maxItems: 10
  });

  Rollbar.configure({
    transform: transform,
    checkIgnore: checkIgnore
  });
} else if (typeof window !== 'undefined') {
  console.log("WE HAVE A WINDOW BUT NO ROLLBAR");
  window._rolbarTransform = transform;
  window._rollbarCheckIgnore = checkIgnore;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

 // eslint-disable-line strict

/**
 * Traverses properties on objects and arrays. If an intermediate property is
 * either null or undefined, it is instead returned. The purpose of this method
 * is to simplify extracting properties from a chain of maybe-typed properties.
 *
 * === EXAMPLE ===
 *
 * Consider the following type:
 *
 *   const props: {
 *     user: ?{
 *       name: string,
 *       friends: ?Array<User>,
 *     }
 *   };
 *
 * Getting to the friends of my first friend would resemble:
 *
 *   props.user &&
 *   props.user.friends &&
 *   props.user.friends[0] &&
 *   props.user.friends[0].friends
 *
 * Instead, `idx` allows us to safely write:
 *
 *   idx(props, _ => _.user.friends[0].friends)
 *
 * The second argument must be a function that returns one or more nested member
 * expressions. Any other expression has undefined behavior.
 *
 * === NOTE ===
 *
 * The code below exists for the purpose of illustrating expected behavior and
 * is not meant to be executed. The `idx` function is used in conjunction with a
 * Babel transform that replaces it with better performing code:
 *
 *   props.user == null ? props.user :
 *   props.user.friends == null ? props.user.friends :
 *   props.user.friends[0] == null ? props.user.friends[0] :
 *   props.user.friends[0].friends
 *
 * All this machinery exists due to the fact that an existential operator does
 * not currently exist in JavaScript.
 */

function idx(input, accessor) {
  try {
    return accessor(input);
  } catch (error) {
    if (error instanceof TypeError) {
      if (nullPattern.test(error)) {
        return null;
      } else if (undefinedPattern.test(error)) {
        return undefined;
      }
    }
    throw error;
  }
}

/**
 * Some actual error messages for null:
 *
 * TypeError: Cannot read property 'bar' of null
 * TypeError: Cannot convert null value to object
 * TypeError: foo is null
 * TypeError: null has no properties
 * TypeError: null is not an object (evaluating 'foo.bar')
 * TypeError: null is not an object (evaluating '(" undefined ", null).bar')
 */
var nullPattern = /^null | null$|^[^\(]* null /;
var undefinedPattern = /^undefined | undefined$|^[^\(]* undefined /;

idx.default = idx;
module.exports = idx;


/***/ })
/******/ ]);