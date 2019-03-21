"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _notation = _interopRequireDefault(require("./core/notation.error"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var oPROTO = Object.prototype;
var utils = {
  re: {
    VAR: /^[a-z$_][a-z$_\d]*$/i,
    ARRAY_NOTE: /^\[(\d+)\]$/,
    ARRAY_GLOB_NOTE: /^\[(\d+|\*)\]$/,
    OBJECT_BRACKETS: /^\[(?:'(.*)'|"(.*)"|`(.*)`)\]$/,
    ESCAPE: /[.\\+*?[^\]$(){}=!<>|:-]/g,
    WILDCARD: /^(\[\*\]|\*)$/,
    // matches `*` and `[*]` if outside of quotes.
    WILDCARDS: /(\*|\[\*\])(?=(?:[^"]|"[^"]*")*$)(?=(?:[^']|'[^']*')*$)/g,
    // matches trailing wildcards at the end of a non-negated glob.
    // e.g. `x.y.*[*].*` » $1 = `x.y`, $2 = `.*[*].*`
    NON_NEG_WILDCARD_TRAIL: /^(?!!)(.+?)(\.\*|\[\*\])+$/,
    NEGATE_ALL: /^!(\*|\[\*\])$/
  },
  isObject: function isObject(o) {
    return oPROTO.toString.call(o) === '[object Object]';
  },
  isArray: function isArray(o) {
    return oPROTO.toString.call(o) === '[object Array]';
  },
  isCollection: function isCollection(o) {
    return utils.isObject(o) || utils.isArray(o);
  },
  isset: function isset(o) {
    return o !== undefined && o !== null;
  },
  ensureArray: function ensureArray(o) {
    if (utils.isArray(o)) return o;
    return o === null || o === undefined ? [] : [o];
  },
  hasOwn: function hasOwn(collection, keyOrIndex) {
    if (!collection) return false;
    var isArr = utils.isArray(collection);

    if (!isArr && typeof keyOrIndex === 'string') {
      return keyOrIndex && oPROTO.hasOwnProperty.call(collection, keyOrIndex);
    }

    if (typeof keyOrIndex === 'number') {
      return keyOrIndex >= 0 && keyOrIndex < collection.length;
    }

    return false;
  },
  deepCopy: function deepCopy(collection) {
    if (utils.isObject(collection)) {
      var copy = {};
      Object.keys(collection).forEach(function (k) {
        copy[k] = utils.deepCopy(collection[k]);
      });
      return copy;
    }

    if (utils.isArray(collection)) return collection.map(utils.deepCopy); // not object or array

    return collection;
  },
  // iterates over elements of an array, executing the callback for each
  // element.
  each: function each(array, callback, thisArg) {
    var len = array.length;
    var index = -1;

    while (++index < len) {
      if (callback.apply(thisArg, [array[index], index, array]) === false) break;
    }
  },
  eachRight: function eachRight(array, callback, thisArg) {
    var index = array.length;

    while (index--) {
      if (callback.apply(thisArg, [array[index], index, array]) === false) break;
    }
  },
  eachProp: function eachProp(object, callback, thisArg) {
    var keys = Object.keys(object);
    var index = -1;

    while (++index < keys.length) {
      var key = keys[index];
      if (callback.apply(thisArg, [object[key], key, object]) === false) break;
    }
  },
  eachItem: function eachItem(collection, callback, thisArg) {
    if (utils.isArray(collection)) {
      return utils.each(collection, callback, thisArg);
    }

    return utils.eachProp(collection, callback, thisArg);
  },
  pregQuote: function pregQuote(str) {
    return String(str).replace(utils.re.ESCAPE, '\\$&');
  },
  stringOrArrayOf: function stringOrArrayOf(o, value) {
    return typeof value === 'string' && (o === value || utils.isArray(o) && o.length === 1 && o[0] === value);
  },
  hasSingleItemOf: function hasSingleItemOf(arr, itemValue) {
    return arr.length === 1 && (arguments.length === 2 ? arr[0] === itemValue : true);
  },
  // remove trailing/redundant wildcards if not negated
  normalizeGlobStr: function normalizeGlobStr(glob) {
    return glob.trim().replace(utils.re.NON_NEG_WILDCARD_TRAIL, '$1');
  },
  normalizeNote: function normalizeNote(note) {
    if (utils.re.VAR.test(note)) return note; // check array index notation e.g. `[1]`

    var m = note.match(utils.re.ARRAY_NOTE);
    if (m) return parseInt(m[1], 10); // check object bracket notation e.g. `["a-b"]`

    m = note.match(utils.re.OBJECT_BRACKETS);
    if (m) return m[1] || m[2] || m[3];
    throw new _notation.default("Invalid note: \"".concat(note, "\""));
  },
  joinNotes: function joinNotes(notes) {
    var lastIndex = notes.length - 1;
    return notes.map(function (current, i) {
      if (!current) return '';
      var next = lastIndex >= i + 1 ? notes[i + 1] : null;
      var dot = next ? next[0] === '[' ? '' : '.' : '';
      return current + dot;
    }).join('');
  },
  getNewNotation: function getNewNotation(newNotation, notation) {
    var errMsg = "Invalid new notation: '".concat(newNotation, "'"); // note validations (for newNotation and notation) are already made by
    // other methods in the flow.

    var newN;

    if (typeof newNotation === 'string') {
      newN = newNotation.trim();
      if (!newN) throw new _notation.default(errMsg);
      return newN;
    }

    if (notation && !utils.isset(newNotation)) return notation;
    throw new _notation.default(errMsg);
  }
};
var _default = utils;
exports.default = _default;
//# sourceMappingURL=utils.js.map