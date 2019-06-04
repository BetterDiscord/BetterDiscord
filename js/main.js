var Core =
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/builtins/24hour.js":
/*!********************************!*\
  !*** ./src/builtins/24hour.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");


/* harmony default export */ __webpack_exports__["default"] = (new class TwentyFourHour extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "24Hour";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-gs-6";
  }

  enabled() {
    this.inject24Hour();
  }

  disabled() {
    if (!this.cancel24Hour) return;
    this.cancel24Hour();
    delete this.cancel24Hour;
  }

  inject24Hour() {
    if (this.cancel24Hour) return;
    const twelveHour = new RegExp(`([0-9]{1,2}):([0-9]{1,2})\\s(AM|PM)`);

    const convert = data => {
      const matched = data.returnValue.match(twelveHour);
      if (!matched || matched.length !== 4) return;
      if (matched[3] === "AM") return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "00" : matched[1].padStart(2, "0")}:${matched[2]}`);
      return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "12" : parseInt(matched[1]) + 12}:${matched[2]}`);
    };

    const cancelCozy = modules__WEBPACK_IMPORTED_MODULE_1__["Utilities"].monkeyPatch(modules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].TimeFormatter, "calendarFormat", {
      after: convert
    }); // Called in Cozy mode

    const cancelCompact = modules__WEBPACK_IMPORTED_MODULE_1__["Utilities"].monkeyPatch(modules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].TimeFormatter, "dateFormat", {
      after: convert
    }); // Called in Compact mode

    this.cancel24Hour = () => {
      cancelCozy();
      cancelCompact();
    }; // Cancel both

  }

}());

/***/ }),

/***/ "./src/builtins/builtins.js":
/*!**********************************!*\
  !*** ./src/builtins/builtins.js ***!
  \**********************************/
/*! exports provided: VoiceMode, ClassNormalizer, DeveloperMode, PublicServers, DarkMode, MinimalMode, TwentyFourHour, ColoredText, VoiceDisconnect, EmoteMenu, EmoteAutocaps, EmoteModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _voicemode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./voicemode */ "./src/builtins/voicemode.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VoiceMode", function() { return _voicemode__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _classnormalizer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./classnormalizer */ "./src/builtins/classnormalizer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ClassNormalizer", function() { return _classnormalizer__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _developermode__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./developermode */ "./src/builtins/developermode.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DeveloperMode", function() { return _developermode__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _publicservers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./publicservers */ "./src/builtins/publicservers.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PublicServers", function() { return _publicservers__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _darkmode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./darkmode */ "./src/builtins/darkmode.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DarkMode", function() { return _darkmode__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _minimalmode__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./minimalmode */ "./src/builtins/minimalmode.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MinimalMode", function() { return _minimalmode__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _24hour__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./24hour */ "./src/builtins/24hour.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TwentyFourHour", function() { return _24hour__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _coloredtext__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./coloredtext */ "./src/builtins/coloredtext.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ColoredText", function() { return _coloredtext__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _voicedisconnect__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./voicedisconnect */ "./src/builtins/voicedisconnect.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VoiceDisconnect", function() { return _voicedisconnect__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _emotemenu__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./emotemenu */ "./src/builtins/emotemenu.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EmoteMenu", function() { return _emotemenu__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _emoteautocaps__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./emoteautocaps */ "./src/builtins/emoteautocaps.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EmoteAutocaps", function() { return _emoteautocaps__WEBPACK_IMPORTED_MODULE_10__["default"]; });

/* harmony import */ var _emotes__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./emotes */ "./src/builtins/emotes.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EmoteModule", function() { return _emotes__WEBPACK_IMPORTED_MODULE_11__["default"]; });














/***/ }),

/***/ "./src/builtins/classnormalizer.js":
/*!*****************************************!*\
  !*** ./src/builtins/classnormalizer.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");


const normalizedPrefix = "da";
const randClass = new RegExp(`^(?!${normalizedPrefix}-)((?:[A-Za-z]|[0-9]|-)+)-(?:[A-Za-z]|[0-9]|-|_){6}$`);
/* harmony default export */ __webpack_exports__["default"] = (new class ClassNormalizer extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get id() {
    return "fork-ps-4";
  }

  get category() {
    return "Modules";
  }

  get name() {
    return "ClassNormalizer";
  }

  enabled() {
    if (this.hasPatched) return;
    this.patchClassModules(modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getModules(this.moduleFilter.bind(this)));
    this.normalizeElement(document.querySelector("#app-mount"));
    this.hasPatched = true;
  }

  disabled() {
    if (!this.hasPatched) return;
    this.unpatchClassModules(modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getModules(this.moduleFilter.bind(this)));
    this.revertElement(document.querySelector("#app-mount"));
    this.hasPatched = false;
  }

  patchClassModules(modules) {
    for (const module of modules) {
      this.patchClassModule(normalizedPrefix, module);
    }
  }

  unpatchClassModules(modules) {
    for (const module of modules) {
      this.unpatchClassModule(normalizedPrefix, module);
    }
  }

  shouldIgnore(value) {
    if (!isNaN(value)) return true;
    if (value.endsWith("px") || value.endsWith("ch") || value.endsWith("em") || value.endsWith("ms")) return true;
    if (value.startsWith("layerContainer-")) return true;
    if (value.startsWith("#") && (value.length == 7 || value.length == 4)) return true;
    if (value.includes("calc(") || value.includes("rgba")) return true;
    return false;
  }

  moduleFilter(module) {
    if (typeof module !== "object" || Array.isArray(module)) return false;
    if (module.__esModule) return false;
    if (!Object.keys(module).length) return false;

    for (const baseClassName in module) {
      const value = module[baseClassName];
      if (typeof value !== "string") return false;
      if (this.shouldIgnore(value)) continue;
      if (value.split("-").length === 1) return false;
      if (!randClass.test(value.split(" ")[0])) return false;
    }

    return true;
  }

  patchClassModule(componentName, classNames) {
    for (const baseClassName in classNames) {
      const value = classNames[baseClassName];
      if (this.shouldIgnore(value)) continue;
      const classList = value.split(" ");

      for (const normalClass of classList) {
        const match = normalClass.match(randClass)[1];
        if (!match) continue; // Shouldn't ever happen since they passed the moduleFilter, but you never know

        const camelCase = match.split("-").map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join("");
        classNames[baseClassName] += ` ${componentName}-${camelCase}`;
      }
    }
  }

  unpatchClassModule(componentName, classNames) {
    for (const baseClassName in classNames) {
      const value = classNames[baseClassName];
      if (this.shouldIgnore(value)) continue;
      let newString = "";
      const classList = value.split(" ");

      for (const normalClass of classList) {
        if (normalClass.startsWith(`${componentName}-`)) continue;
        newString += ` ${normalClass}`;
      }

      classNames[baseClassName] = newString.trim();
    }
  }

  normalizeElement(element) {
    if (!(element instanceof Element)) return;
    const classes = element.classList;

    for (let c = 0, clen = classes.length; c < clen; c++) {
      if (!randClass.test(classes[c])) continue;
      const match = classes[c].match(randClass)[1];
      const newClass = match.split("-").map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join("");
      element.classList.add(`${normalizedPrefix}-${newClass}`);
    }

    for (const child of element.children) this.normalizeElement(child);
  }

  revertElement(element) {
    if (!(element instanceof Element)) return;
    if (element.children && element.children.length) this.revertElement(element.children[0]);
    if (element.nextElementSibling) this.revertElement(element.nextElementSibling);
    const classes = element.classList;
    const toRemove = [];

    for (let c = 0; c < classes.length; c++) {
      if (classes[c].startsWith(`${normalizedPrefix}-`)) toRemove.push(classes[c]);
    }

    element.classList.remove(...toRemove);
  }

}());

/***/ }),

/***/ "./src/builtins/coloredtext.js":
/*!*************************************!*\
  !*** ./src/builtins/coloredtext.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");


const MessageContent = modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getModule(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));
/* harmony default export */ __webpack_exports__["default"] = (new class ColoredText extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "ColoredText";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-gs-7";
  }

  enabled() {
    this.injectColoredText();
  }

  disabled() {
    if (!this.cancelColoredText) return;
    this.cancelColoredText();
    delete this.cancelColoredText;
  }

  injectColoredText() {
    if (this.cancelColoredText) return;
    this.cancelColoredText = modules__WEBPACK_IMPORTED_MODULE_1__["Utilities"].monkeyPatch(MessageContent.prototype, "render", {
      after: data => {
        modules__WEBPACK_IMPORTED_MODULE_1__["Utilities"].monkeyPatch(data.returnValue.props, "children", {
          silent: true,
          after: ({
            returnValue
          }) => {
            const markup = returnValue.props.children[1];
            const roleColor = data.thisObject.props.message.colorString;
            if (markup && roleColor) markup.props.style = {
              color: roleColor
            };
            return returnValue;
          }
        });
      }
    });
  }

  removeColoredText() {
    document.querySelectorAll(".markup-2BOw-j").forEach(elem => {
      elem.style.setProperty("color", "");
    });
  }

}());

/***/ }),

/***/ "./src/builtins/darkmode.js":
/*!**********************************!*\
  !*** ./src/builtins/darkmode.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");

/* harmony default export */ __webpack_exports__["default"] = (new class DarkMode extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "DarkMode";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-gs-5";
  }

  enabled() {
    $("#app-mount").addClass("bda-dark").addClass("bd-dark");
  }

  disabled() {
    $("#app-mount").removeClass("bda-dark").removeClass("bd-dark");
  }

}());

/***/ }),

/***/ "./src/builtins/developermode.js":
/*!***************************************!*\
  !*** ./src/builtins/developermode.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");



/* harmony default export */ __webpack_exports__["default"] = (new class DeveloperMode extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "DeveloperMode";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-gs-8";
  }

  get selectorModeID() {
    return "fork-dm-1";
  }

  get selectorMode() {
    return data__WEBPACK_IMPORTED_MODULE_1__["SettingsCookie"][this.selectorModeID];
  }

  constructor() {
    super();
    this.enableSelectors = this.enableSelectors.bind(this);
    this.disableSelectors = this.disableSelectors.bind(this);
  }

  enabled() {
    $(window).on("keydown.bdDevmode", e => {
      if (e.which === 119 || e.which == 118) {
        //F8
        this.log("Debugger Activated");
        debugger; // eslint-disable-line no-debugger
      }
    });
    if (this.selectorMode) this.enableSelectors();
    this.selectorCancel = Object(_structs_builtin__WEBPACK_IMPORTED_MODULE_0__["onSettingChange"])(this.category, this.selectorModeID, this.enableSelectors, this.disableSelectors);
  }

  disabled() {
    $(window).off("keydown.bdDevmode");
    if (this.selectorMode) this.disableSelectors();
    if (this.selectorCancel) this.selectorCancel();
  }

  enableSelectors() {
    $(document).on("contextmenu.bdDevmode", e => {
      this.lastSelector = this.getSelector(e.toElement);

      const attach = () => {
        let cm = $(".contextMenu-HLZMGh");

        if (cm.length <= 0) {
          cm = $("<div class=\"contextMenu-HLZMGh bd-context-menu\"></div>");
          cm.addClass($(".app, .app-2rEoOp").hasClass("theme-dark") ? "theme-dark" : "theme-light");
          cm.appendTo(".app, .app-2rEoOp");
          cm.css("top", e.clientY);
          cm.css("left", e.clientX);
          $(document).on("click.bdDevModeCtx", () => {
            cm.remove();
            $(document).off(".bdDevModeCtx");
          });
          $(document).on("contextmenu.bdDevModeCtx", () => {
            cm.remove();
            $(document).off(".bdDevModeCtx");
          });
          $(document).on("keyup.bdDevModeCtx", e => {
            if (e.keyCode === 27) {
              cm.remove();
              $(document).off(".bdDevModeCtx");
            }
          });
        }

        const cmo = $("<div/>", {
          "class": "itemGroup-1tL0uz"
        });
        const cmi = $("<div/>", {
          "class": "item-1Yvehc",
          "click": () => {
            modules__WEBPACK_IMPORTED_MODULE_2__["DiscordModules"].ElectronModule.copy(this.lastSelector);
            cm.hide();
          }
        }).append($("<span/>", {
          text: "Copy Selector"
        }));
        cmo.append(cmi);
        cm.append(cmo);
        if (cm.hasClass("undefined")) cm.css("top", "-=" + cmo.outerHeight());
      };

      setImmediate(attach);
      e.stopPropagation();
    });
  }

  disableSelectors() {
    $(document).off("contextmenu.bdDevmode");
    $(document).off("contextmenu.bdDevModeCtx");
  }

  getRules(element, css = element.ownerDocument.styleSheets) {
    // return [].concat(...[...css].map(s => [...s.cssRules || []])).filter(r => r && r.selectorText && element.matches(r.selectorText) && r.style.length && r.selectorText.split(", ").length < 8);
    const sheets = [...css].filter(s => !s.href || !s.href.includes("BetterDiscordApp"));
    const rules = sheets.map(s => [...(s.cssRules || [])]).flat();
    const elementRules = rules.filter(r => r && r.selectorText && element.matches(r.selectorText) && r.style.length && r.selectorText.split(", ").length < 8 && !r.selectorText.split(", ").includes("*"));
    return elementRules;
  }

  getSelector(element) {
    if (element.id) return `#${element.id}`;
    const rules = this.getRules(element);
    const latestRule = rules[rules.length - 1];
    if (latestRule) return latestRule.selectorText;else if (element.classList.length) return `.${Array.from(element.classList).join(".")}`;
    return `.${Array.from(element.parentElement.classList).join(".")}`;
  }

}());

/***/ }),

/***/ "./src/builtins/emoteautocaps.js":
/*!***************************************!*\
  !*** ./src/builtins/emoteautocaps.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");



/* harmony default export */ __webpack_exports__["default"] = (new class EmoteAutocaps extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "EmoteAutocapitalize";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-es-4";
  }

  enabled() {
    $("body").off(".bdac");
    $("body").on("keyup.bdac change.bdac paste.bdac", $(".channelTextArea-1LDbYG textarea:first"), () => {
      const text = $(".channelTextArea-1LDbYG textarea:first").val();
      if (text == undefined) return;
      const lastWord = text.split(" ").pop();

      if (lastWord.length > 3) {
        if (lastWord == "danSgame") return;
        const ret = this.capitalize(lastWord.toLowerCase());

        if (ret !== null && ret !== undefined) {
          modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].insertText(modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].getTextArea()[0], text.replace(lastWord, ret));
        }
      }
    });
  }

  disabled() {
    $("body").off(".bdac");
  }

  capitalize(value) {
    const res = data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].TwitchGlobal;

    for (const p in res) {
      if (res.hasOwnProperty(p) && value == (p + "").toLowerCase()) {
        return p;
      }
    }
  }

}());

/***/ }),

/***/ "./src/builtins/emotemenu.js":
/*!***********************************!*\
  !*** ./src/builtins/emotemenu.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");



const headerHTML = `<div id="bda-qem">
    <button class="active" id="bda-qem-twitch">Twitch</button>
    <button id="bda-qem-favourite">Favourite</button>
    <button id="bda-qem-emojis">Emojis</buttond>
</div>`;
const twitchEmoteHTML = `<div id="bda-qem-twitch-container">
    <div class="scroller-wrap scrollerWrap-2lJEkd fade">
        <div class="scroller scroller-2FKFPG">
            <div class="emote-menu-inner">

            </div>
        </div>
    </div>
</div>`;
const favoritesHTML = `<div id="bda-qem-favourite-container">
    <div class="scroller-wrap scrollerWrap-2lJEkd fade">
        <div class="scroller scroller-2FKFPG">
            <div class="emote-menu-inner">

            </div>
        </div>
    </div>
</div>`;

const makeEmote = (emote, url, options = {}) => {
  const {
    onContextMenu,
    onClick
  } = options;
  const emoteContainer = $(`<div class="emote-container">
        <img class="emote-icon" alt="${emote}" src="${url}" title="${emote}">
    </div>`)[0];
  if (onContextMenu) emoteContainer.addEventListener("contextmenu", onContextMenu);
  emoteContainer.addEventListener("click", onClick);
  return emoteContainer;
};

/* harmony default export */ __webpack_exports__["default"] = (new class EmoteMenu extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "EmoteMenu";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-es-0";
  }

  get hideEmojisID() {
    return "bda-es-9";
  }

  get hideEmojis() {
    return data__WEBPACK_IMPORTED_MODULE_1__["SettingsCookie"][this.hideEmojisID];
  }

  constructor() {
    super();
    this.lastTab = "bda-qem-emojis";
    this.favoriteEmotes = {};
    this.qmeHeader = $(headerHTML)[0];

    for (const button of this.qmeHeader.getElementsByTagName("button")) button.addEventListener("click", this.switchMenu.bind(this));

    this.teContainer = $(twitchEmoteHTML)[0];
    this.teContainerInner = this.teContainer.querySelector(".emote-menu-inner");
    this.faContainer = $(favoritesHTML)[0];
    this.faContainerInner = this.faContainer.querySelector(".emote-menu-inner");
    this.observer = new MutationObserver(mutations => {
      for (const mutation of mutations) this.observe(mutation);
    });
    this.enableHideEmojis = this.enableHideEmojis.bind(this);
    this.disableHideEmojis = this.disableHideEmojis.bind(this);
    this.updateTwitchEmotes = this.updateTwitchEmotes.bind(this);
  }

  initialize() {
    super.initialize();
    const fe = modules__WEBPACK_IMPORTED_MODULE_2__["DataStore"].getBDData("bdfavemotes");
    if (fe !== "" && fe !== null) this.favoriteEmotes = JSON.parse(atob(fe));
    this.updateFavorites();
  }

  async enabled() {
    this.log("Starting to observe");
    this.observer.observe(document.getElementById("app-mount"), {
      childList: true,
      subtree: true
    });
    this.hideEmojiCancel = Object(_structs_builtin__WEBPACK_IMPORTED_MODULE_0__["onSettingChange"])(this.category, this.hideEmojisID, this.enableHideEmojis, this.disableHideEmojis);
    if (this.hideEmojis) this.enableHideEmojis(); // await this.waitForEmotes();
    // this.updateTwitchEmotes();

    if (data__WEBPACK_IMPORTED_MODULE_1__["State"].emotesLoaded) this.updateTwitchEmotes();
    modules__WEBPACK_IMPORTED_MODULE_2__["Events"].on("emotes-loaded", this.updateTwitchEmotes);
  }

  disabled() {
    modules__WEBPACK_IMPORTED_MODULE_2__["Events"].off("emotes-loaded", this.updateTwitchEmotes);
    this.observer.disconnect();
    this.disableHideEmojis();
    if (this.hideEmojiCancel) this.hideEmojiCancel();
  }

  async waitForEmotes() {
    if (data__WEBPACK_IMPORTED_MODULE_1__["State"].emotesLoaded) return;
    return new Promise(resolve => {
      modules__WEBPACK_IMPORTED_MODULE_2__["Events"].on("emotes-loaded", resolve);
    });
  }

  enableHideEmojis() {
    $(".emojiPicker-3m1S-j").addClass("bda-qme-hidden");
  }

  disableHideEmojis() {
    $(".emojiPicker-3m1S-j").removeClass("bda-qme-hidden");
  }

  insertEmote(emote) {
    const ta = modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].getTextArea();
    modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].insertText(ta[0], ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
  }

  favContext(e) {
    e.stopPropagation();
    const em = e.target.closest(".emote-container").children[0];
    const menu = $(`<div id="removemenu" class="bd-context-menu context-menu theme-dark">Remove</div>`);
    menu.css({
      top: e.pageY - $("#bda-qem-favourite-container").offset().top,
      left: e.pageX - $("#bda-qem-favourite-container").offset().left
    });
    $(em).parent().append(menu);
    menu.on("click", e => {
      e.preventDefault();
      e.stopPropagation();
      $(em).remove();
      delete this.favoriteEmotes[$(em).attr("title")];
      this.updateFavorites();
      $(document).off("mousedown.emotemenu");
    });
    $(document).on("mousedown.emotemenu", function (e) {
      if (e.target.id == "removemenu") return;
      $("#removemenu").remove();
      $(document).off("mousedown.emotemenu");
    });
  }

  switchMenu(e) {
    let id = typeof e == "string" ? e : $(e.target).attr("id");
    if (id == "bda-qem-emojis" && this.hideEmojis) id = "bda-qem-favourite";
    const twitch = $("#bda-qem-twitch");
    const fav = $("#bda-qem-favourite");
    const emojis = $("#bda-qem-emojis");
    twitch.removeClass("active");
    fav.removeClass("active");
    emojis.removeClass("active");
    $(".emojiPicker-3m1S-j").hide();
    $("#bda-qem-favourite-container").hide();
    $("#bda-qem-twitch-container").hide();

    switch (id) {
      case "bda-qem-twitch":
        twitch.addClass("active");
        $("#bda-qem-twitch-container").show();
        break;

      case "bda-qem-favourite":
        fav.addClass("active");
        $("#bda-qem-favourite-container").show();
        break;

      case "bda-qem-emojis":
        emojis.addClass("active");
        $(".emojiPicker-3m1S-j").show();
        $(".emojiPicker-3m1S-j input").focus();
        break;
    }

    if (id) this.lastTab = id;
  }

  observe(mutation) {
    if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) return;
    const node = mutation.addedNodes[0];
    if (!node.classList.contains("popout-3sVMXz") || node.classList.contains("popoutLeft-30WmrD") || !node.getElementsByClassName("emojiPicker-3m1S-j").length) return;
    const e = $(node);
    if (this.hideEmojis) e.addClass("bda-qme-hidden");else e.removeClass("bda-qme-hidden");
    e.prepend(this.qmeHeader);
    e.append(this.teContainer);
    e.append(this.faContainer);
    this.switchMenu(this.lastTab);
  }

  favorite(name, url) {
    if (!this.favoriteEmotes.hasOwnProperty(name)) this.favoriteEmotes[name] = url;
    this.updateFavorites();
  }

  updateTwitchEmotes() {
    while (this.teContainerInner.firstChild) this.teContainerInner.firstChild.remove();

    for (const emote in data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].TwitchGlobal) {
      if (!data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].TwitchGlobal.hasOwnProperty(emote)) continue;
      const url = data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].TwitchGlobal[emote];
      const emoteElement = makeEmote(emote, url, {
        onClick: this.insertEmote.bind(this, emote)
      });
      this.teContainerInner.append(emoteElement);
    }
  }

  updateFavorites() {
    while (this.faContainerInner.firstChild) this.faContainerInner.firstChild.remove();

    for (const emote in this.favoriteEmotes) {
      const url = this.favoriteEmotes[emote];
      const emoteElement = makeEmote(emote, url, {
        onClick: this.insertEmote.bind(this, emote),
        onContextMenu: this.favContext.bind(this)
      });
      this.faContainerInner.append(emoteElement);
    }

    modules__WEBPACK_IMPORTED_MODULE_2__["DataStore"].setBDData("bdfavemotes", btoa(JSON.stringify(this.favoriteEmotes)));
  }

}());

/***/ }),

/***/ "./src/builtins/emotes.js":
/*!********************************!*\
  !*** ./src/builtins/emotes.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");
/* harmony import */ var _ui_emote__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ui/emote */ "./src/ui/emote.js");
/* harmony import */ var ui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ui */ "./src/ui/ui.js");





const bdEmoteSettingIDs = {
  TwitchGlobal: "bda-es-7",
  TwitchSubscriber: "bda-es-7",
  BTTV: "bda-es-2",
  FrankerFaceZ: "bda-es-1",
  BTTV2: "bda-es-2"
};
/* harmony default export */ __webpack_exports__["default"] = (new class EmoteModule extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "Emotes";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "";
  }

  get categories() {
    return Object.keys(bdEmoteSettingIDs).filter(k => data__WEBPACK_IMPORTED_MODULE_1__["SettingsCookie"][bdEmoteSettingIDs[k]]);
  }

  get MessageContentComponent() {
    return modules__WEBPACK_IMPORTED_MODULE_2__["WebpackModules"].getModule(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));
  }

  async initialize() {
    super.initialize(); // Disable emote module for now because it's annoying and slow
    // await this.getBlacklist();
    // await this.loadEmoteData(EmoteInfo);
    // while (!this.MessageContentComponent) await new Promise(resolve => setTimeout(resolve, 100));
    // this.patchMessageContent();
  }

  disabled() {
    if (this.cancelEmoteRender) return;
    this.cancelEmoteRender();
    delete this.cancelEmoteRender;
  }

  patchMessageContent() {
    if (this.cancelEmoteRender) return;
    this.cancelEmoteRender = modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].monkeyPatch(this.MessageContentComponent.prototype, "render", {
      after: ({
        returnValue
      }) => {
        modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].monkeyPatch(returnValue.props, "children", {
          silent: true,
          after: ({
            returnValue
          }) => {
            if (this.categories.length == 0) return;
            const markup = returnValue.props.children[1];
            if (!markup.props.children) return;
            const nodes = markup.props.children[1];
            if (!nodes || !nodes.length) return;

            for (let n = 0; n < nodes.length; n++) {
              const node = nodes[n];
              if (typeof node !== "string") continue;
              const words = node.split(/([^\s]+)([\s]|$)/g);

              for (let c = 0, clen = this.categories.length; c < clen; c++) {
                for (let w = 0, wlen = words.length; w < wlen; w++) {
                  const emote = words[w];
                  const emoteSplit = emote.split(":");
                  const emoteName = emoteSplit[0];
                  let emoteModifier = emoteSplit[1] ? emoteSplit[1] : "";
                  let emoteOverride = emoteModifier.slice(0);
                  if (emoteName.length < 4 || data__WEBPACK_IMPORTED_MODULE_1__["EmoteBlacklist"].includes(emoteName)) continue;
                  if (!data__WEBPACK_IMPORTED_MODULE_1__["EmoteModifiers"].includes(emoteModifier) || !data__WEBPACK_IMPORTED_MODULE_1__["SettingsCookie"]["bda-es-8"]) emoteModifier = "";
                  if (!data__WEBPACK_IMPORTED_MODULE_1__["EmoteOverrides"].includes(emoteOverride)) emoteOverride = "";else emoteModifier = emoteOverride;
                  let current = this.categories[c];

                  if (emoteOverride === "twitch") {
                    if (data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].TwitchGlobal[emoteName]) current = "TwitchGlobal";else if (data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].TwitchSubscriber[emoteName]) current = "TwitchSubscriber";
                  } else if (emoteOverride === "bttv") {
                    if (data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].BTTV[emoteName]) current = "BTTV";else if (data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].BTTV2[emoteName]) current = "BTTV2";
                  } else if (emoteOverride === "ffz") {
                    if (data__WEBPACK_IMPORTED_MODULE_1__["Emotes"].FrankerFaceZ[emoteName]) current = "FrankerFaceZ";
                  }

                  if (!data__WEBPACK_IMPORTED_MODULE_1__["Emotes"][current][emoteName] || !data__WEBPACK_IMPORTED_MODULE_1__["SettingsCookie"][bdEmoteSettingIDs[current]]) continue;
                  const results = nodes[n].match(new RegExp(`([\\s]|^)${modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].escape(emoteModifier ? emoteName + ":" + emoteModifier : emoteName)}([\\s]|$)`));
                  if (!results) continue;
                  const pre = nodes[n].substring(0, results.index + results[1].length);
                  const post = nodes[n].substring(results.index + results[0].length - results[2].length);
                  nodes[n] = pre;
                  const emoteComponent = modules__WEBPACK_IMPORTED_MODULE_2__["DiscordModules"].React.createElement(_ui_emote__WEBPACK_IMPORTED_MODULE_3__["default"], {
                    name: emoteName,
                    url: data__WEBPACK_IMPORTED_MODULE_1__["Emotes"][current][emoteName],
                    modifier: emoteModifier
                  });
                  nodes.splice(n + 1, 0, post);
                  nodes.splice(n + 1, 0, emoteComponent);
                }
              }
            }

            const onlyEmotes = nodes.every(r => {
              if (typeof r == "string" && r.replace(/\s*/, "") == "") return true;else if (r.type && r.type.name == "BDEmote") return true;else if (r.props && r.props.children && r.props.children.props && r.props.children.props.emojiName) return true;
              return false;
            });
            if (!onlyEmotes) return;

            for (const node of nodes) {
              if (typeof node != "object") continue;
              if (node.type.name == "BDEmote") node.props.jumboable = true;else if (node.props && node.props.children && node.props.children.props && node.props.children.props.emojiName) node.props.children.props.jumboable = true;
            }
          }
        });
      }
    });
  }

  async loadEmoteData(emoteInfo) {
    const _fs = __webpack_require__(/*! fs */ "fs");

    const emoteFile = "emote_data.json";
    const file = data__WEBPACK_IMPORTED_MODULE_1__["Config"].dataPath + emoteFile;

    const exists = _fs.existsSync(file);

    if (exists && this.isCacheValid()) {
      ui__WEBPACK_IMPORTED_MODULE_4__["Toasts"].show("Loading emotes from cache.", {
        type: "info"
      });
      modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].log("Emotes", "Loading emotes from local cache.");
      const data = await new Promise(resolve => {
        _fs.readFile(file, "utf8", (err, data) => {
          modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].log("Emotes", "Emotes loaded from cache.");
          if (err) data = {};
          resolve(data);
        });
      });
      let isValid = modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].testJSON(data);
      if (isValid) Object.assign(data__WEBPACK_IMPORTED_MODULE_1__["Emotes"], JSON.parse(data));

      for (const e in emoteInfo) {
        isValid = Object.keys(data__WEBPACK_IMPORTED_MODULE_1__["Emotes"][emoteInfo[e].variable]).length > 0;
      }

      if (isValid) {
        ui__WEBPACK_IMPORTED_MODULE_4__["Toasts"].show("Emotes successfully loaded.", {
          type: "success"
        });
        data__WEBPACK_IMPORTED_MODULE_1__["State"].emotesLoaded = true;
        modules__WEBPACK_IMPORTED_MODULE_2__["Events"].dispatch("emotes-loaded");
        return;
      }

      modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].log("Emotes", "Cache was corrupt, downloading...");

      _fs.unlinkSync(file);
    }

    if (!data__WEBPACK_IMPORTED_MODULE_1__["SettingsCookie"]["fork-es-3"]) return;
    ui__WEBPACK_IMPORTED_MODULE_4__["Toasts"].show("Downloading emotes in the background do not reload.", {
      type: "info"
    });

    for (const e in emoteInfo) {
      await new Promise(r => setTimeout(r, 1000));
      const data = await this.downloadEmotes(emoteInfo[e]);
      data__WEBPACK_IMPORTED_MODULE_1__["Emotes"][emoteInfo[e].variable] = data;
    }

    ui__WEBPACK_IMPORTED_MODULE_4__["Toasts"].show("All emotes successfully downloaded.", {
      type: "success"
    });

    try {
      _fs.writeFileSync(file, JSON.stringify(data__WEBPACK_IMPORTED_MODULE_1__["Emotes"]), "utf8");
    } catch (err) {
      modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].err("Emotes", "Could not save emote data.", err);
    }

    data__WEBPACK_IMPORTED_MODULE_1__["State"].emotesLoaded = true;
    modules__WEBPACK_IMPORTED_MODULE_2__["Events"].dispatch("emotes-loaded");
  }

  downloadEmotes(emoteMeta) {
    const request = __webpack_require__(/*! request */ "request");

    const options = {
      url: emoteMeta.url,
      timeout: emoteMeta.timeout ? emoteMeta.timeout : 5000
    };
    modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].log("Emotes", `Downloading: ${emoteMeta.variable} (${emoteMeta.url})`);
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].err("Emotes", "Could not download " + emoteMeta.variable, error);

          if (emoteMeta.backup) {
            emoteMeta.url = emoteMeta.backup;
            emoteMeta.backup = null;
            if (emoteMeta.backupParser) emoteMeta.parser = emoteMeta.backupParser;
            return resolve(this.downloadEmotes(emoteMeta));
          }

          return reject({});
        }

        let parsedData = {};

        try {
          parsedData = JSON.parse(body);
        } catch (err) {
          modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].err("Emotes", "Could not download " + emoteMeta.variable, err);

          if (emoteMeta.backup) {
            emoteMeta.url = emoteMeta.backup;
            emoteMeta.backup = null;
            if (emoteMeta.backupParser) emoteMeta.parser = emoteMeta.backupParser;
            return resolve(this.downloadEmotes(emoteMeta));
          }

          return reject({});
        }

        if (typeof emoteMeta.parser === "function") parsedData = emoteMeta.parser(parsedData);

        for (const emote in parsedData) {
          if (emote.length < 4 || data__WEBPACK_IMPORTED_MODULE_1__["EmoteBlacklist"].includes(emote)) {
            delete parsedData[emote];
            continue;
          }

          parsedData[emote] = emoteMeta.getEmoteURL(parsedData[emote]);
        }

        resolve(parsedData);
        modules__WEBPACK_IMPORTED_MODULE_2__["Utilities"].log("Emotes", "Downloaded: " + emoteMeta.variable);
      });
    });
  }

  getBlacklist() {
    return new Promise(resolve => {
      $.getJSON(`https://rauenzi.github.io/BetterDiscordApp/data/emotefilter.json`, function (data) {
        resolve(data__WEBPACK_IMPORTED_MODULE_1__["EmoteBlacklist"].push(...data.blacklist));
      });
    });
  }

  isCacheValid() {
    const cacheLength = modules__WEBPACK_IMPORTED_MODULE_2__["DataStore"].getBDData("emoteCacheDays") || modules__WEBPACK_IMPORTED_MODULE_2__["DataStore"].setBDData("emoteCacheDays", 7) || 7;
    const cacheDate = new Date(modules__WEBPACK_IMPORTED_MODULE_2__["DataStore"].getBDData("emoteCacheDate") || null);
    const currentDate = new Date();
    const daysBetween = Math.round(Math.abs((currentDate.getTime() - cacheDate.getTime()) / (24 * 60 * 60 * 1000)));

    if (daysBetween > cacheLength) {
      modules__WEBPACK_IMPORTED_MODULE_2__["DataStore"].setBDData("emoteCacheDate", currentDate.toJSON());
      return false;
    }

    return true;
  }

  clearEmoteData() {
    const _fs = __webpack_require__(/*! fs */ "fs");

    const emoteFile = "emote_data.json";
    const file = data__WEBPACK_IMPORTED_MODULE_1__["Config"].dataPath + emoteFile;

    const exists = _fs.existsSync(file);

    if (exists) _fs.unlinkSync(file);
    modules__WEBPACK_IMPORTED_MODULE_2__["DataStore"].setBDData("emoteCacheDate", new Date().toJSON());

    for (const category in data__WEBPACK_IMPORTED_MODULE_1__["Emotes"]) Object.assign(data__WEBPACK_IMPORTED_MODULE_1__["Emotes"], {
      [category]: {}
    });
  }

}());

/***/ }),

/***/ "./src/builtins/minimalmode.js":
/*!*************************************!*\
  !*** ./src/builtins/minimalmode.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! data */ "./src/data/data.js");


/* harmony default export */ __webpack_exports__["default"] = (new class MinimalMode extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "MinimalMode";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-gs-2";
  }

  get hideChannelsID() {
    return "bda-gs-3";
  }

  get hideChannels() {
    return data__WEBPACK_IMPORTED_MODULE_1__["SettingsCookie"][this.hideChannelsID];
  }

  constructor() {
    super();
    this.enableHideChannels = this.enableHideChannels.bind(this);
    this.disableHideChannels = this.disableHideChannels.bind(this);
  }

  enabled() {
    $("body").addClass("bd-minimal");
    if (this.hideChannels) this.enableHideChannels();
    this.hideChannelCancel = Object(_structs_builtin__WEBPACK_IMPORTED_MODULE_0__["onSettingChange"])(this.category, this.hideChannelsID, this.enableHideChannels, this.disableHideChannels);
  }

  disabled() {
    $("body").removeClass("bd-minimal");
    if (this.hideChannels) this.disableHideChannels();
    if (this.hideChannelCancel) this.hideChannelCancel();
  }

  enableHideChannels() {
    $("body").addClass("bd-minimal-chan");
  }

  disableHideChannels() {
    $("body").removeClass("bd-minimal-chan");
  }

}());

/***/ }),

/***/ "./src/builtins/publicservers.js":
/*!***************************************!*\
  !*** ./src/builtins/publicservers.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");
/* harmony import */ var ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ui */ "./src/ui/ui.js");




/* harmony default export */ __webpack_exports__["default"] = (new class PublicServers extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "PublicServers";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-gs-1";
  }

  enabled() {
    const wrapper = modules__WEBPACK_IMPORTED_MODULE_2__["BDV2"].guildClasses.wrapper.split(" ")[0];
    const guilds = $(`.${wrapper} .scroller-2FKFPG >:first-child`);
    guilds.after(this.button);
  }

  disabled() {
    $("#bd-pub-li").remove();
  }

  get component() {
    return modules__WEBPACK_IMPORTED_MODULE_2__["DiscordModules"].React.createElement(ui__WEBPACK_IMPORTED_MODULE_3__["PublicServers"].Layer, {
      rootId: "pubslayerroot",
      id: "pubslayer"
    }, modules__WEBPACK_IMPORTED_MODULE_2__["DiscordModules"].React.createElement(ui__WEBPACK_IMPORTED_MODULE_3__["PublicServers"].Menu, {
      rootId: "pubslayerroot"
    }));
  }

  get root() {
    const _root = document.getElementById("pubslayerroot");

    if (!_root) {
      if (!this.injectRoot()) return null;
      return this.root;
    }

    return _root;
  }

  injectRoot() {
    if (!$(".layers, .layers-3iHuyZ").length) return false;
    $(".layers, .layers-3iHuyZ").append($("<div/>", {
      id: "pubslayerroot"
    }));
    return true;
  }

  render() {
    const root = this.root;

    if (!root) {
      console.log("FAILED TO LOCATE ROOT: .layers");
      return;
    }

    modules__WEBPACK_IMPORTED_MODULE_2__["DiscordModules"].ReactDOM.render(this.component, root);
  }

  get button() {
    const btn = $("<div/>", {
      "class": modules__WEBPACK_IMPORTED_MODULE_2__["BDV2"].guildClasses.listItem,
      "id": "bd-pub-li"
    }).append($("<div/>", {
      "class": "wrapper-25eVIn " + modules__WEBPACK_IMPORTED_MODULE_2__["BDV2"].guildClasses.circleButtonMask,
      "text": "public",
      "id": "bd-pub-button",
      "click": () => {
        this.render();
      }
    }));
    return btn;
  }

}());

/***/ }),

/***/ "./src/builtins/voicedisconnect.js":
/*!*****************************************!*\
  !*** ./src/builtins/voicedisconnect.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");


/* harmony default export */ __webpack_exports__["default"] = (new class DarkMode extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "VoiceDisconnect";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-dc-0";
  }

  constructor() {
    super();
    this.beforeUnload = this.beforeUnload.bind(this);
  }

  enabled() {
    window.addEventListener("beforeunload", this.beforeUnload);
  }

  disabled() {
    window.removeEventListener("beforeunload", this.beforeUnload);
  }

  beforeUnload() {
    modules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].ChannelActions.selectVoiceChannel(null, null);
  }

}());

/***/ }),

/***/ "./src/builtins/voicemode.js":
/*!***********************************!*\
  !*** ./src/builtins/voicemode.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _structs_builtin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../structs/builtin */ "./src/structs/builtin.js");

/* harmony default export */ __webpack_exports__["default"] = (new class VoiceMode extends _structs_builtin__WEBPACK_IMPORTED_MODULE_0__["default"] {
  get name() {
    return "VoiceMode";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "bda-gs-4";
  }

  enabled() {
    $(".scroller.guild-channels ul").first().css("display", "none");
    $(".scroller.guild-channels header").first().css("display", "none");
    $(".app.flex-vertical, .app-2rEoOp").first().css("overflow", "hidden");
    $(".chat-3bRxxu").first().css("visibility", "hidden").css("min-width", "0px");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
  }

  disabled() {
    $(".scroller.guild-channels ul").first().css("display", "");
    $(".scroller.guild-channels header").first().css("display", "");
    $(".app.flex-vertical, .app-2rEoOp").first().css("overflow", "");
    $(".chat-3bRxxu").first().css("visibility", "").css("min-width", "");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "");
  }

}());

/***/ }),

/***/ "./src/data/config.js":
/*!****************************!*\
  !*** ./src/data/config.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  local: false,
  localServer: "//localhost:8080",
  minified: true,
  version: "0.3.0",
  branch: "master",
  repo: "rauenzi",
  minSupportedVersion: "0.3.0",
  bbdVersion: "0.2.17"
});

/***/ }),

/***/ "./src/data/cookies/plugincookie.js":
/*!******************************************!*\
  !*** ./src/data/cookies/plugincookie.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),

/***/ "./src/data/cookies/settingscookie.js":
/*!********************************************!*\
  !*** ./src/data/cookies/settingscookie.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  "bda-gs-1": true,
  "bda-gs-2": false,
  "bda-gs-3": false,
  "bda-gs-4": false,
  "bda-gs-5": true,
  "bda-gs-6": false,
  "bda-gs-7": false,
  "bda-gs-8": false,
  "bda-es-0": true,
  "bda-es-1": true,
  "bda-es-2": true,
  "bda-es-4": false,
  "bda-es-6": true,
  "bda-es-7": true,
  "bda-gs-b": false,
  "bda-es-8": true,
  "bda-dc-0": false,
  "bda-css-0": false,
  "bda-css-1": false,
  "bda-es-9": true,
  "fork-dm-1": false,
  "fork-ps-1": true,
  "fork-ps-2": true,
  "fork-ps-3": true,
  "fork-ps-4": true,
  "fork-ps-5": true,
  "fork-es-2": false,
  "fork-es-3": true,
  "fork-wp-1": false,
  "fork-wp-2": false
});

/***/ }),

/***/ "./src/data/cookies/themecookie.js":
/*!*****************************************!*\
  !*** ./src/data/cookies/themecookie.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),

/***/ "./src/data/data.js":
/*!**************************!*\
  !*** ./src/data/data.js ***!
  \**************************/
/*! exports provided: State, SettingsInfo, SettingsCookie, Config, PluginCookie, ThemeCookie, Themes, Plugins, Emotes, EmoteBlacklist, EmoteInfo, EmoteModifiers, EmoteOverrides */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./state */ "./src/data/state.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "State", function() { return _state__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settings */ "./src/data/settings.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SettingsInfo", function() { return _settings__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _cookies_settingscookie__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cookies/settingscookie */ "./src/data/cookies/settingscookie.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SettingsCookie", function() { return _cookies_settingscookie__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./config */ "./src/data/config.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Config", function() { return _config__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _cookies_plugincookie__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cookies/plugincookie */ "./src/data/cookies/plugincookie.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PluginCookie", function() { return _cookies_plugincookie__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _cookies_themecookie__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./cookies/themecookie */ "./src/data/cookies/themecookie.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ThemeCookie", function() { return _cookies_themecookie__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _themes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./themes */ "./src/data/themes.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Themes", function() { return _themes__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _plugins__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./plugins */ "./src/data/plugins.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Plugins", function() { return _plugins__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _emotes_emotes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./emotes/emotes */ "./src/data/emotes/emotes.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Emotes", function() { return _emotes_emotes__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _emotes_blacklist__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./emotes/blacklist */ "./src/data/emotes/blacklist.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EmoteBlacklist", function() { return _emotes_blacklist__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _emotes_info__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./emotes/info */ "./src/data/emotes/info.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EmoteInfo", function() { return _emotes_info__WEBPACK_IMPORTED_MODULE_10__["default"]; });

/* harmony import */ var _emotes_modifiers__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./emotes/modifiers */ "./src/data/emotes/modifiers.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EmoteModifiers", function() { return _emotes_modifiers__WEBPACK_IMPORTED_MODULE_11__["default"]; });

/* harmony import */ var _emotes_overrides__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./emotes/overrides */ "./src/data/emotes/overrides.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EmoteOverrides", function() { return _emotes_overrides__WEBPACK_IMPORTED_MODULE_12__["default"]; });
















/***/ }),

/***/ "./src/data/emotes/blacklist.js":
/*!**************************************!*\
  !*** ./src/data/emotes/blacklist.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ([]);

/***/ }),

/***/ "./src/data/emotes/emotes.js":
/*!***********************************!*\
  !*** ./src/data/emotes/emotes.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  TwitchGlobal: {},
  TwitchSubscriber: {},
  BTTV: {},
  FrankerFaceZ: {},
  BTTV2: {}
});

/***/ }),

/***/ "./src/data/emotes/info.js":
/*!*********************************!*\
  !*** ./src/data/emotes/info.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  TwitchGlobal: {
    url: "https://twitchemotes.com/api_cache/v3/global.json",
    backup: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_global.json`,
    variable: "TwitchGlobal",
    getEmoteURL: e => `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0`,
    getOldData: (url, name) => {
      return {
        id: url.match(/\/([0-9]+)\//)[1],
        code: name,
        emoticon_set: 0,
        description: null
      };
    }
  },
  TwitchSubscriber: {
    url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_twitch_subscriber.json`,
    variable: "TwitchSubscriber",
    getEmoteURL: e => `https://static-cdn.jtvnw.net/emoticons/v1/${e}/1.0`,
    getOldData: url => url.match(/\/([0-9]+)\//)[1]
  },
  FrankerFaceZ: {
    url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_ffz.json`,
    variable: "FrankerFaceZ",
    getEmoteURL: e => `https://cdn.frankerfacez.com/emoticon/${e}/1`,
    getOldData: url => url.match(/\/([0-9]+)\//)[1]
  },
  BTTV: {
    url: "https://api.betterttv.net/emotes",
    variable: "BTTV",
    parser: data => {
      const emotes = {};

      for (let e = 0, len = data.emotes.length; e < len; e++) {
        const emote = data.emotes[e];
        emotes[emote.regex] = emote.url;
      }

      return emotes;
    },
    getEmoteURL: e => `${e}`,
    getOldData: url => url
  },
  BTTV2: {
    url: `https://rauenzi.github.io/BetterDiscordApp/data/emotedata_bttv.json`,
    variable: "BTTV2",
    oldVariable: "emotesBTTV2",
    getEmoteURL: e => `https://cdn.betterttv.net/emote/${e}/1x`,
    getOldData: url => url.match(/emote\/(.+)\//)[1]
  }
});

/***/ }),

/***/ "./src/data/emotes/modifiers.js":
/*!**************************************!*\
  !*** ./src/data/emotes/modifiers.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"]);

/***/ }),

/***/ "./src/data/emotes/overrides.js":
/*!**************************************!*\
  !*** ./src/data/emotes/overrides.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (["twitch", "bttv", "ffz"]);

/***/ }),

/***/ "./src/data/plugins.js":
/*!*****************************!*\
  !*** ./src/data/plugins.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),

/***/ "./src/data/settings.js":
/*!******************************!*\
  !*** ./src/data/settings.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  "Custom css live update": {
    id: "bda-css-0",
    info: "",
    implemented: true,
    hidden: true,
    cat: "core"
  },
  "Custom css auto udpate": {
    id: "bda-css-1",
    info: "",
    implemented: true,
    hidden: true,
    cat: "core"
  },
  "BetterDiscord Blue": {
    id: "bda-gs-b",
    info: "Replace Discord blue with BD Blue",
    implemented: false,
    hidden: false,
    cat: "core"
  },

  /* Core */

  /* ====== */
  "Public Servers": {
    id: "bda-gs-1",
    info: "Display public servers button",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },
  "Minimal Mode": {
    id: "bda-gs-2",
    info: "Hide elements and reduce the size of elements.",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },
  "Voice Mode": {
    id: "bda-gs-4",
    info: "Only show voice chat",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },
  "Hide Channels": {
    id: "bda-gs-3",
    info: "Hide channels in minimal mode",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },
  "Dark Mode": {
    id: "bda-gs-5",
    info: "Make certain elements dark by default(wip)",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },
  "Voice Disconnect": {
    id: "bda-dc-0",
    info: "Disconnect from voice server when closing Discord",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },
  "24 Hour Timestamps": {
    id: "bda-gs-6",
    info: "Replace 12hr timestamps with proper ones",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },
  "Coloured Text": {
    id: "bda-gs-7",
    info: "Make text colour the same as role colour",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },
  "Normalize Classes": {
    id: "fork-ps-4",
    info: "Adds stable classes to elements to help themes. (e.g. adds .da-channels to .channels-Ie2l6A)",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "modules"
  },

  /* Content */
  "Content Error Modal": {
    id: "fork-ps-1",
    info: "Shows a modal with plugin/theme errors",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "content manager"
  },
  "Show Toasts": {
    id: "fork-ps-2",
    info: "Shows a small notification for important information",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "content manager"
  },
  "Scroll To Settings": {
    id: "fork-ps-3",
    info: "Auto-scrolls to a plugin's settings when the button is clicked (only if out of view)",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "content manager"
  },
  "Automatic Loading": {
    id: "fork-ps-5",
    info: "Automatically loads, reloads, and unloads plugins and themes",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "content manager"
  },

  /* Developer */
  "Developer Mode": {
    id: "bda-gs-8",
    info: "Developer Mode",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "developer settings"
  },
  "Copy Selector": {
    id: "fork-dm-1",
    info: "Adds a \"Copy Selector\" option to context menus when developer mode is active",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "developer settings"
  },

  /* Window Prefs */
  "Enable Transparency": {
    id: "fork-wp-1",
    info: "Enables the main window to be see-through (requires restart)",
    implemented: true,
    hidden: false,
    cat: "core",
    category: "window preferences"
  },
  "Window Frame": {
    id: "fork-wp-2",
    info: "Adds the native os window frame to the main window",
    implemented: false,
    hidden: true,
    cat: "core",
    category: "window preferences"
  },

  /* Emotes */

  /* ====== */
  "Download Emotes": {
    id: "fork-es-3",
    info: "Download emotes when the cache is expired",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "Twitch Emotes": {
    id: "bda-es-7",
    info: "Show Twitch emotes",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "FrankerFaceZ Emotes": {
    id: "bda-es-1",
    info: "Show FrankerFaceZ Emotes",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "BetterTTV Emotes": {
    id: "bda-es-2",
    info: "Show BetterTTV Emotes",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "Emote Menu": {
    id: "bda-es-0",
    info: "Show Twitch/Favourite emotes in emote menu",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "Emoji Menu": {
    id: "bda-es-9",
    info: "Show Discord emoji menu",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "Emote Auto Capitalization": {
    id: "bda-es-4",
    info: "Autocapitalize emote commands",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "Show Names": {
    id: "bda-es-6",
    info: "Show emote names on hover",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "Show emote modifiers": {
    id: "bda-es-8",
    info: "Enable emote mods (flip, spin, pulse, spin2, spin3, 1spin, 2spin, 3spin, tr, bl, br, shake, shake2, shake3, flap)",
    implemented: true,
    hidden: false,
    cat: "emote"
  },
  "Animate On Hover": {
    id: "fork-es-2",
    info: "Only animate the emote modifiers on hover",
    implemented: true,
    hidden: false,
    cat: "emote"
  }
});

/***/ }),

/***/ "./src/data/state.js":
/*!***************************!*\
  !*** ./src/data/state.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  emotesLoaded: false
});

/***/ }),

/***/ "./src/data/themes.js":
/*!****************************!*\
  !*** ./src/data/themes.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: default, patchModuleLoad */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CoreWrapper; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "patchModuleLoad", function() { return patchModuleLoad; });
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var _localstorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./localstorage */ "./src/localstorage.js");
/* harmony import */ var _modules_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/core */ "./src/modules/core.js");
/* harmony import */ var _modules_pluginapi__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/pluginapi */ "./src/modules/pluginapi.js");
/* harmony import */ var _modules_pluginmanager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/pluginmanager */ "./src/modules/pluginmanager.js");
/* harmony import */ var _modules_thememanager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/thememanager */ "./src/modules/thememanager.js");
/* harmony import */ var _modules_oldstorage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/oldstorage */ "./src/modules/oldstorage.js");
/* harmony import */ var _modules_emitter__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/emitter */ "./src/modules/emitter.js");







 // Perform some setup

Object(_localstorage__WEBPACK_IMPORTED_MODULE_1__["default"])();
const loadingIcon = document.createElement("div");
loadingIcon.className = "bd-loaderv2";
loadingIcon.title = "BandagedBD is loading...";
document.body.appendChild(loadingIcon); // window.Core = Core;

window.BdApi = _modules_pluginapi__WEBPACK_IMPORTED_MODULE_3__["default"];
window.settings = data__WEBPACK_IMPORTED_MODULE_0__["SettingsInfo"];
window.settingsCookie = data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"];
window.pluginCookie = data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"];
window.themeCookie = data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"];
window.pluginModule = _modules_pluginmanager__WEBPACK_IMPORTED_MODULE_4__["default"];
window.themeModule = _modules_thememanager__WEBPACK_IMPORTED_MODULE_5__["default"];
window.bdthemes = data__WEBPACK_IMPORTED_MODULE_0__["Themes"];
window.bdplugins = data__WEBPACK_IMPORTED_MODULE_0__["Plugins"];
window.bdEmotes = data__WEBPACK_IMPORTED_MODULE_0__["Emotes"];
window.bemotes = data__WEBPACK_IMPORTED_MODULE_0__["EmoteBlacklist"];
window.bdPluginStorage = _modules_oldstorage__WEBPACK_IMPORTED_MODULE_6__["bdPluginStorage"];
window.BDEvents = _modules_emitter__WEBPACK_IMPORTED_MODULE_7__["default"];
window.bdConfig = data__WEBPACK_IMPORTED_MODULE_0__["Config"];
class CoreWrapper {
  constructor(config) {
    _modules_core__WEBPACK_IMPORTED_MODULE_2__["default"].setConfig(config);
  }

  init() {
    _modules_core__WEBPACK_IMPORTED_MODULE_2__["default"].init();
  }

}
function patchModuleLoad() {
  const namespace = "betterdiscord";
  const prefix = `${namespace}/`;

  const Module = __webpack_require__(/*! module */ "module");

  const load = Module._load; // const resolveFilename = Module._resolveFilename;

  Module._load = function (request) {
    if (request === namespace || request.startsWith(prefix)) {
      const requested = request.substr(prefix.length);
      if (requested == "api") return _modules_pluginapi__WEBPACK_IMPORTED_MODULE_3__["default"];
    }

    return load.apply(this, arguments);
  }; // Module._resolveFilename = function (request, parent, isMain) {
  //     if (request === "betterdiscord" || request.startsWith("betterdiscord/")) {
  //         const contentPath = PluginManager.getPluginPathByModule(parent);
  //         if (contentPath) return request;
  //     }
  //     return resolveFilename.apply(this, arguments);
  // };


  return function () {
    Module._load = load;
  };
} // export function getPluginByModule(module) {
//     return this.localContent.find(plugin => module.filename === plugin.contentPath || module.filename.startsWith(plugin.contentPath + path.sep));
// }
// export function getPluginPathByModule(module) {
//     return Object.keys(this.pluginApiInstances).find(contentPath => module.filename === contentPath || module.filename.startsWith(contentPath + path.sep));
// }
// var settingsPanel, emoteModule, quickEmoteMenu, voiceMode,, dMode, publicServersModule;
// var bdConfig = null;

/***/ }),

/***/ "./src/localstorage.js":
/*!*****************************!*\
  !*** ./src/localstorage.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* Localstorage fix */
/* harmony default export */ __webpack_exports__["default"] = (function () {
  const fs = __webpack_require__(/*! fs */ "fs");

  const platform = process.platform;
  const dataPath = (platform === "win32" ? process.env.APPDATA : platform === "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.config") + "/BetterDiscord/";
  const localStorageFile = "localStorage.json";
  let data = {};

  if (fs.existsSync(`${dataPath}${localStorageFile}`)) {
    try {
      data = JSON.parse(fs.readFileSync(`${dataPath}${localStorageFile}`));
    } catch (err) {
      console.log(err);
    }
  } else if (fs.existsSync(localStorageFile)) {
    try {
      data = JSON.parse(fs.readFileSync(localStorageFile));
    } catch (err) {
      console.log(err);
    }
  }

  const storage = data;

  storage.setItem = function (i, v) {
    storage[i] = v;
    this.save();
  };

  storage.getItem = function (i) {
    return storage[i] || null;
  };

  storage.save = function () {
    fs.writeFileSync(`${dataPath}${localStorageFile}`, JSON.stringify(this), null, 4);
  };

  const lsProxy = new Proxy(storage, {
    set: function (target, name, val) {
      storage[name] = val;
      storage.save();
    },
    get: function (target, name) {
      return storage[name] || null;
    }
  });
  window.localStorage = lsProxy;
});

/***/ }),

/***/ "./src/modules/bdv2.js":
/*!*****************************!*\
  !*** ./src/modules/bdv2.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _webpackmodules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webpackmodules */ "./src/modules/webpackmodules.js");
/* harmony import */ var _pluginapi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pluginapi */ "./src/modules/pluginapi.js");
/* harmony import */ var _ui_icons_bdlogo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ui/icons/bdlogo */ "./src/ui/icons/bdlogo.js");



/* harmony default export */ __webpack_exports__["default"] = (new class V2 {
  constructor() {
    this.editorDetached = false;
  }

  initialize() {
    _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].suppressErrors(this.patchSocial.bind(this), "BD Social Patch")();
    _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].suppressErrors(this.patchGuildPills.bind(this), "BD Guild Pills Patch")();
    _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].suppressErrors(this.patchGuildListItems.bind(this), "BD Guild List Items Patch")();
    _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].suppressErrors(this.patchGuildSeparator.bind(this), "BD Guild Separator Patch")();
  }

  get messageClasses() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getByProps("message", "containerCozy");
  }

  get guildClasses() {
    const guildsWrapper = _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getByProps("wrapper", "unreadMentionsBar");
    const guilds = _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getByProps("guildsError", "selected");
    const pill = _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getByProps("blobContainer");
    return Object.assign({}, guildsWrapper, guilds, pill);
  }

  get MessageContentComponent() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getModule(m => m.defaultProps && m.defaultProps.hasOwnProperty("disableButtons"));
  }

  get TimeFormatter() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getByProps("dateFormat");
  }

  get TooltipWrapper() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getByDisplayName("TooltipDeprecated");
  }

  get NativeModule() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getByProps("setBadge");
  }

  get Tooltips() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getModule(m => m.hide && m.show && !m.search && !m.submit && !m.search && !m.activateRagingDemon && !m.dismiss);
  }

  get KeyGenerator() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_0__["default"].getModule(m => m.toString && /"binary"/.test(m.toString()));
  }

  patchSocial() {
    if (this.socialPatch) return;
    const TabBar = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].findModule(m => m.displayName == "TabBar");
    const Anchor = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].findModule(m => m.displayName == "Anchor");
    if (!TabBar || !Anchor) return;
    this.socialPatch = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].monkeyPatch(TabBar.prototype, "render", {
      after: data => {
        const children = data.returnValue.props.children;
        if (!children || !children.length) return;
        if (children[children.length - 2].type.displayName !== "Separator") return;
        if (!children[children.length - 1].type.toString().includes("socialLinks")) return;
        const original = children[children.length - 1].type;

        const newOne = function () {
          const returnVal = original(...arguments);
          returnVal.props.children.push(_pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].React.createElement(Anchor, {
            className: "bd-social-link",
            href: "https://github.com/rauenzi/BetterDiscordApp",
            rel: "author",
            title: "BandagedBD",
            target: "_blank"
          }, _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].React.createElement(_ui_icons_bdlogo__WEBPACK_IMPORTED_MODULE_2__["default"], {
            size: "16px",
            className: "bd-social-logo"
          })));
          return returnVal;
        };

        children[children.length - 1].type = newOne;
      }
    });
  }

  patchGuildListItems() {
    if (this.guildListItemsPatch) return;
    const listItemClass = this.guildClasses.listItem.split(" ")[0];
    const blobClass = this.guildClasses.blobContainer.split(" ")[0];
    const reactInstance = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].getInternalInstance(document.querySelector(`.${listItemClass} .${blobClass}`).parentElement);
    const GuildComponent = reactInstance.return.type;
    if (!GuildComponent) return;
    this.guildListItemsPatch = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].monkeyPatch(GuildComponent.prototype, "render", {
      after: data => {
        const returnValue = data.returnValue;
        const guildData = data.thisObject.props;
        returnValue.props.className += " bd-guild";
        if (guildData.unread) returnValue.props.className += " bd-unread";
        if (guildData.selected) returnValue.props.className += " bd-selected";
        if (guildData.audio) returnValue.props.className += " bd-audio";
        if (guildData.video) returnValue.props.className += " bd-video";
        if (guildData.badge) returnValue.props.className += " bd-badge";
        if (guildData.animatable) returnValue.props.className += " bd-animatable";
        return returnValue;
      }
    });
  }

  patchGuildPills() {
    if (this.guildPillPatch) return;
    const guildPill = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].findModule(m => m.default && m.default.toString && m.default.toString().includes("translate3d"));
    if (!guildPill) return;
    this.guildPillPatch = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].monkeyPatch(guildPill, "default", {
      after: data => {
        const props = data.methodArguments[0];
        if (props.unread) data.returnValue.props.className += " bd-unread";
        if (props.selected) data.returnValue.props.className += " bd-selected";
        if (props.hovered) data.returnValue.props.className += " bd-hovered";
        return data.returnValue;
      }
    });
  }

  patchGuildSeparator() {
    if (this.guildSeparatorPatch) return;
    const Guilds = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].findModuleByDisplayName("Guilds");
    const guildComponents = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].findModuleByProps("renderListItem");
    if (!guildComponents || !Guilds) return;

    const GuildSeparator = function () {
      const returnValue = guildComponents.Separator(...arguments);
      returnValue.props.className += " bd-guild-separator";
      return returnValue;
    };

    this.guildSeparatorPatch = _pluginapi__WEBPACK_IMPORTED_MODULE_1__["default"].monkeyPatch(Guilds.prototype, "render", {
      after: data => {
        data.returnValue.props.children[1].props.children[3].type = GuildSeparator;
      }
    });
  }

}());

/***/ }),

/***/ "./src/modules/contentmanager.js":
/*!***************************************!*\
  !*** ./src/modules/contentmanager.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");
/* harmony import */ var _pluginmanager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pluginmanager */ "./src/modules/pluginmanager.js");
/* harmony import */ var _thememanager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./thememanager */ "./src/modules/thememanager.js");





const path = __webpack_require__(/*! path */ "path");

const fs = __webpack_require__(/*! fs */ "fs");

const Module = __webpack_require__(/*! module */ "module").Module;

Module.globalPaths.push(path.resolve(__webpack_require__(/*! electron */ "electron").remote.app.getAppPath(), "node_modules"));

class MetaError extends Error {
  constructor(message) {
    super(message);
    this.name = "MetaError";
  }

}

const originalJSRequire = Module._extensions[".js"];
const originalCSSRequire = Module._extensions[".css"] ? Module._extensions[".css"] : () => {
  return null;
};
/* harmony default export */ __webpack_exports__["default"] = (new class ContentManager {
  constructor() {
    this.timeCache = {};
    this.watchers = {};
    Module._extensions[".js"] = this.getContentRequire("plugin");
    Module._extensions[".css"] = this.getContentRequire("theme");
  }

  get pluginsFolder() {
    return this._pluginsFolder || (this._pluginsFolder = fs.realpathSync(path.resolve(data__WEBPACK_IMPORTED_MODULE_0__["Config"].dataPath + "plugins/")));
  }

  get themesFolder() {
    return this._themesFolder || (this._themesFolder = fs.realpathSync(path.resolve(data__WEBPACK_IMPORTED_MODULE_0__["Config"].dataPath + "themes/")));
  }

  watchContent(contentType) {
    if (this.watchers[contentType]) return;
    const isPlugin = contentType === "plugin";
    const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;
    const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
    this.watchers[contentType] = fs.watch(baseFolder, {
      persistent: false
    }, async (eventType, filename) => {
      if (!eventType || !filename || !filename.endsWith(fileEnding)) return;
      await new Promise(r => setTimeout(r, 50));

      try {
        fs.statSync(path.resolve(baseFolder, filename));
      } catch (err) {
        if (err.code !== "ENOENT") return;
        delete this.timeCache[filename];
        if (isPlugin) return _pluginmanager__WEBPACK_IMPORTED_MODULE_2__["default"].unloadPlugin(filename);
        return _thememanager__WEBPACK_IMPORTED_MODULE_3__["default"].unloadTheme(filename);
      }

      if (!fs.statSync(path.resolve(baseFolder, filename)).isFile()) return;
      const stats = fs.statSync(path.resolve(baseFolder, filename));
      if (!stats || !stats.mtime || !stats.mtime.getTime()) return;
      if (typeof stats.mtime.getTime() !== "number") return;
      if (this.timeCache[filename] == stats.mtime.getTime()) return;
      this.timeCache[filename] = stats.mtime.getTime();

      if (eventType == "rename") {
        if (isPlugin) _pluginmanager__WEBPACK_IMPORTED_MODULE_2__["default"].loadPlugin(filename);else _thememanager__WEBPACK_IMPORTED_MODULE_3__["default"].loadTheme(filename);
      }

      if (eventType == "change") {
        if (isPlugin) _pluginmanager__WEBPACK_IMPORTED_MODULE_2__["default"].reloadPlugin(filename);else _thememanager__WEBPACK_IMPORTED_MODULE_3__["default"].reloadTheme(filename);
      }
    });
  }

  unwatchContent(contentType) {
    if (!this.watchers[contentType]) return;
    this.watchers[contentType].close();
    delete this.watchers[contentType];
  }

  extractMeta(content) {
    const meta = content.split("\n")[0];
    const rawMeta = meta.substring(meta.lastIndexOf("//META") + 6, meta.lastIndexOf("*//"));
    if (meta.indexOf("META") < 0) throw new MetaError("META was not found.");
    if (!_utilities__WEBPACK_IMPORTED_MODULE_1__["default"].testJSON(rawMeta)) throw new MetaError("META could not be parsed.");
    const parsed = JSON.parse(rawMeta);
    if (!parsed.name) throw new MetaError("META missing name data.");
    return parsed;
  }

  getContentRequire(type) {
    const isPlugin = type === "plugin";
    const self = this;
    const originalRequire = isPlugin ? originalJSRequire : originalCSSRequire;
    return function (module, filename) {
      const baseFolder = isPlugin ? self.pluginsFolder : self.themesFolder;
      const possiblePath = path.resolve(baseFolder, path.basename(filename));
      if (!fs.existsSync(possiblePath) || filename !== fs.realpathSync(possiblePath)) return Reflect.apply(originalRequire, this, arguments);
      let content = fs.readFileSync(filename, "utf8");
      content = _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].stripBOM(content);
      const meta = self.extractMeta(content);
      meta.filename = path.basename(filename);

      if (!isPlugin) {
        meta.css = content.split("\n").slice(1).join("\n");
        content = `module.exports = ${JSON.stringify(meta)};`;
      }

      if (isPlugin) {
        content += `\nmodule.exports = ${JSON.stringify(meta)};\nmodule.exports.type = ${meta.name};`;
      }

      module._compile(content, filename);
    };
  }

  makePlaceholderPlugin(data) {
    return {
      plugin: {
        start: () => {},
        getName: () => {
          return data.name || data.filename;
        },
        getAuthor: () => {
          return "???";
        },
        getDescription: () => {
          return data.message ? data.message : "This plugin was unable to be loaded. Check the author's page for updates.";
        },
        getVersion: () => {
          return "???";
        }
      },
      name: data.name || data.filename,
      filename: data.filename,
      source: data.source ? data.source : "",
      website: data.website ? data.website : ""
    };
  }

  loadContent(filename, type) {
    if (typeof filename === "undefined" || typeof type === "undefined") return;
    const isPlugin = type === "plugin";
    const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;

    try {
      require(path.resolve(baseFolder, filename));
    } catch (error) {
      return {
        name: filename,
        file: filename,
        message: "Could not be compiled.",
        error: {
          message: error.message,
          stack: error.stack
        }
      };
    }

    const content = require(path.resolve(baseFolder, filename));

    if (isPlugin) {
      if (!content.type) return;

      try {
        content.plugin = new content.type();
        delete data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][content.plugin.getName()];
        data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][content.plugin.getName()] = content;
      } catch (error) {
        return {
          name: filename,
          file: filename,
          message: "Could not be constructed.",
          error: {
            message: error.message,
            stack: error.stack
          }
        };
      }
    } else {
      delete data__WEBPACK_IMPORTED_MODULE_0__["Themes"][content.name];
      data__WEBPACK_IMPORTED_MODULE_0__["Themes"][content.name] = content;
    }
  }

  unloadContent(filename, type) {
    if (typeof filename === "undefined" || typeof type === "undefined") return;
    const isPlugin = type === "plugin";
    const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;

    try {
      delete require.cache[require.resolve(path.resolve(baseFolder, filename))];
    } catch (err) {
      return {
        name: filename,
        file: filename,
        message: "Could not be unloaded.",
        error: {
          message: err.message,
          stack: err.stack
        }
      };
    }
  }

  isLoaded(filename, type) {
    const isPlugin = type === "plugin";
    const baseFolder = isPlugin ? this.pluginsFolder : this.themesFolder;

    try {
      require.cache[require.resolve(path.resolve(baseFolder, filename))];
    } catch (err) {
      return false;
    }

    return true;
  }

  reloadContent(filename, type) {
    const cantUnload = this.unloadContent(filename, type);
    if (cantUnload) return cantUnload;
    return this.loadContent(filename, type);
  }

  loadNewContent(type) {
    const isPlugin = type === "plugin";
    const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
    const basedir = isPlugin ? this.pluginsFolder : this.themesFolder;
    const files = fs.readdirSync(basedir);
    const contentList = Object.values(isPlugin ? data__WEBPACK_IMPORTED_MODULE_0__["Plugins"] : data__WEBPACK_IMPORTED_MODULE_0__["Themes"]);
    const removed = contentList.filter(t => !files.includes(t.filename)).map(c => isPlugin ? c.plugin.getName() : c.name);
    const added = files.filter(f => !contentList.find(t => t.filename == f) && f.endsWith(fileEnding) && fs.statSync(path.resolve(basedir, f)).isFile());
    return {
      added,
      removed
    };
  }

  loadAllContent(type) {
    const isPlugin = type === "plugin";
    const fileEnding = isPlugin ? ".plugin.js" : ".theme.css";
    const basedir = isPlugin ? this.pluginsFolder : this.themesFolder;
    const errors = [];
    const files = fs.readdirSync(basedir);

    for (const filename of files) {
      if (!fs.statSync(path.resolve(basedir, filename)).isFile() || !filename.endsWith(fileEnding)) continue;
      const error = this.loadContent(filename, type);
      if (error) errors.push(error);
    }

    return errors;
  }

  loadPlugins() {
    return this.loadAllContent("plugin");
  }

  loadThemes() {
    return this.loadAllContent("theme");
  }

}());

/***/ }),

/***/ "./src/modules/core.js":
/*!*****************************!*\
  !*** ./src/modules/core.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _bdv2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bdv2 */ "./src/modules/bdv2.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var _pluginmanager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pluginmanager */ "./src/modules/pluginmanager.js");
/* harmony import */ var _thememanager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./thememanager */ "./src/modules/thememanager.js");
/* harmony import */ var _settingsmanager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./settingsmanager */ "./src/modules/settingsmanager.js");
/* harmony import */ var builtins__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! builtins */ "./src/builtins/builtins.js");
/* harmony import */ var ui__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ui */ "./src/ui/ui.js");


 // import EmoteModule from "./emotes";
// import QuickEmoteMenu from "../builtins/emotemenu";







function Core() {}

Core.prototype.setConfig = function (config) {
  Object.assign(data__WEBPACK_IMPORTED_MODULE_2__["Config"], config);
};

Core.prototype.init = async function () {
  if (data__WEBPACK_IMPORTED_MODULE_2__["Config"].version < data__WEBPACK_IMPORTED_MODULE_2__["Config"].minSupportedVersion) {
    ui__WEBPACK_IMPORTED_MODULE_7__["Modals"].alert("Not Supported", "BetterDiscord v" + data__WEBPACK_IMPORTED_MODULE_2__["Config"].version + " (your version)" + " is not supported by the latest js (" + data__WEBPACK_IMPORTED_MODULE_2__["Config"].bbdVersion + ").<br><br> Please download the latest version from <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>GitHub</a>");
    return;
  }

  const latestLocalVersion = data__WEBPACK_IMPORTED_MODULE_2__["Config"].updater ? data__WEBPACK_IMPORTED_MODULE_2__["Config"].updater.LatestVersion : data__WEBPACK_IMPORTED_MODULE_2__["Config"].latestVersion;

  if (latestLocalVersion > data__WEBPACK_IMPORTED_MODULE_2__["Config"].version) {
    ui__WEBPACK_IMPORTED_MODULE_7__["Modals"].alert("Update Available", `
            An update for BandagedBD is available (${latestLocalVersion})! Please Reinstall!<br /><br />
            <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>Download Installer</a>
        `);
  }

  _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log("Startup", "Initializing Settings");
  _settingsmanager__WEBPACK_IMPORTED_MODULE_5__["default"].initialize();
  _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log("Startup", "Initializing EmoteModule"); // window.emotePromise = EmoteModule.init().then(() => {
  //     EmoteModule.initialized = true;
  //     Utilities.log("Startup", "Initializing QuickEmoteMenu");
  //     Events.dispatch("emotes-loaded");
  //     // QuickEmoteMenu.init();
  // });

  this.injectExternals();
  await this.checkForGuilds();
  _bdv2__WEBPACK_IMPORTED_MODULE_0__["default"].initialize();
  _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log("Startup", "Updating Settings");
  _settingsmanager__WEBPACK_IMPORTED_MODULE_5__["default"].initializeSettings();

  for (const module in builtins__WEBPACK_IMPORTED_MODULE_6__) builtins__WEBPACK_IMPORTED_MODULE_6__[module].initialize();

  _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log("Startup", "Loading Plugins");
  const pluginErrors = _pluginmanager__WEBPACK_IMPORTED_MODULE_3__["default"].loadPlugins();
  _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log("Startup", "Loading Themes");
  const themeErrors = _thememanager__WEBPACK_IMPORTED_MODULE_4__["default"].loadThemes();
  $("#customcss").detach().appendTo(document.head); // PublicServers.initialize();
  // EmoteModule.autoCapitalize();

  _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log("Startup", "Removing Loading Icon");
  document.getElementsByClassName("bd-loaderv2")[0].remove();
  _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log("Startup", "Initializing Main Observer");
  this.initObserver(); // Show loading errors

  _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log("Startup", "Collecting Startup Errors");
  ui__WEBPACK_IMPORTED_MODULE_7__["Modals"].showContentErrors({
    plugins: pluginErrors,
    themes: themeErrors
  });
};

Core.prototype.checkForGuilds = function () {
  return new Promise(resolve => {
    const checkForGuilds = function () {
      const wrapper = _bdv2__WEBPACK_IMPORTED_MODULE_0__["default"].guildClasses.wrapper.split(" ")[0];
      const guild = _bdv2__WEBPACK_IMPORTED_MODULE_0__["default"].guildClasses.listItem.split(" ")[0];
      const blob = _bdv2__WEBPACK_IMPORTED_MODULE_0__["default"].guildClasses.blobContainer.split(" ")[0];
      if (document.querySelectorAll(`.${wrapper} .${guild} .${blob}`).length > 0) return resolve(data__WEBPACK_IMPORTED_MODULE_2__["Config"].deferLoaded = true);
      setTimeout(checkForGuilds, 100);
    };

    $(document).ready(function () {
      setTimeout(checkForGuilds, 100);
    });
  });
};

Core.prototype.injectExternals = async function () {
  await _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].injectJs("https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js");
  if (window.require.original) window.require = window.require.original;
};

Core.prototype.initObserver = function () {
  const mainObserver = new MutationObserver(mutations => {
    for (let i = 0, mlen = mutations.length; i < mlen; i++) {
      const mutation = mutations[i];
      if (typeof _pluginmanager__WEBPACK_IMPORTED_MODULE_3__["default"] !== "undefined") _pluginmanager__WEBPACK_IMPORTED_MODULE_3__["default"].rawObserver(mutation); // if there was nothing added, skip

      if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) continue;
      const node = mutation.addedNodes[0];

      if (node.classList.contains("layer-3QrUeG")) {
        if (node.getElementsByClassName("guild-settings-base-section").length) node.setAttribute("layer-id", "server-settings"); // if (node.getElementsByClassName("socialLinks-3jqNFy").length) {
        //     node.setAttribute("layer-id", "user-settings");
        //     node.setAttribute("id", "user-settings");
        //     if (!document.getElementById("bd-settings-sidebar")) SettingsPanel.renderSidebar();
        // }
      }
    }
  });
  mainObserver.observe(document, {
    childList: true,
    subtree: true
  });
};

/* harmony default export */ __webpack_exports__["default"] = (new Core());

/***/ }),

/***/ "./src/modules/datastore.js":
/*!**********************************!*\
  !*** ./src/modules/datastore.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");


const fs = __webpack_require__(/*! fs */ "fs");

const path = __webpack_require__(/*! path */ "path");

const releaseChannel = DiscordNative.globals.releaseChannel;
/* harmony default export */ __webpack_exports__["default"] = (new class DataStore {
  constructor() {
    this.data = {
      settings: {
        stable: {},
        canary: {},
        ptb: {}
      }
    };
    this.pluginData = {};
  }

  initialize() {
    if (!fs.existsSync(this.BDFile)) fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));

    const data = require(this.BDFile);

    if (data.hasOwnProperty("settings")) this.data = data;
    if (!fs.existsSync(this.settingsFile)) return;

    let settings = require(this.settingsFile);

    fs.unlinkSync(this.settingsFile);
    if (settings.hasOwnProperty("settings")) settings = Object.assign({
      stable: {},
      canary: {},
      ptb: {}
    }, {
      [releaseChannel]: settings
    });else settings = Object.assign({
      stable: {},
      canary: {},
      ptb: {}
    }, settings);
    this.setBDData("settings", settings);
  }

  get BDFile() {
    return this._BDFile || (this._BDFile = path.resolve(data__WEBPACK_IMPORTED_MODULE_0__["Config"].dataPath, "bdstorage.json"));
  }

  get settingsFile() {
    return this._settingsFile || (this._settingsFile = path.resolve(data__WEBPACK_IMPORTED_MODULE_0__["Config"].dataPath, "bdsettings.json"));
  }

  getPluginFile(pluginName) {
    return path.resolve(data__WEBPACK_IMPORTED_MODULE_0__["Config"].dataPath, "plugins", pluginName + ".config.json");
  }

  getSettingGroup(key) {
    return this.data.settings[releaseChannel][key] || null;
  }

  setSettingGroup(key, data) {
    this.data.settings[releaseChannel][key] = data;
    fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
  }

  getBDData(key) {
    return this.data[key] || "";
  }

  setBDData(key, value) {
    this.data[key] = value;
    fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
  }

  getPluginData(pluginName, key) {
    if (this.pluginData[pluginName] !== undefined) return this.pluginData[pluginName][key] || undefined;
    if (!fs.existsSync(this.getPluginFile(pluginName))) return undefined;
    this.pluginData[pluginName] = JSON.parse(fs.readFileSync(this.getPluginFile(pluginName)));
    return this.pluginData[pluginName][key] || undefined;
  }

  setPluginData(pluginName, key, value) {
    if (value === undefined) return;
    if (this.pluginData[pluginName] === undefined) this.pluginData[pluginName] = {};
    this.pluginData[pluginName][key] = value;
    fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
  }

  deletePluginData(pluginName, key) {
    if (this.pluginData[pluginName] === undefined) this.pluginData[pluginName] = {};
    delete this.pluginData[pluginName][key];
    fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
  }

}());

/***/ }),

/***/ "./src/modules/emitter.js":
/*!********************************!*\
  !*** ./src/modules/emitter.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const EventEmitter = __webpack_require__(/*! events */ "events");

/* harmony default export */ __webpack_exports__["default"] = (new class BDEvents extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
  }

  dispatch(eventName, ...args) {
    this.emit(eventName, ...args);
  }

}());

/***/ }),

/***/ "./src/modules/modules.js":
/*!********************************!*\
  !*** ./src/modules/modules.js ***!
  \********************************/
/*! exports provided: React, ReactDOM, BDV2, BdApi, Core, ContentManager, DataStore, Events, PluginManager, ThemeManager, Utilities, WebpackModules, DiscordModules */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "React", function() { return React; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReactDOM", function() { return ReactDOM; });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Utilities", function() { return _utilities__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _webpackmodules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webpackmodules */ "./src/modules/webpackmodules.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WebpackModules", function() { return _webpackmodules__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DiscordModules", function() { return _webpackmodules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"]; });

/* harmony import */ var _bdv2__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bdv2 */ "./src/modules/bdv2.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BDV2", function() { return _bdv2__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _pluginapi__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pluginapi */ "./src/modules/pluginapi.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BdApi", function() { return _pluginapi__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./core */ "./src/modules/core.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Core", function() { return _core__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _contentmanager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./contentmanager */ "./src/modules/contentmanager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ContentManager", function() { return _contentmanager__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _datastore__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./datastore */ "./src/modules/datastore.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DataStore", function() { return _datastore__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _emitter__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./emitter */ "./src/modules/emitter.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Events", function() { return _emitter__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _pluginmanager__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pluginmanager */ "./src/modules/pluginmanager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PluginManager", function() { return _pluginmanager__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _thememanager__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./thememanager */ "./src/modules/thememanager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ThemeManager", function() { return _thememanager__WEBPACK_IMPORTED_MODULE_9__["default"]; });







 // import DevMode from "./devmode";

 // import EmoteModule from "./emotes";

 // import PublicServers from "./publicservers";


const React = _webpackmodules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].React;
const ReactDOM = _webpackmodules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].ReactDOM;
 // export {{
//         get React() {return DiscordModules.React;}
// }}

/***/ }),

/***/ "./src/modules/oldstorage.js":
/*!***********************************!*\
  !*** ./src/modules/oldstorage.js ***!
  \***********************************/
/*! exports provided: bdStorage, bdPluginStorage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bdStorage", function() { return bdStorage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bdPluginStorage", function() { return bdPluginStorage; });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");
/* harmony import */ var _datastore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./datastore */ "./src/modules/datastore.js");


class bdStorage {
  static get(key) {
    _utilities__WEBPACK_IMPORTED_MODULE_0__["default"].warn("Deprecation Notice", "Please use BdApi.getBDData(). bdStorage may be removed in future versions.");
    return _datastore__WEBPACK_IMPORTED_MODULE_1__["default"].getBDData(key);
  }

  static set(key, data) {
    _utilities__WEBPACK_IMPORTED_MODULE_0__["default"].warn("Deprecation Notice", "Please use BdApi.setBDData(). bdStorage may be removed in future versions.");
    _datastore__WEBPACK_IMPORTED_MODULE_1__["default"].setBDData(key, data);
  }

}
class bdPluginStorage {
  static get(pluginName, key) {
    _utilities__WEBPACK_IMPORTED_MODULE_0__["default"].warn("Deprecation Notice", `${pluginName}, please use BdApi.loadData() or BdApi.getData(). bdPluginStorage may be removed in future versions.`);
    return _datastore__WEBPACK_IMPORTED_MODULE_1__["default"].getPluginData(pluginName, key) || null;
  }

  static set(pluginName, key, data) {
    _utilities__WEBPACK_IMPORTED_MODULE_0__["default"].warn("Deprecation Notice", `${pluginName}, please use BdApi.saveData() or BdApi.setData(). bdPluginStorage may be removed in future versions.`);
    if (typeof data === "undefined") return _utilities__WEBPACK_IMPORTED_MODULE_0__["default"].warn("Deprecation Notice", "Trying to set undefined value in plugin " + pluginName);
    _datastore__WEBPACK_IMPORTED_MODULE_1__["default"].setPluginData(pluginName, key, data);
  }

  static delete(pluginName, key) {
    _utilities__WEBPACK_IMPORTED_MODULE_0__["default"].warn("Deprecation Notice", `${pluginName}, please use BdApi.deleteData(). bdPluginStorage may be removed in future versions.`);
    _datastore__WEBPACK_IMPORTED_MODULE_1__["default"].deletePluginData(pluginName, key);
  }

}

/***/ }),

/***/ "./src/modules/pluginapi.js":
/*!**********************************!*\
  !*** ./src/modules/pluginapi.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");
/* harmony import */ var _webpackmodules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./webpackmodules */ "./src/modules/webpackmodules.js");
/* harmony import */ var _datastore__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./datastore */ "./src/modules/datastore.js");
/* harmony import */ var ui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ui */ "./src/ui/ui.js");





const BdApi = {
  get React() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_2__["DiscordModules"].React;
  },

  get ReactDOM() {
    return _webpackmodules__WEBPACK_IMPORTED_MODULE_2__["DiscordModules"].ReactDOM;
  },

  get WindowConfigFile() {
    if (this._windowConfigFile) return this._windowConfigFile;

    const electron = __webpack_require__(/*! electron */ "electron").remote.app;

    const path = __webpack_require__(/*! path */ "path");

    const base = electron.getAppPath();
    const roamingBase = electron.getPath("userData");
    const roamingLocation = path.resolve(roamingBase, electron.getVersion(), "modules", "discord_desktop_core", "injector", "config.json");
    const location = path.resolve(base, "..", "app", "config.json");

    const fs = __webpack_require__(/*! fs */ "fs");

    const realLocation = fs.existsSync(location) ? location : fs.existsSync(roamingLocation) ? roamingLocation : null;
    if (!realLocation) return this._windowConfigFile = null;
    return this._windowConfigFile = realLocation;
  }

};

BdApi.getAllWindowPreferences = function () {
  if (!this.WindowConfigFile) return {};
  return require(this.WindowConfigFile);
};

BdApi.getWindowPreference = function (key) {
  if (!this.WindowConfigFile) return undefined;
  return this.getAllWindowPreferences()[key];
};

BdApi.setWindowPreference = function (key, value) {
  if (!this.WindowConfigFile) return;

  const fs = __webpack_require__(/*! fs */ "fs");

  const prefs = this.getAllWindowPreferences();
  prefs[key] = value;
  delete __webpack_require__.c[this.WindowConfigFile];
  fs.writeFileSync(this.WindowConfigFile, JSON.stringify(prefs, null, 4));
}; //Inject CSS to document head
//id = id of element
//css = custom css


BdApi.injectCSS = function (id, css) {
  $("head").append($("<style>", {
    id: _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].escapeID(id),
    text: css
  }));
}; //Clear css/remove any element
//id = id of element


BdApi.clearCSS = function (id) {
  $("#" + _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].escapeID(id)).remove();
}; //Inject CSS to document head
//id = id of element
//css = custom css


BdApi.linkJS = function (id, url) {
  $("head").append($("<script>", {
    id: _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].escapeID(id),
    src: url,
    type: "text/javascript"
  }));
}; //Clear css/remove any element
//id = id of element


BdApi.unlinkJS = function (id) {
  $("#" + _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].escapeID(id)).remove();
}; //Get another plugin
//name = name of plugin


BdApi.getPlugin = function (name) {
  if (data__WEBPACK_IMPORTED_MODULE_0__["Plugins"].hasOwnProperty(name)) {
    return data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][name].plugin;
  }

  return null;
};
/**
 * Shows a generic but very customizable modal.
 * @param {string} title - title of the modal
 * @param {string} content - a string of text to display in the modal
 */


BdApi.alert = function (title, content) {
  ui__WEBPACK_IMPORTED_MODULE_4__["Modals"].alert(title, content);
};
/**
 * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
 * @param {string} title - title of the modal
 * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
 * @param {object} [options] - options to modify the modal
 * @param {boolean} [options.danger=false] - whether the main button should be red or not
 * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
 * @param {string} [options.cancelText=Cancel] - text for the cancel button
 * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
 * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
 */


BdApi.showConfirmationModal = function (title, content, options = {}) {
  return ui__WEBPACK_IMPORTED_MODULE_4__["Modals"].showConfirmationModal(title, content, options);
};
/**
 * This shows a toast similar to android towards the bottom of the screen.
 *
 * @param {string} content The string to show in the toast.
 * @param {object} options Options object. Optional parameter.
 * @param {string} [options.type=""] Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
 * @param {boolean} [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
 * @param {number} [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
 * @param {boolean} [options.forceShow=false] Whether to force showing the toast and ignore the bd setting
 */


BdApi.showToast = function (content, options = {}) {
  ui__WEBPACK_IMPORTED_MODULE_4__["Toasts"].show(content, options);
}; // Finds module


BdApi.findModule = function (filter) {
  return _webpackmodules__WEBPACK_IMPORTED_MODULE_2__["default"].getModule(filter);
}; // Finds module


BdApi.findAllModules = function (filter) {
  return _webpackmodules__WEBPACK_IMPORTED_MODULE_2__["default"].getModule(filter, false);
}; // Finds module


BdApi.findModuleByProps = function (...props) {
  return _webpackmodules__WEBPACK_IMPORTED_MODULE_2__["default"].getByProps(...props);
};

BdApi.findModuleByPrototypes = function (...protos) {
  return _webpackmodules__WEBPACK_IMPORTED_MODULE_2__["default"].getByPrototypes(...protos);
};

BdApi.findModuleByDisplayName = function (name) {
  return _webpackmodules__WEBPACK_IMPORTED_MODULE_2__["default"].getByDisplayName(name);
}; // Gets react instance


BdApi.getInternalInstance = function (node) {
  if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
  if (node instanceof jQuery) node = node[0];
  return _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].getInternalInstance(node);
}; // Gets data


BdApi.loadData = function (pluginName, key) {
  return _datastore__WEBPACK_IMPORTED_MODULE_3__["default"].getPluginData(pluginName, key);
};

BdApi.getData = BdApi.loadData; // Sets data

BdApi.saveData = function (pluginName, key, data) {
  return _datastore__WEBPACK_IMPORTED_MODULE_3__["default"].setPluginData(pluginName, key, data);
};

BdApi.setData = BdApi.saveData; // Deletes data

BdApi.deleteData = function (pluginName, key) {
  return _datastore__WEBPACK_IMPORTED_MODULE_3__["default"].deletePluginData(pluginName, key);
}; // Patches other functions


BdApi.monkeyPatch = function (what, methodName, options) {
  return _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].monkeyPatch(what, methodName, options);
}; // Event when element is removed


BdApi.onRemoved = function (node, callback) {
  return _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].onRemoved(node, callback);
}; // Wraps function in try..catch


BdApi.suppressErrors = function (method, message) {
  return _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].suppressErrors(method, message);
}; // Tests for valid JSON


BdApi.testJSON = function (data) {
  return _utilities__WEBPACK_IMPORTED_MODULE_1__["default"].testJSON(data);
};

BdApi.isPluginEnabled = function (name) {
  return !!data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][name];
};

BdApi.isThemeEnabled = function (name) {
  return !!data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][name];
};

BdApi.isSettingEnabled = function (id) {
  return !!data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"][id];
}; // Gets data


BdApi.getBDData = function (key) {
  return _datastore__WEBPACK_IMPORTED_MODULE_3__["default"].getBDData(key);
}; // Sets data


BdApi.setBDData = function (key, data) {
  return _datastore__WEBPACK_IMPORTED_MODULE_3__["default"].setBDData(key, data);
};

/* harmony default export */ __webpack_exports__["default"] = (BdApi);

/***/ }),

/***/ "./src/modules/pluginmanager.js":
/*!**************************************!*\
  !*** ./src/modules/pluginmanager.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var _contentmanager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contentmanager */ "./src/modules/contentmanager.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");
/* harmony import */ var _emitter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./emitter */ "./src/modules/emitter.js");
/* harmony import */ var _datastore__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./datastore */ "./src/modules/datastore.js");
/* harmony import */ var ui__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ui */ "./src/ui/ui.js");







function PluginModule() {}

PluginModule.prototype.loadPlugins = function () {
  this.loadPluginData();
  const errors = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].loadPlugins();
  const plugins = Object.keys(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"]);

  for (let i = 0; i < plugins.length; i++) {
    let plugin, name;

    try {
      plugin = data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugins[i]].plugin;
      name = plugin.getName();
      if (plugin.load && typeof plugin.load == "function") plugin.load();
    } catch (err) {
      data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][name] = false;
      _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("Plugins", name + " could not be loaded.", err);
      errors.push({
        name: name,
        file: data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugins[i]].filename,
        message: "load() could not be fired.",
        error: {
          message: err.message,
          stack: err.stack
        }
      });
      continue;
    }

    if (!data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][name]) data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][name] = false;

    if (data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][name]) {
      try {
        plugin.start();
        ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${plugin.getName()} v${plugin.getVersion()} has started.`);
      } catch (err) {
        data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][name] = false;
        _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("Plugins", name + " could not be started.", err);
        errors.push({
          name: name,
          file: data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugins[i]].filename,
          message: "start() could not be fired.",
          error: {
            message: err.message,
            stack: err.stack
          }
        });
      }
    }
  }

  this.savePluginData();

  __webpack_require__(/*! electron */ "electron").remote.getCurrentWebContents().on("did-navigate-in-page", this.channelSwitch.bind(this)); // if (SettingsCookie["fork-ps-5"]) ContentManager.watchContent("plugin");


  return errors;
};

PluginModule.prototype.startPlugin = function (plugin, reload = false) {
  try {
    data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.start();
    if (!reload) ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getName()} v${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getVersion()} has started.`);
  } catch (err) {
    if (!reload) ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getName()} v${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getVersion()} could not be started.`, {
      type: "error"
    });
    data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin] = false;
    this.savePluginData();
    _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("Plugins", plugin + " could not be started.", err);
  }
};

PluginModule.prototype.stopPlugin = function (plugin, reload = false) {
  try {
    data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.stop();
    if (!reload) ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getName()} v${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getVersion()} has stopped.`);
  } catch (err) {
    if (!reload) ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getName()} v${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getVersion()} could not be stopped.`, {
      type: "error"
    });
    _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("Plugins", data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getName() + " could not be stopped.", err);
  }
};

PluginModule.prototype.enablePlugin = function (plugin, reload = false) {
  if (data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin]) return;
  data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin] = true;
  this.savePluginData();
  this.startPlugin(plugin, reload);
};

PluginModule.prototype.disablePlugin = function (plugin, reload = false) {
  if (!data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin]) return;
  data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin] = false;
  this.savePluginData();
  this.stopPlugin(plugin, reload);
};

PluginModule.prototype.togglePlugin = function (plugin) {
  if (data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin]) this.disablePlugin(plugin);else this.enablePlugin(plugin);
};

PluginModule.prototype.loadPlugin = function (filename) {
  const error = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].loadContent(filename, "plugin");

  if (error) {
    ui__WEBPACK_IMPORTED_MODULE_5__["Modals"].showContentErrors({
      plugins: [error]
    });
    ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${filename} could not be loaded.`, {
      type: "error"
    });
    return _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("ContentManager", `${filename} could not be loaded.`, error);
  }

  const plugin = Object.values(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"]).find(p => p.filename == filename).plugin;

  try {
    if (plugin.load && typeof plugin.load == "function") plugin.load();
  } catch (err) {
    ui__WEBPACK_IMPORTED_MODULE_5__["Modals"].showContentErrors({
      plugins: [err]
    });
  }

  _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].log("ContentManager", `${plugin.getName()} v${plugin.getVersion()} was loaded.`);
  ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${plugin.getName()} v${plugin.getVersion()} was loaded.`, {
    type: "success"
  });
  _emitter__WEBPACK_IMPORTED_MODULE_3__["default"].dispatch("plugin-loaded", plugin.getName());
};

PluginModule.prototype.unloadPlugin = function (filenameOrName) {
  const bdplugin = Object.values(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"]).find(p => p.filename == filenameOrName) || data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][filenameOrName];
  if (!bdplugin) return;
  const plugin = bdplugin.plugin.getName();
  if (data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin]) this.disablePlugin(plugin, true);
  const error = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].unloadContent(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].filename, "plugin");
  delete data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin];

  if (error) {
    ui__WEBPACK_IMPORTED_MODULE_5__["Modals"].showContentErrors({
      plugins: [error]
    });
    ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${plugin} could not be unloaded. It may have not been loaded yet.`, {
      type: "error"
    });
    return _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("ContentManager", `${plugin} could not be unloaded. It may have not been loaded yet.`, error);
  }

  _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].log("ContentManager", `${plugin} was unloaded.`);
  ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${plugin} was unloaded.`, {
    type: "success"
  });
  _emitter__WEBPACK_IMPORTED_MODULE_3__["default"].dispatch("plugin-unloaded", plugin);
};

PluginModule.prototype.reloadPlugin = function (filenameOrName) {
  const bdplugin = Object.values(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"]).find(p => p.filename == filenameOrName) || data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][filenameOrName];
  if (!bdplugin) return this.loadPlugin(filenameOrName);
  const plugin = bdplugin.plugin.getName();
  const enabled = data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin];
  if (enabled) this.stopPlugin(plugin, true);
  const error = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].reloadContent(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].filename, "plugin");

  if (error) {
    ui__WEBPACK_IMPORTED_MODULE_5__["Modals"].showContentErrors({
      plugins: [error]
    });
    ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${plugin} could not be reloaded.`, {
      type: "error"
    });
    return _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("ContentManager", `${plugin} could not be reloaded.`, error);
  }

  if (data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.load && typeof data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.load == "function") data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.load();
  if (enabled) this.startPlugin(plugin, true);
  _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].log("ContentManager", `${plugin} v${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getVersion()} was reloaded.`);
  ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${plugin} v${data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugin].plugin.getVersion()} was reloaded.`, {
    type: "success"
  });
  _emitter__WEBPACK_IMPORTED_MODULE_3__["default"].dispatch("plugin-reloaded", plugin);
};

PluginModule.prototype.updatePluginList = function () {
  const results = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].loadNewContent("plugin");

  for (const filename of results.added) this.loadPlugin(filename);

  for (const name of results.removed) this.unloadPlugin(name);
};

PluginModule.prototype.loadPluginData = function () {
  const saved = _datastore__WEBPACK_IMPORTED_MODULE_4__["default"].getSettingGroup("plugins");
  if (!saved) return;
  Object.assign(data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"], saved);
};

PluginModule.prototype.savePluginData = function () {
  _datastore__WEBPACK_IMPORTED_MODULE_4__["default"].setSettingGroup("plugins", data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"]);
};

PluginModule.prototype.newMessage = function () {
  const plugins = Object.keys(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"]);

  for (let i = 0; i < plugins.length; i++) {
    const plugin = data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugins[i]].plugin;
    if (!data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin.getName()]) continue;

    if (typeof plugin.onMessage === "function") {
      try {
        plugin.onMessage();
      } catch (err) {
        _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("Plugins", "Unable to fire onMessage for " + plugin.getName() + ".", err);
      }
    }
  }
};

PluginModule.prototype.channelSwitch = function () {
  const plugins = Object.keys(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"]);

  for (let i = 0; i < plugins.length; i++) {
    const plugin = data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugins[i]].plugin;
    if (!data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin.getName()]) continue;

    if (typeof plugin.onSwitch === "function") {
      try {
        plugin.onSwitch();
      } catch (err) {
        _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("Plugins", "Unable to fire onSwitch for " + plugin.getName() + ".", err);
      }
    }
  }
};

PluginModule.prototype.rawObserver = function (e) {
  const plugins = Object.keys(data__WEBPACK_IMPORTED_MODULE_0__["Plugins"]);

  for (let i = 0; i < plugins.length; i++) {
    const plugin = data__WEBPACK_IMPORTED_MODULE_0__["Plugins"][plugins[i]].plugin;
    if (!data__WEBPACK_IMPORTED_MODULE_0__["PluginCookie"][plugin.getName()]) continue;

    if (typeof plugin.observer === "function") {
      try {
        plugin.observer(e);
      } catch (err) {
        _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("Plugins", "Unable to fire observer for " + plugin.getName() + ".", err);
      }
    }
  }
};

/* harmony default export */ __webpack_exports__["default"] = (new PluginModule());

/***/ }),

/***/ "./src/modules/settingsmanager.js":
/*!****************************************!*\
  !*** ./src/modules/settingsmanager.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var _datastore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./datastore */ "./src/modules/datastore.js");
/* harmony import */ var _contentmanager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./contentmanager */ "./src/modules/contentmanager.js");
/* harmony import */ var _pluginapi__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pluginapi */ "./src/modules/pluginapi.js");
/* harmony import */ var _emitter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./emitter */ "./src/modules/emitter.js");
/* harmony import */ var _webpackmodules__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./webpackmodules */ "./src/modules/webpackmodules.js");
/* harmony import */ var ui__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ui */ "./src/ui/ui.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");



 // import EmoteModule from "./emotes";





 //WebpackModules.getModule(m => m.getSection && m.getProps && !m.getGuildId && !m.getChannel)
//WebpackModules.getByProps("getGuildId", "getSection")

/* harmony default export */ __webpack_exports__["default"] = (new class SettingsManager {
  constructor() {
    this.renderer = new ui__WEBPACK_IMPORTED_MODULE_6__["SettingsPanel"]({
      onChange: this.updateSettings.bind(this)
    });
  }

  initialize() {
    _datastore__WEBPACK_IMPORTED_MODULE_1__["default"].initialize();
    if (!_datastore__WEBPACK_IMPORTED_MODULE_1__["default"].getSettingGroup("settings")) return this.saveSettings();
    const savedSettings = this.loadSettings();
    $("<style id=\"customcss\">").text(atob(_datastore__WEBPACK_IMPORTED_MODULE_1__["default"].getBDData("bdcustomcss"))).appendTo(document.head);

    for (const setting in savedSettings) {
      if (savedSettings[setting] !== undefined) data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"][setting] = savedSettings[setting];
    }

    this.saveSettings();
    this.patchSections();
  }

  async patchSections() {
    const UserSettings = await this.getUserSettings(); // data.returnValue.type;

    _utilities__WEBPACK_IMPORTED_MODULE_7__["default"].monkeyPatch(UserSettings.prototype, "generateSections", {
      after: data => {
        console.log(data);
        /* eslint-disable-line no-console */

        data.returnValue.splice(23, 0, {
          section: "DIVIDER"
        });
        data.returnValue.splice(24, 0, {
          section: "HEADER",
          label: "BandagedBD"
        });
        data.returnValue.splice(25, 0, {
          section: "BBD Settings",
          label: "Settings",
          element: () => this.renderer.core2
        });
        data.returnValue.splice(26, 0, {
          section: "BBD Test",
          label: "Test Tab",
          onClick: function () {
            ui__WEBPACK_IMPORTED_MODULE_6__["Toasts"].success("This can just be a click listener!", {
              forceShow: true
            });
          }
        });
        data.returnValue.splice(27, 0, {
          section: "CUSTOM",
          element: () => this.renderer.attribution
        });
      }
    });
    const viewClass = _webpackmodules__WEBPACK_IMPORTED_MODULE_5__["default"].getByProps("standardSidebarView").standardSidebarView.split(" ")[0];
    const node = document.querySelector(`.${viewClass}`);
    _utilities__WEBPACK_IMPORTED_MODULE_7__["default"].getInternalInstance(node).return.return.return.return.return.return.stateNode.forceUpdate();
  }

  getUserSettings() {
    return new Promise(resolve => {
      const cancel = _utilities__WEBPACK_IMPORTED_MODULE_7__["default"].monkeyPatch(_webpackmodules__WEBPACK_IMPORTED_MODULE_5__["default"].getByProps("getUserSettingsSections").default.prototype, "render", {
        after: data => {
          resolve(data.returnValue.type);
          data.thisObject.forceUpdate();
          cancel();
        }
      });
    });
  }

  saveSettings() {
    _datastore__WEBPACK_IMPORTED_MODULE_1__["default"].setSettingGroup("settings", data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"]);
  }

  loadSettings() {
    return _datastore__WEBPACK_IMPORTED_MODULE_1__["default"].getSettingGroup("settings");
  }

  updateSettings(id, enabled) {
    _emitter__WEBPACK_IMPORTED_MODULE_4__["default"].dispatch("setting-updated", "Modules", id, enabled);
    data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"][id] = enabled; // if (id == "bda-es-4") {
    //     if (enabled) EmoteModule.autoCapitalize();
    //     else EmoteModule.disableAutoCapitalize();
    // }

    if (id == "fork-ps-5") {
      if (enabled) {
        _contentmanager__WEBPACK_IMPORTED_MODULE_2__["default"].watchContent("plugin");
        _contentmanager__WEBPACK_IMPORTED_MODULE_2__["default"].watchContent("theme");
      } else {
        _contentmanager__WEBPACK_IMPORTED_MODULE_2__["default"].unwatchContent("plugin");
        _contentmanager__WEBPACK_IMPORTED_MODULE_2__["default"].unwatchContent("theme");
      }
    }

    if (id == "fork-wp-1") {
      _pluginapi__WEBPACK_IMPORTED_MODULE_3__["default"].setWindowPreference("transparent", enabled);
      if (enabled) _pluginapi__WEBPACK_IMPORTED_MODULE_3__["default"].setWindowPreference("backgroundColor", null);else _pluginapi__WEBPACK_IMPORTED_MODULE_3__["default"].setWindowPreference("backgroundColor", "#2f3136");
    }

    this.saveSettings();
  }

  initializeSettings() {
    // if (SettingsCookie["bda-es-4"]) EmoteModule.autoCapitalize();
    if (data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"]["fork-ps-5"]) {
      _contentmanager__WEBPACK_IMPORTED_MODULE_2__["default"].watchContent("plugin");
      _contentmanager__WEBPACK_IMPORTED_MODULE_2__["default"].watchContent("theme");
    }

    this.saveSettings();
  }

}());

/***/ }),

/***/ "./src/modules/thememanager.js":
/*!*************************************!*\
  !*** ./src/modules/thememanager.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var _contentmanager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contentmanager */ "./src/modules/contentmanager.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");
/* harmony import */ var _emitter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./emitter */ "./src/modules/emitter.js");
/* harmony import */ var _datastore__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./datastore */ "./src/modules/datastore.js");
/* harmony import */ var ui__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ui */ "./src/ui/ui.js");







function ThemeModule() {}

ThemeModule.prototype.loadThemes = function () {
  this.loadThemeData();
  const errors = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].loadThemes();
  const themes = Object.keys(data__WEBPACK_IMPORTED_MODULE_0__["Themes"]);

  for (let i = 0; i < themes.length; i++) {
    const name = data__WEBPACK_IMPORTED_MODULE_0__["Themes"][themes[i]].name;
    if (!data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][name]) data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][name] = false;
    if (data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][name]) $("head").append($("<style>", {
      id: _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].escapeID(name),
      text: unescape(data__WEBPACK_IMPORTED_MODULE_0__["Themes"][name].css)
    }));
  }

  for (const theme in data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"]) {
    if (!data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme]) delete data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][theme];
  }

  this.saveThemeData();
  return errors; // if (SettingsCookie["fork-ps-5"]) ContentManager.watchContent("theme");
};

ThemeModule.prototype.enableTheme = function (theme, reload = false) {
  data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][theme] = true;
  this.saveThemeData();
  $("head").append($("<style>", {
    id: _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].escapeID(theme),
    text: unescape(data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].css)
  }));
  if (!reload) ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].name} v${data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].version} has been applied.`);
};

ThemeModule.prototype.disableTheme = function (theme, reload = false) {
  data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][theme] = false;
  this.saveThemeData();
  $(`#${_utilities__WEBPACK_IMPORTED_MODULE_2__["default"].escapeID(data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].name)}`).remove();
  if (!reload) ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].name} v${data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].version} has been disabled.`);
};

ThemeModule.prototype.toggleTheme = function (theme) {
  if (data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][theme]) this.disableTheme(theme);else this.enableTheme(theme);
};

ThemeModule.prototype.loadTheme = function (filename) {
  const error = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].loadContent(filename, "theme");

  if (error) {
    ui__WEBPACK_IMPORTED_MODULE_5__["Modals"].showContentErrors({
      themes: [error]
    });
    ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${filename} could not be loaded. It may not have been loaded.`, {
      type: "error"
    });
    return _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("ContentManager", `${filename} could not be loaded.`, error);
  }

  const theme = Object.values(data__WEBPACK_IMPORTED_MODULE_0__["Themes"]).find(p => p.filename == filename);
  _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].log("ContentManager", `${theme.name} v${theme.version} was loaded.`);
  ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${theme.name} v${theme.version} was loaded.`, {
    type: "success"
  });
  _emitter__WEBPACK_IMPORTED_MODULE_3__["default"].dispatch("theme-loaded", theme.name);
};

ThemeModule.prototype.unloadTheme = function (filenameOrName) {
  const bdtheme = Object.values(data__WEBPACK_IMPORTED_MODULE_0__["Themes"]).find(p => p.filename == filenameOrName) || data__WEBPACK_IMPORTED_MODULE_0__["Themes"][filenameOrName];
  if (!bdtheme) return;
  const theme = bdtheme.name;
  if (data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][theme]) this.disableTheme(theme, true);
  const error = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].unloadContent(data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].filename, "theme");
  delete data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme];

  if (error) {
    ui__WEBPACK_IMPORTED_MODULE_5__["Modals"].showContentErrors({
      themes: [error]
    });
    ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${theme} could not be unloaded. It may have not been loaded yet.`, {
      type: "error"
    });
    return _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("ContentManager", `${theme} could not be unloaded. It may have not been loaded yet.`, error);
  }

  _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].log("ContentManager", `${theme} was unloaded.`);
  ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${theme} was unloaded.`, {
    type: "success"
  });
  _emitter__WEBPACK_IMPORTED_MODULE_3__["default"].dispatch("theme-unloaded", theme);
};

ThemeModule.prototype.reloadTheme = function (filenameOrName) {
  const bdtheme = Object.values(data__WEBPACK_IMPORTED_MODULE_0__["Themes"]).find(p => p.filename == filenameOrName) || data__WEBPACK_IMPORTED_MODULE_0__["Themes"][filenameOrName];
  if (!bdtheme) return this.loadTheme(filenameOrName);
  const theme = bdtheme.name;
  const error = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].reloadContent(data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].filename, "theme");
  if (data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"][theme]) this.disableTheme(theme, true), this.enableTheme(theme, true);

  if (error) {
    ui__WEBPACK_IMPORTED_MODULE_5__["Modals"].showContentErrors({
      themes: [error]
    });
    ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${theme} could not be reloaded.`, {
      type: "error"
    });
    return _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].err("ContentManager", `${theme} could not be reloaded.`, error);
  }

  _utilities__WEBPACK_IMPORTED_MODULE_2__["default"].log("ContentManager", `${theme} v${data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].version} was reloaded.`);
  ui__WEBPACK_IMPORTED_MODULE_5__["Toasts"].show(`${theme} v${data__WEBPACK_IMPORTED_MODULE_0__["Themes"][theme].version} was reloaded.`, {
    type: "success"
  });
  _emitter__WEBPACK_IMPORTED_MODULE_3__["default"].dispatch("theme-reloaded", theme);
};

ThemeModule.prototype.updateThemeList = function () {
  const results = _contentmanager__WEBPACK_IMPORTED_MODULE_1__["default"].loadNewContent("theme");

  for (const filename of results.added) this.loadTheme(filename);

  for (const name of results.removed) this.unloadTheme(name);
};

ThemeModule.prototype.loadThemeData = function () {
  const saved = _datastore__WEBPACK_IMPORTED_MODULE_4__["default"].getSettingGroup("themes");
  if (!saved) return;
  Object.assign(data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"], saved);
};

ThemeModule.prototype.saveThemeData = function () {
  _datastore__WEBPACK_IMPORTED_MODULE_4__["default"].setSettingGroup("themes", data__WEBPACK_IMPORTED_MODULE_0__["ThemeCookie"]);
};

/* harmony default export */ __webpack_exports__["default"] = (new ThemeModule());

/***/ }),

/***/ "./src/modules/utilities.js":
/*!**********************************!*\
  !*** ./src/modules/utilities.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Utilities; });
/* eslint-disable no-console */
class Utilities {
  /** Document/window width */
  static get screenWidth() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  }
  /** Document/window height */


  static get screenHeight() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  }

  static stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    return content;
  }

  static getTextArea() {
    return $(".channelTextArea-1LDbYG textarea");
  }

  static getInternalInstance(node) {
    return node[Object.keys(node).find(k => k.startsWith("__reactInternalInstance"))] || null;
  }

  static insertText(textarea, text) {
    textarea.focus();
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    document.execCommand("insertText", false, text);
  }

  static injectCss(uri) {
    $("<link/>", {
      type: "text/css",
      rel: "stylesheet",
      href: uri
    }).appendTo($("head"));
  }

  static injectJs(uri) {
    return new Promise(resolve => {
      $("<script/>", {
        type: "text/javascript",
        src: uri,
        onload: resolve
      }).appendTo($("body"));
    });
  }

  static escapeID(id) {
    return id.replace(/^[^a-z]+|[^\w-]+/gi, "");
  }

  static log(moduleName, message) {
    console.log(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: #3a71c1; font-weight: 700;", "color: #3a71c1;", "");
  }

  static warn(moduleName, message) {
    console.warn(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: #E8A400; font-weight: 700;", "color: #E8A400;", "");
  }

  static err(moduleName, message, error) {
    console.log(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: red; font-weight: 700;", "color: red;", "");

    if (error) {
      console.groupCollapsed("%cError: " + error.message, "color: red;");
      console.error(error.stack);
      console.groupEnd();
    }
  }

  static escape(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  static testJSON(data) {
    try {
      JSON.parse(data);
      return true;
    } catch (err) {
      return false;
    }
  }

  static suppressErrors(method, message) {
    return (...params) => {
      try {
        return method(...params);
      } catch (e) {
        this.err("SuppressedError", "Error occurred in " + message, e);
      }
    };
  }

  static monkeyPatch(what, methodName, options) {
    const {
      before,
      after,
      instead,
      once = false,
      silent = false,
      force = false
    } = options;
    const displayName = options.displayName || what.displayName || what.name || what.constructor.displayName || what.constructor.name;
    if (!silent) console.log("patch", methodName, "of", displayName); // eslint-disable-line no-console

    if (!what[methodName]) {
      if (force) what[methodName] = function () {};else return console.error(methodName, "does not exist for", displayName); // eslint-disable-line no-console
    }

    const origMethod = what[methodName];

    const cancel = () => {
      if (!silent) console.log("unpatch", methodName, "of", displayName); // eslint-disable-line no-console

      what[methodName] = origMethod;
    };

    what[methodName] = function () {
      const data = {
        thisObject: this,
        methodArguments: arguments,
        cancelPatch: cancel,
        originalMethod: origMethod,
        callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
      };

      if (instead) {
        const tempRet = Utilities.suppressErrors(instead, "`instead` callback of " + what[methodName].displayName)(data);
        if (tempRet !== undefined) data.returnValue = tempRet;
      } else {
        if (before) Utilities.suppressErrors(before, "`before` callback of " + what[methodName].displayName)(data);
        data.callOriginalMethod();
        if (after) Utilities.suppressErrors(after, "`after` callback of " + what[methodName].displayName)(data);
      }

      if (once) cancel();
      return data.returnValue;
    };

    what[methodName].__monkeyPatched = true;
    if (!what[methodName].__originalMethod) what[methodName].__originalMethod = origMethod;
    what[methodName].displayName = "patched " + (what[methodName].displayName || methodName);
    return cancel;
  }

  static onRemoved(node, callback) {
    const observer = new MutationObserver(mutations => {
      for (let m = 0; m < mutations.length; m++) {
        const mutation = mutations[m];
        const nodes = Array.from(mutation.removedNodes);
        const directMatch = nodes.indexOf(node) > -1;
        const parentMatch = nodes.some(parent => parent.contains(node));

        if (directMatch || parentMatch) {
          observer.disconnect();
          callback();
        }
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true
    });
  }
  /**
   * Generates an automatically memoizing version of an object.
   * @author Zerebos
   * @param {Object} object - object to memoize
   * @returns {Proxy} the proxy to the object that memoizes properties
   */


  static memoizeObject(object) {
    const proxy = new Proxy(object, {
      get: function (obj, mod) {
        if (!obj.hasOwnProperty(mod)) return undefined;

        if (Object.getOwnPropertyDescriptor(obj, mod).get) {
          const value = obj[mod];
          delete obj[mod];
          obj[mod] = value;
        }

        return obj[mod];
      },
      set: function (obj, mod, value) {
        if (obj.hasOwnProperty(mod)) return this.err("MemoizedObject", "Trying to overwrite existing property");
        obj[mod] = value;
        return obj[mod];
      }
    });
    Object.defineProperty(proxy, "hasOwnProperty", {
      value: function (prop) {
        return this[prop] !== undefined;
      }
    });
    return proxy;
  }
  /**
   * Builds a classname string from any number of arguments. This includes arrays and objects.
   * When given an array all values from the array are added to the list.
   * When given an object they keys are added as the classnames if the value is truthy.
   * Copyright (c) 2018 Jed Watson https://github.com/JedWatson/classnames MIT License
   * @param {...Any} argument - anything that should be used to add classnames.
   */


  static className() {
    const classes = [];
    const hasOwn = {}.hasOwnProperty;

    for (let i = 0; i < arguments.length; i++) {
      const arg = arguments[i];
      if (!arg) continue;
      const argType = typeof arg;

      if (argType === "string" || argType === "number") {
        classes.push(arg);
      } else if (Array.isArray(arg) && arg.length) {
        const inner = this.classNames.apply(null, arg);

        if (inner) {
          classes.push(inner);
        }
      } else if (argType === "object") {
        for (const key in arg) {
          if (hasOwn.call(arg, key) && arg[key]) {
            classes.push(key);
          }
        }
      }
    }

    return classes.join(" ");
  }

}

/***/ }),

/***/ "./src/modules/webpackmodules.js":
/*!***************************************!*\
  !*** ./src/modules/webpackmodules.js ***!
  \***************************************/
/*! exports provided: DiscordModules, Filters, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DiscordModules", function() { return DiscordModules; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Filters", function() { return Filters; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return WebpackModules; });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities */ "./src/modules/utilities.js");
/**
 * Allows for grabbing and searching through Discord's webpacked modules.
 * @module WebpackModules
 * @version 0.0.2
 */

const DiscordModules = _utilities__WEBPACK_IMPORTED_MODULE_0__["default"].memoizeObject({
  get React() {
    return WebpackModules.getByProps("createElement", "cloneElement");
  },

  get ReactDOM() {
    return WebpackModules.getByProps("render", "findDOMNode");
  },

  get Flux() {
    return WebpackModules.getByProps("connectStores");
  },

  get Events() {
    return WebpackModules.getByPrototypes("setMaxListeners", "emit");
  },

  /* Guild Info, Stores, and Utilities */
  get GuildStore() {
    return WebpackModules.getByProps("getGuild");
  },

  get SortedGuildStore() {
    return WebpackModules.getByProps("getSortedGuilds");
  },

  get SelectedGuildStore() {
    return WebpackModules.getByProps("getLastSelectedGuildId");
  },

  get GuildSync() {
    return WebpackModules.getByProps("getSyncedGuilds");
  },

  get GuildInfo() {
    return WebpackModules.getByProps("getAcronym");
  },

  get GuildChannelsStore() {
    return WebpackModules.getByProps("getChannels", "getDefaultChannel");
  },

  get GuildMemberStore() {
    return WebpackModules.getByProps("getMember");
  },

  get MemberCountStore() {
    return WebpackModules.getByProps("getMemberCounts");
  },

  get GuildEmojiStore() {
    return WebpackModules.getByProps("getEmojis");
  },

  get GuildActions() {
    return WebpackModules.getByProps("markGuildAsRead");
  },

  get GuildPermissions() {
    return WebpackModules.getByProps("getGuildPermissions");
  },

  /* Channel Store & Actions */
  get ChannelStore() {
    return WebpackModules.getByProps("getChannels", "getDMFromUserId");
  },

  get SelectedChannelStore() {
    return WebpackModules.getByProps("getLastSelectedChannelId");
  },

  get ChannelActions() {
    return WebpackModules.getByProps("selectChannel");
  },

  get PrivateChannelActions() {
    return WebpackModules.getByProps("openPrivateChannel");
  },

  get ChannelSelector() {
    return WebpackModules.getByProps("selectGuild", "selectChannel");
  },

  /* Current User Info, State and Settings */
  get UserInfoStore() {
    return WebpackModules.getByProps("getToken");
  },

  get UserSettingsStore() {
    return WebpackModules.getByProps("guildPositions");
  },

  get AccountManager() {
    return WebpackModules.getByProps("register", "login");
  },

  get UserSettingsUpdater() {
    return WebpackModules.getByProps("updateRemoteSettings");
  },

  get OnlineWatcher() {
    return WebpackModules.getByProps("isOnline");
  },

  get CurrentUserIdle() {
    return WebpackModules.getByProps("getIdleTime");
  },

  get RelationshipStore() {
    return WebpackModules.getByProps("isBlocked", "getFriendIDs");
  },

  get RelationshipManager() {
    return WebpackModules.getByProps("addRelationship");
  },

  get MentionStore() {
    return WebpackModules.getByProps("getMentions");
  },

  /* User Stores and Utils */
  get UserStore() {
    return WebpackModules.getByProps("getCurrentUser");
  },

  get UserStatusStore() {
    return WebpackModules.getByProps("getStatus", "getState");
  },

  get UserTypingStore() {
    return WebpackModules.getByProps("isTyping");
  },

  get UserActivityStore() {
    return WebpackModules.getByProps("getActivity");
  },

  get UserNameResolver() {
    return WebpackModules.getByProps("getName");
  },

  get UserNoteStore() {
    return WebpackModules.getByProps("getNote");
  },

  get UserNoteActions() {
    return WebpackModules.getByProps("updateNote");
  },

  /* Emoji Store and Utils */
  get EmojiInfo() {
    return WebpackModules.getByProps("isEmojiDisabled");
  },

  get EmojiUtils() {
    return WebpackModules.getByProps("getGuildEmoji");
  },

  get EmojiStore() {
    return WebpackModules.getByProps("getByCategory", "EMOJI_NAME_RE");
  },

  /* Invite Store and Utils */
  get InviteStore() {
    return WebpackModules.getByProps("getInvites");
  },

  get InviteResolver() {
    return WebpackModules.getByProps("findInvite");
  },

  get InviteActions() {
    return WebpackModules.getByProps("acceptInvite");
  },

  /* Discord Objects & Utils */
  get DiscordConstants() {
    return WebpackModules.getByProps("Permissions", "ActivityTypes", "StatusTypes");
  },

  get DiscordPermissions() {
    return WebpackModules.getByProps("Permissions", "ActivityTypes", "StatusTypes").Permissions;
  },

  get PermissionUtils() {
    return WebpackModules.getByProps("getHighestRole");
  },

  get ColorConverter() {
    return WebpackModules.getByProps("hex2int");
  },

  get ColorShader() {
    return WebpackModules.getByProps("darken");
  },

  get TinyColor() {
    return WebpackModules.getByPrototypes("toRgb");
  },

  get ClassResolver() {
    return WebpackModules.getByProps("getClass");
  },

  get ButtonData() {
    return WebpackModules.getByProps("ButtonSizes");
  },

  get IconNames() {
    return WebpackModules.getByProps("IconNames");
  },

  get NavigationUtils() {
    return WebpackModules.getByProps("transitionTo", "replaceWith", "getHistory");
  },

  /* Discord Messages */
  get MessageStore() {
    return WebpackModules.getByProps("getMessages");
  },

  get MessageActions() {
    return WebpackModules.getByProps("jumpToMessage", "_sendMessage");
  },

  get MessageQueue() {
    return WebpackModules.getByProps("enqueue");
  },

  get MessageParser() {
    return WebpackModules.getByProps("createMessage", "parse", "unparse");
  },

  /* Text Processing */
  get hljs() {
    return WebpackModules.getByProps("highlight", "highlightBlock");
  },

  get SimpleMarkdown() {
    return WebpackModules.getByProps("parseBlock", "parseInline", "defaultOutput");
  },

  /* Experiments */
  get ExperimentStore() {
    return WebpackModules.getByProps("getExperimentOverrides");
  },

  get ExperimentsManager() {
    return WebpackModules.getByProps("isDeveloper");
  },

  get CurrentExperiment() {
    return WebpackModules.getByProps("getExperimentId");
  },

  /* Images, Avatars and Utils */
  get ImageResolver() {
    return WebpackModules.getByProps("getUserAvatarURL", "getGuildIconURL");
  },

  get ImageUtils() {
    return WebpackModules.getByProps("getSizedImageSrc");
  },

  get AvatarDefaults() {
    return WebpackModules.getByProps("getUserAvatarURL", "DEFAULT_AVATARS");
  },

  /* Window, DOM, HTML */
  get WindowInfo() {
    return WebpackModules.getByProps("isFocused", "windowSize");
  },

  get TagInfo() {
    return WebpackModules.getByProps("VALID_TAG_NAMES");
  },

  get DOMInfo() {
    return WebpackModules.getByProps("canUseDOM");
  },

  /* Locale/Location and Time */
  get LocaleManager() {
    return WebpackModules.getByProps("setLocale");
  },

  get Moment() {
    return WebpackModules.getByProps("parseZone");
  },

  get LocationManager() {
    return WebpackModules.getByProps("createLocation");
  },

  get Timestamps() {
    return WebpackModules.getByProps("fromTimestamp");
  },

  get TimeFormatter() {
    return WebpackModules.getByProps("dateFormat");
  },

  /* Strings and Utils */
  get Strings() {
    return WebpackModules.getByProps("Messages").Messages;
  },

  get StringFormats() {
    return WebpackModules.getByProps("a", "z");
  },

  get StringUtils() {
    return WebpackModules.getByProps("toASCII");
  },

  /* URLs and Utils */
  get URLParser() {
    return WebpackModules.getByProps("Url", "parse");
  },

  get ExtraURLs() {
    return WebpackModules.getByProps("getArticleURL");
  },

  /* Drag & Drop */
  get DNDActions() {
    return WebpackModules.getByProps("beginDrag");
  },

  get DNDSources() {
    return WebpackModules.getByProps("addTarget");
  },

  get DNDObjects() {
    return WebpackModules.getByProps("DragSource");
  },

  /* Media Stuff (Audio/Video) */
  get MediaDeviceInfo() {
    return WebpackModules.getByProps("Codecs", "SUPPORTED_BROWSERS");
  },

  get MediaInfo() {
    return WebpackModules.getByProps("getOutputVolume");
  },

  get MediaEngineInfo() {
    return WebpackModules.getByProps("MediaEngineFeatures");
  },

  get VoiceInfo() {
    return WebpackModules.getByProps("EchoCancellation");
  },

  get VideoStream() {
    return WebpackModules.getByProps("getVideoStream");
  },

  get SoundModule() {
    return WebpackModules.getByProps("playSound");
  },

  /* Electron & Other Internals with Utils*/
  get ElectronModule() {
    return WebpackModules.getByProps("setBadge");
  },

  get Dispatcher() {
    return WebpackModules.getByProps("dirtyDispatch");
  },

  get PathUtils() {
    return WebpackModules.getByProps("hasBasename");
  },

  get NotificationModule() {
    return WebpackModules.getByProps("showNotification");
  },

  get RouterModule() {
    return WebpackModules.getByProps("Router");
  },

  get APIModule() {
    return WebpackModules.getByProps("getAPIBaseURL");
  },

  get AnalyticEvents() {
    return WebpackModules.getByProps("AnalyticEventConfigs");
  },

  get KeyGenerator() {
    return WebpackModules.getByRegex(/"binary"/);
  },

  get Buffers() {
    return WebpackModules.getByProps("Buffer", "kMaxLength");
  },

  get DeviceStore() {
    return WebpackModules.getByProps("getDevices");
  },

  get SoftwareInfo() {
    return WebpackModules.getByProps("os");
  },

  get CurrentContext() {
    return WebpackModules.getByProps("setTagsContext");
  }

});

/**
 * Checks if a given module matches a set of parameters.
 * @callback module:WebpackModules.Filters~filter
 * @param {*} module - module to check
 * @returns {boolean} - True if the module matches the filter, false otherwise
 */

/**
 * Filters for use with {@link module:WebpackModules} but may prove useful elsewhere.
 */

class Filters {
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
   * @param {Array<string>} props - Array of property names
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */
  static byProperties(props, filter = m => m) {
    return module => {
      const component = filter(module);
      if (!component) return false;
      return props.every(property => component[property] !== undefined);
    };
  }
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties on the object's prototype.
   * @param {Array<string>} fields - Array of property names
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties on the object's prototype
   */


  static byPrototypeFields(fields, filter = m => m) {
    return module => {
      const component = filter(module);
      if (!component) return false;
      if (!component.prototype) return false;
      return fields.every(field => component.prototype[field] !== undefined);
    };
  }
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a regex.
   * @param {RegExp} search - A RegExp to check on the module
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */


  static byCode(search, filter = m => m) {
    return module => {
      const method = filter(module);
      if (!method) return false;
      return method.toString([]).search(search) !== -1;
    };
  }
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by strings.
   * @param {...String} search - A RegExp to check on the module
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of strings
   */


  static byString(...strings) {
    return module => {
      const moduleString = module.toString([]);

      for (const s of strings) {
        if (!moduleString.includes(s)) return false;
      }

      return true;
    };
  }
  /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
   * @param {string} name - Name the module should have
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */


  static byDisplayName(name) {
    return module => {
      return module && module.displayName === name;
    };
  }
  /**
   * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
   * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
   * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
   */


  static combine(...filters) {
    return module => {
      return filters.every(filter => filter(module));
    };
  }

}
class WebpackModules {
  static find(filter, first = true) {
    return this.getModule(filter, first);
  }

  static findAll(filter) {
    return this.getModule(filter, false);
  }

  static findByUniqueProperties(props, first = true) {
    return first ? this.getByProps(...props) : this.getAllByProps(...props);
  }

  static findByDisplayName(name) {
    return this.getByDisplayName(name);
  }
  /**
   * Finds a module using a filter function.
   * @param {Function} filter A function to use to filter modules
   * @param {Boolean} first Whether to return only the first matching module
   * @return {Any}
   */


  static getModule(filter, first = true) {
    const modules = this.getAllModules();
    const rm = [];

    for (const index in modules) {
      if (!modules.hasOwnProperty(index)) continue;
      const module = modules[index];
      const {
        exports
      } = module;
      let foundModule = null;
      if (!exports) continue;
      if (exports.__esModule && exports.default && filter(exports.default)) foundModule = exports.default;
      if (filter(exports)) foundModule = exports;
      if (!foundModule) continue;
      if (first) return foundModule;
      rm.push(foundModule);
    }

    return first || rm.length == 0 ? undefined : rm;
  }
  /**
   * Finds all modules matching a filter function.
   * @param {Function} filter A function to use to filter modules
   */


  static getModules(filter) {
    return this.getModule(filter, false);
  }
  /**
   * Finds a module by its name.
   * @param {String} name The name of the module
   * @param {Function} fallback A function to use to filter modules if not finding a known module
   * @return {Any}
   */


  static getModuleByName(name, fallback) {
    if (DiscordModules.hasOwnProperty(name)) return DiscordModules[name];
    if (!fallback) return undefined;
    const module = this.getModule(fallback, true);
    return module ? DiscordModules[name] = module : undefined;
  }
  /**
   * Finds a module by its display name.
   * @param {String} name The display name of the module
   * @return {Any}
   */


  static getByDisplayName(name) {
    return this.getModule(Filters.byDisplayName(name), true);
  }
  /**
   * Finds a module using its code.
   * @param {RegEx} regex A regular expression to use to filter modules
   * @param {Boolean} first Whether to return the only the first matching module
   * @return {Any}
   */


  static getByRegex(regex, first = true) {
    return this.getModule(Filters.byCode(regex), first);
  }
  /**
   * Finds a single module using properties on its prototype.
   * @param {...string} prototypes Properties to use to filter modules
   * @return {Any}
   */


  static getByPrototypes(...prototypes) {
    return this.getModule(Filters.byPrototypeFields(prototypes), true);
  }
  /**
   * Finds all modules with a set of properties of its prototype.
   * @param {...string} prototypes Properties to use to filter modules
   * @return {Any}
   */


  static getAllByPrototypes(...prototypes) {
    return this.getModule(Filters.byPrototypeFields(prototypes), false);
  }
  /**
   * Finds a single module using its own properties.
   * @param {...string} props Properties to use to filter modules
   * @return {Any}
   */


  static getByProps(...props) {
    return this.getModule(Filters.byProperties(props), true);
  }
  /**
   * Finds all modules with a set of properties.
   * @param {...string} props Properties to use to filter modules
   * @return {Any}
   */


  static getAllByProps(...props) {
    return this.getModule(Filters.byProperties(props), false);
  }
  /**
   * Finds a single module using a set of strings.
   * @param {...String} props Strings to use to filter modules
   * @return {Any}
   */


  static getByString(...strings) {
    return this.getModule(Filters.byString(...strings), true);
  }
  /**
   * Finds all modules with a set of strings.
   * @param {...String} strings Strings to use to filter modules
   * @return {Any}
   */


  static getAllByString(...strings) {
    return this.getModule(Filters.byString(...strings), false);
  }
  /**
   * Discord's __webpack_require__ function.
   */


  static get require() {
    if (this._require) return this._require;
    const id = "bbd-webpackmodules";

    const __webpack_require__ = typeof window.webpackJsonp == "function" ? window.webpackJsonp([], {
      [id]: (module, exports, __webpack_require__) => exports.default = __webpack_require__
    }, [id]).default : window.webpackJsonp.push([[], {
      [id]: (module, exports, __webpack_require__) => module.exports = __webpack_require__
    }, [[id]]]);

    delete __webpack_require__.m[id];
    delete __webpack_require__.c[id];
    return this._require = __webpack_require__;
  }
  /**
   * Returns all loaded modules.
   * @return {Array}
   */


  static getAllModules() {
    return this.require.c;
  }

}

/***/ }),

/***/ "./src/structs/builtin.js":
/*!********************************!*\
  !*** ./src/structs/builtin.js ***!
  \********************************/
/*! exports provided: onSettingChange, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onSettingChange", function() { return onSettingChange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BuiltinModule; });
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var _modules_utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/utilities */ "./src/modules/utilities.js");
/* harmony import */ var _modules_emitter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/emitter */ "./src/modules/emitter.js");



function onSettingChange(category, identifier, onEnable, onDisable) {
  const handler = (cat, id, enabled) => {
    if (category !== cat || id !== identifier) return;
    if (enabled) onEnable();else onDisable();
  };

  _modules_emitter__WEBPACK_IMPORTED_MODULE_2__["default"].on("setting-updated", handler);
  return () => {
    _modules_emitter__WEBPACK_IMPORTED_MODULE_2__["default"].off("setting-updated", handler);
  };
}
class BuiltinModule {
  get name() {
    return "Unnamed Builtin";
  }

  get category() {
    return "Modules";
  }

  get id() {
    return "None";
  }

  async initialize() {
    if (data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"][this.id]) await this.enable();
    _modules_emitter__WEBPACK_IMPORTED_MODULE_2__["default"].on("setting-updated", (category, id, enabled) => {
      if (category !== this.category || id !== this.id) return;
      if (enabled) this.enable();else this.disable();
    });
  }

  async enable() {
    this.log("Enabled");
    await this.enabled();
  }

  async disable() {
    this.log("Disabled");
    await this.disabled();
  }

  async enabled() {}

  async disabled() {}

  log(...message) {
    _modules_utilities__WEBPACK_IMPORTED_MODULE_1__["default"].log(this.name, ...message);
  }

  warn(...message) {
    _modules_utilities__WEBPACK_IMPORTED_MODULE_1__["default"].warn(this.name, ...message);
  }

  error(...message) {
    _modules_utilities__WEBPACK_IMPORTED_MODULE_1__["default"].err(this.name, ...message);
  }

}

/***/ }),

/***/ "./src/ui/emote.js":
/*!*************************!*\
  !*** ./src/ui/emote.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BDEmote; });
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");
/* harmony import */ var _builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../builtins/emotemenu */ "./src/builtins/emotemenu.js");



class BDEmote extends modules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].React.Component {
  constructor(props) {
    super(props);
    const isFav = _builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__["default"] && _builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__["default"].favoriteEmotes && _builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__["default"].favoriteEmotes[this.label] ? true : false;
    this.state = {
      shouldAnimate: !this.animateOnHover,
      isFavorite: isFav
    };
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  get animateOnHover() {
    return data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"]["fork-es-2"];
  }

  get label() {
    return this.props.modifier ? `${this.props.name}:${this.props.modifier}` : this.props.name;
  }

  get modifierClass() {
    return this.props.modifier ? ` emote${this.props.modifier}` : "";
  }

  onMouseEnter() {
    if (!this.state.shouldAnimate && this.animateOnHover) this.setState({
      shouldAnimate: true
    });
    if (!this.state.isFavorite && _builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__["default"].favoriteEmotes[this.label]) this.setState({
      isFavorite: true
    });else if (this.state.isFavorite && !_builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__["default"].favoriteEmotes[this.label]) this.setState({
      isFavorite: false
    });
  }

  onMouseLeave() {
    if (this.state.shouldAnimate && this.animateOnHover) this.setState({
      shouldAnimate: false
    });
  }

  onClick(e) {
    if (this.props.onClick) this.props.onClick(e);
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].React.createElement(modules__WEBPACK_IMPORTED_MODULE_1__["BDV2"].TooltipWrapper, {
      color: "black",
      position: "top",
      text: this.label,
      delay: 750
    }, modules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].React.createElement("div", {
      className: "emotewrapper" + (this.props.jumboable ? " jumboable" : ""),
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave,
      onClick: this.onClick
    }, modules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].React.createElement("img", {
      draggable: false,
      className: "emote" + this.modifierClass + (this.props.jumboable ? " jumboable" : "") + (!this.state.shouldAnimate ? " stop-animation" : ""),
      dataModifier: this.props.modifier,
      alt: this.label,
      src: this.props.url
    }), modules__WEBPACK_IMPORTED_MODULE_1__["DiscordModules"].React.createElement("input", {
      className: "fav" + (this.state.isFavorite ? " active" : ""),
      title: "Favorite!",
      type: "button",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();

        if (this.state.isFavorite) {
          delete _builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__["default"].favoriteEmotes[this.label];
          _builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__["default"].updateFavorites();
        } else {
          _builtins_emotemenu__WEBPACK_IMPORTED_MODULE_2__["default"].favorite(this.label, this.props.url);
        }

        this.setState({
          isFavorite: !this.state.isFavorite
        });
      }
    })));
  }

}

/***/ }),

/***/ "./src/ui/icons/bdlogo.js":
/*!********************************!*\
  !*** ./src/ui/icons/bdlogo.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BDLogo; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");

class BDLogo extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("svg", {
      height: "100%",
      width: this.props.size || "16px",
      className: "bd-logo " + this.props.className,
      style: {
        fillRule: "evenodd",
        clipRule: "evenodd",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      },
      viewBox: "0 0 2000 2000"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("metadata", null), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("defs", null, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("filter", {
      id: "shadow1"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("feDropShadow", {
      "dx": "20",
      "dy": "0",
      "stdDeviation": "20",
      "flood-color": "rgba(0,0,0,0.35)"
    })), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("filter", {
      id: "shadow2"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("feDropShadow", {
      "dx": "15",
      "dy": "0",
      "stdDeviation": "20",
      "flood-color": "rgba(255,255,255,0.15)"
    })), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("filter", {
      id: "shadow3"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("feDropShadow", {
      "dx": "10",
      "dy": "0",
      "stdDeviation": "20",
      "flood-color": "rgba(0,0,0,0.35)"
    }))), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("g", null, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("path", {
      style: {
        filter: "url(#shadow3)"
      },
      d: "M1195.44+135.442L1195.44+135.442L997.6+136.442C1024.2+149.742+1170.34+163.542+1193.64+179.742C1264.34+228.842+1319.74+291.242+1358.24+365.042C1398.14+441.642+1419.74+530.642+1422.54+629.642L1422.54+630.842L1422.54+632.042C1422.54+773.142+1422.54+1228.14+1422.54+1369.14L1422.54+1370.34L1422.54+1371.54C1419.84+1470.54+1398.24+1559.54+1358.24+1636.14C1319.74+1709.94+1264.44+1772.34+1193.64+1821.44C1171.04+1837.14+1025.7+1850.54+1000+1863.54L1193.54+1864.54C1539.74+1866.44+1864.54+1693.34+1864.54+1296.64L1864.54+716.942C1866.44+312.442+1541.64+135.442+1195.44+135.442Z",
      fill: "#171717",
      opacity: "1"
    }), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("path", {
      style: {
        filter: "url(#shadow2)"
      },
      d: "M1695.54+631.442C1685.84+278.042+1409.34+135.442+1052.94+135.442L361.74+136.442L803.74+490.442L1060.74+490.442C1335.24+490.442+1335.24+835.342+1060.74+835.342L1060.74+1164.84C1150.22+1164.84+1210.53+1201.48+1241.68+1250.87C1306.07+1353+1245.76+1509.64+1060.74+1509.64L361.74+1863.54L1052.94+1864.54C1409.24+1864.54+1685.74+1721.94+1695.54+1368.54C1695.54+1205.94+1651.04+1084.44+1572.64+999.942C1651.04+915.542+1695.54+794.042+1695.54+631.442Z",
      fill: "#3E82E5",
      opacity: "1"
    }), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("path", {
      style: {
        filter: "url(#shadow1)"
      },
      d: "M1469.25+631.442C1459.55+278.042+1183.05+135.442+826.65+135.442L135.45+135.442L135.45+1004C135.45+1004+135.427+1255.21+355.626+1255.21C575.825+1255.21+575.848+1004+575.848+1004L577.45+490.442L834.45+490.442C1108.95+490.442+1108.95+835.342+834.45+835.342L664.65+835.342L664.65+1164.84L834.45+1164.84C923.932+1164.84+984.244+1201.48+1015.39+1250.87C1079.78+1353+1019.47+1509.64+834.45+1509.64L135.45+1509.64L135.45+1864.54L826.65+1864.54C1182.95+1864.54+1459.45+1721.94+1469.25+1368.54C1469.25+1205.94+1424.75+1084.44+1346.35+999.942C1424.75+915.542+1469.25+794.042+1469.25+631.442Z",
      fill: "#FFFFFF",
      opacity: "1"
    })));
  }

}

/***/ }),

/***/ "./src/ui/icons/close.js":
/*!*******************************!*\
  !*** ./src/ui/icons/close.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2C_XSvg; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");

class V2C_XSvg extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 12 12",
      style: {
        width: "18px",
        height: "18px"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("g", {
      className: "background",
      fill: "none",
      fillRule: "evenodd"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("path", {
      d: "M0 0h12v12H0"
    }), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("path", {
      className: "fill",
      fill: "#dcddde",
      d: "M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"
    })));
  }

}

/***/ }),

/***/ "./src/ui/modals.js":
/*!**************************!*\
  !*** ./src/ui/modals.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Modals; });
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");


class Modals {
  static get shouldShowContentErrors() {
    return data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"]["fork-ps-1"];
  }

  static get ModalStack() {
    return modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getByProps("push", "update", "pop", "popWithKey");
  }

  static get AlertModal() {
    return modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");
  }

  static get TextElement() {
    return modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getByProps("Sizes", "Weights");
  }

  static get ConfirmationModal() {
    return modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
  }

  static default(title, content) {
    const modal = $(`<div class="bd-modal-wrapper theme-dark">
                <div class="bd-backdrop backdrop-1wrmKB"></div>
                <div class="bd-modal modal-1UGdnR">
                    <div class="bd-modal-inner inner-1JeGVc">
                        <div class="header header-1R_AjF">
                            <div class="title">${title}</div>
                        </div>
                        <div class="bd-modal-body">
                            <div class="scroller-wrap fade">
                                <div class="scroller">
                                    ${content}
                                </div>
                            </div>
                        </div>
                        <div class="footer footer-2yfCgX">
                            <button type="button">Okay</button>
                        </div>
                    </div>
                </div>
            </div>`);
    modal.find(".footer button").on("click", () => {
      modal.addClass("closing");
      setTimeout(() => {
        modal.remove();
      }, 300);
    });
    modal.find(".bd-backdrop").on("click", () => {
      modal.addClass("closing");
      setTimeout(() => {
        modal.remove();
      }, 300);
    });
    modal.appendTo("#app-mount");
  }

  static alert(title, content) {
    if (this.ModalStack && this.AlertModal) return this.default(title, content);
    this.ModalStack.push(function (props) {
      return modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement(this.AlertModal, Object.assign({
        title: title,
        body: content
      }, props));
    });
  }
  /**
   * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
   * @param {string} title - title of the modal
   * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
   * @param {object} [options] - options to modify the modal
   * @param {boolean} [options.danger=false] - whether the main button should be red or not
   * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
   * @param {string} [options.cancelText=Cancel] - text for the cancel button
   * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
   * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
   */


  static showConfirmationModal(title, content, options = {}) {
    const TextElement = this.TextElement;
    const ConfirmationModal = this.ConfirmationModal;
    const ModalStack = this.ModalStack;
    if (!this.ModalStack || !this.ConfirmationModal || !this.TextElement) return this.alert(title, content);
    const {
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      danger = false
    } = options;
    if (typeof content == "string") content = TextElement({
      color: TextElement.Colors.PRIMARY,
      children: [content]
    });else if (Array.isArray(content)) content = TextElement({
      color: TextElement.Colors.PRIMARY,
      children: content
    });
    content = [content];

    const emptyFunction = () => {};

    ModalStack.push(function (props) {
      return modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement(ConfirmationModal, Object.assign({
        header: title,
        children: content,
        red: danger,
        confirmText: confirmText ? confirmText : "Okay",
        cancelText: cancelText ? cancelText : "Cancel",
        onConfirm: onConfirm ? onConfirm : emptyFunction,
        onCancel: onCancel ? onCancel : emptyFunction
      }, props));
    });
  }

  static showContentErrors({
    plugins: pluginErrors = [],
    themes: themeErrors = []
  }) {
    if (!pluginErrors || !themeErrors || !this.shouldShowContentErrors) return;
    if (!pluginErrors.length && !themeErrors.length) return;
    const modal = $(`<div class="bd-modal-wrapper theme-dark">
                        <div class="bd-backdrop backdrop-1wrmKB"></div>
                        <div class="bd-modal bd-content-modal modal-1UGdnR">
                            <div class="bd-modal-inner inner-1JeGVc">
                                <div class="header header-1R_AjF"><div class="title">Content Errors</div></div>
                                <div class="bd-modal-body">
                                    <div class="tab-bar-container">
                                        <div class="tab-bar TOP">
                                            <div class="tab-bar-item">Plugins</div>
                                            <div class="tab-bar-item">Themes</div>
                                        </div>
                                    </div>
                                    <div class="table-header">
                                        <div class="table-column column-name">Name</div>
                                        <div class="table-column column-message">Message</div>
                                        <div class="table-column column-error">Error</div>
                                    </div>
                                    <div class="scroller-wrap fade">
                                        <div class="scroller">

                                        </div>
                                    </div>
                                </div>
                                <div class="footer footer-2yfCgX">
                                    <button type="button">Okay</button>
                                </div>
                            </div>
                        </div>
                    </div>`);

    const generateTab = function (errors) {
      const container = $(`<div class="errors">`);

      for (const err of errors) {
        const error = $(`<div class="error">
                                    <div class="table-column column-name">${err.name ? err.name : err.file}</div>
                                    <div class="table-column column-message">${err.message}</div>
                                    <div class="table-column column-error"><a class="error-link" href="">${err.error ? err.error.message : ""}</a></div>
                                </div>`);
        container.append(error);

        if (err.error) {
          error.find("a").on("click", e => {
            e.preventDefault();
            modules__WEBPACK_IMPORTED_MODULE_1__["Utilities"].err("ContentManager", `Error details for ${err.name ? err.name : err.file}.`, err.error);
          });
        }
      }

      return container;
    };

    const tabs = [generateTab(pluginErrors), generateTab(themeErrors)];
    modal.find(".tab-bar-item").on("click", e => {
      e.preventDefault();
      modal.find(".tab-bar-item").removeClass("selected");
      $(e.target).addClass("selected");
      modal.find(".scroller").empty().append(tabs[$(e.target).index()]);
    });
    modal.find(".footer button").on("click", () => {
      modal.addClass("closing");
      setTimeout(() => {
        modal.remove();
      }, 300);
    });
    modal.find(".bd-backdrop").on("click", () => {
      modal.addClass("closing");
      setTimeout(() => {
        modal.remove();
      }, 300);
    });
    modal.appendTo("#app-mount");
    if (pluginErrors.length) modal.find(".tab-bar-item")[0].click();else modal.find(".tab-bar-item")[1].click();
  }

}

/***/ }),

/***/ "./src/ui/publicservers/card.js":
/*!**************************************!*\
  !*** ./src/ui/publicservers/card.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2C_ServerCard; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");

class V2C_ServerCard extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
    if (!this.props.server.iconUrl) this.props.server.iconUrl = this.props.fallback;
    this.state = {
      imageError: false,
      joined: this.props.guildList.includes(this.props.server.identifier)
    };
  }

  render() {
    const {
      server
    } = this.props;
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", // cardPrimary-1Hv-to
    {
      className: `card-3Qj_Yx cardPrimary-1Hv-to marginBottom8-AtZOdT bd-server-card${server.pinned ? " bd-server-card-pinned" : ""}`
    }, // React.createElement(
    // "div",
    // { className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-3jynv6" },
    modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("img", {
      ref: "img",
      className: "bd-server-image",
      src: server.iconUrl,
      onError: this.handleError.bind(this)
    }), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "flexChild-faoVW3 bd-server-content"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6 bd-server-header"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("h5", {
      className: "h5-18_1nd defaultColor-1_ajX0 margin-reset bd-server-name"
    }, server.name), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("h5", {
      className: "h5-18_1nd defaultColor-1_ajX0 margin-reset bd-server-member-count"
    }, server.members, " Members")), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y bd-server-description-container"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "scroller-2FKFPG scroller bd-server-description"
    }, server.description))), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY directionRow-3v3tfG noWrap-3jynv6 bd-server-footer"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "flexChild-faoVW3 bd-server-tags",
      style: {
        flex: "1 1 auto"
      }
    }, server.categories.join(", ")), this.state.joined && modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("button", {
      type: "button",
      className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN colorGreen-29iAKY",
      style: {
        minHeight: "12px",
        marginTop: "4px",
        backgroundColor: "#3ac15c"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-button-contents"
    }, "Joined")), server.error && modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("button", {
      type: "button",
      className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN disabled-9aF2ug",
      style: {
        minHeight: "12px",
        marginTop: "4px",
        backgroundColor: "#c13a3a"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-button-contents"
    }, "Error")), !server.error && !this.state.joined && modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("button", {
      type: "button",
      className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMin-1mJd1x grow-q77ONN",
      style: {
        minHeight: "12px",
        marginTop: "4px"
      },
      onClick: () => {
        this.join();
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-button-contents"
    }, "Join")))) // )
    );
  }

  handleError() {
    this.props.server.iconUrl = this.props.fallback;
    this.setState({
      imageError: true
    });
  }

  join() {
    this.props.join(this); //this.setState({joined: true});
  }

}

/***/ }),

/***/ "./src/ui/publicservers/exitbutton.js":
/*!********************************************!*\
  !*** ./src/ui/publicservers/exitbutton.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2C_Tools; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");
/* harmony import */ var _icons_close__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../icons/close */ "./src/ui/icons/close.js");


class V2C_Tools extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "tools-container toolsContainer-1edPuj"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "tools tools-3-3s-N"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "container-1sFeqf"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "btn-close closeButton-1tv5uR",
      onClick: this.onClick
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_icons_close__WEBPACK_IMPORTED_MODULE_1__["default"], null)), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "esc-text keybind-KpFkfr"
    }, "ESC"))));
  }

  onClick() {
    if (this.props.onClick) {
      this.props.onClick();
    }

    $(".closeButton-1tv5uR").first().click();
  }

}

/***/ }),

/***/ "./src/ui/publicservers/layer.js":
/*!***************************************!*\
  !*** ./src/ui/publicservers/layer.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2C_Layer; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");

class V2C_Layer extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $(window).on(`keyup.${this.props.id}`, e => {
      if (e.which === 27) {
        modules__WEBPACK_IMPORTED_MODULE_0__["ReactDOM"].unmountComponentAtNode(this.refs.root.parentNode);
      }
    });
    $(`#${this.props.id}`).animate({
      opacity: 1
    }, {
      step: function (now) {
        $(this).css("transform", `scale(${1.1 - 0.1 * now}) translateZ(0px)`);
      },
      duration: 200,
      done: () => {
        $(`#${this.props.id}`).css("opacity", "").css("transform", "");
      }
    });
  }

  componentWillUnmount() {
    $(window).off(`keyup.${this.props.id}`);
    $(`#${this.props.id}`).animate({
      opacity: 0
    }, {
      step: function (now) {
        $(this).css("transform", `scale(${1.1 - 0.1 * now}) translateZ(0px)`);
      },
      duration: 200,
      done: () => {
        $(`#${this.props.rootId}`).remove();
      }
    });
    $("[class*=\"layer-\"]").removeClass("publicServersOpen").animate({
      opacity: 1
    }, {
      step: function (now) {
        $(this).css("transform", `scale(${0.07 * now + 0.93}) translateZ(0px)`);
      },
      duration: 200,
      done: () => {
        $("[class*=\"layer-\"]").css("opacity", "").css("transform", "");
      }
    });
  }

  componentWillMount() {
    $("[class*=\"layer-\"]").addClass("publicServersOpen").animate({
      opacity: 0
    }, {
      step: function (now) {
        $(this).css("transform", `scale(${0.07 * now + 0.93}) translateZ(0px)`);
      },
      duration: 200
    });
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "layer bd-layer layer-3QrUeG",
      id: this.props.id,
      ref: "root",
      style: {
        opacity: 0,
        transform: "scale(1.1) translateZ(0px)"
      }
    }, this.props.children);
  }

}

/***/ }),

/***/ "./src/ui/publicservers/menu.js":
/*!**************************************!*\
  !*** ./src/ui/publicservers/menu.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2C_PublicServers; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");
/* harmony import */ var _sidebarview__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sidebarview */ "./src/ui/publicservers/sidebarview.js");
/* harmony import */ var _exitbutton__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./exitbutton */ "./src/ui/publicservers/exitbutton.js");
/* harmony import */ var _tabbar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tabbar */ "./src/ui/publicservers/tabbar.js");
/* harmony import */ var _settings_title__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../settings/title */ "./src/ui/settings/title.jsx");
/* harmony import */ var _card__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./card */ "./src/ui/publicservers/card.js");






class V2C_PublicServers extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
    this.setInitialState();
    this.close = this.close.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
    this.search = this.search.bind(this);
    this.searchKeyDown = this.searchKeyDown.bind(this);
    this.checkConnection = this.checkConnection.bind(this);
    this.join = this.join.bind(this);
    this.connect = this.connect.bind(this);
    this.GuildStore = modules__WEBPACK_IMPORTED_MODULE_0__["WebpackModules"].getByProps("getGuilds");
    this.AvatarDefaults = modules__WEBPACK_IMPORTED_MODULE_0__["WebpackModules"].getByProps("getUserAvatarURL", "DEFAULT_AVATARS");
    this.InviteActions = modules__WEBPACK_IMPORTED_MODULE_0__["WebpackModules"].getByProps("acceptInvite");
    this.SortedGuildStore = modules__WEBPACK_IMPORTED_MODULE_0__["WebpackModules"].getByProps("getSortedGuilds");
  }

  componentDidMount() {
    this.checkConnection();
  }

  setInitialState() {
    this.state = {
      selectedCategory: -1,
      title: "Loading...",
      loading: true,
      servers: [],
      next: null,
      connection: {
        state: 0,
        user: null
      }
    };
  }

  close() {
    modules__WEBPACK_IMPORTED_MODULE_0__["ReactDOM"].unmountComponentAtNode(document.getElementById(this.props.rootId));
  }

  search(query, clear) {
    const self = this;
    $.ajax({
      method: "GET",
      url: `${self.endPoint}${query}${query ? "&schema=new" : "?schema=new"}`,
      success: data => {
        let servers = data.results.reduce((arr, server) => {
          server.joined = false;
          arr.push(server); // arr.push(<ServerCard server={server} join={self.join}/>);

          return arr;
        }, []);

        if (!clear) {
          servers = self.state.servers.concat(servers);
        } else {//servers.unshift(self.bdServer);
        }

        let end = data.size + data.from;
        data.next = `?from=${end}`;
        if (self.state.term) data.next += `&term=${self.state.term}`;
        if (self.state.selectedCategory) data.next += `&category=${self.categoryButtons[self.state.selectedCategory]}`;

        if (end >= data.total) {
          end = data.total;
          data.next = null;
        }

        let title = `Showing 1-${end} of ${data.total} results in ${self.categoryButtons[self.state.selectedCategory]}`;
        if (self.state.term) title += ` for ${self.state.term}`;
        self.setState({
          loading: false,
          title: title,
          servers: servers,
          next: data.next
        });

        if (clear) {
          //console.log(self);
          self.refs.sbv.refs.contentScroller.scrollTop = 0;
        }
      },
      error: () => {
        self.setState({
          loading: false,
          title: "Failed to load servers. Check console for details"
        });
      }
    });
  }

  join(serverCard) {
    if (serverCard.props.pinned) return this.InviteActions.acceptInvite(serverCard.props.invite_code);
    $.ajax({
      method: "GET",
      url: `${this.joinEndPoint}/${serverCard.props.server.identifier}`,
      headers: {
        "Accept": "application/json;",
        "Content-Type": "application/json;",
        "x-discord-token": this.state.connection.user.accessToken
      },
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: () => {
        serverCard.setState({
          joined: true
        });
      }
    });
  }

  connect() {
    const options = this.windowOptions;
    options.x = Math.round(window.screenX + window.innerWidth / 2 - options.width / 2);
    options.y = Math.round(window.screenY + window.innerHeight / 2 - options.height / 2);
    this.joinWindow = new (window.require("electron").remote.BrowserWindow)(options);
    const url = "https://auth.discordservers.com/connect?scopes=guilds.join&previousUrl=https://auth.discordservers.com/info";
    this.joinWindow.webContents.on("did-navigate", (event, url) => {
      if (url != "https://auth.discordservers.com/info") return;
      this.joinWindow.close();
      this.checkConnection();
    });
    this.joinWindow.loadURL(url);
  }

  get windowOptions() {
    return {
      width: 500,
      height: 550,
      backgroundColor: "#282b30",
      show: true,
      resizable: false,
      maximizable: false,
      minimizable: false,
      alwaysOnTop: true,
      frame: false,
      center: false,
      webPreferences: {
        nodeIntegration: false
      }
    };
  }

  get bdServer() {
    const server = {
      name: "BetterDiscord",
      online: "7500+",
      members: "20000+",
      categories: ["community", "programming", "support"],
      description: "Official BetterDiscord server for support etc",
      identifier: "86004744966914048",
      iconUrl: "https://cdn.discordapp.com/icons/86004744966914048/292e7f6bfff2b71dfd13e508a859aedd.webp",
      nativejoin: true,
      invite_code: "0Tmfo5ZbORCRqbAd",
      pinned: true
    };
    const guildList = this.SortedGuildStore.guildPositions;
    const defaultList = this.AvatarDefaults.DEFAULT_AVATARS;
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_card__WEBPACK_IMPORTED_MODULE_5__["default"], {
      server: server,
      pinned: true,
      join: this.join,
      guildList: guildList,
      fallback: defaultList[Math.floor(Math.random() * 5)]
    });
  }

  get endPoint() {
    return "https://search.discordservers.com";
  }

  get joinEndPoint() {
    return "https://j.discordservers.com";
  }

  get connectEndPoint() {
    return "https://join.discordservers.com/connect";
  }

  checkConnection() {
    const self = this;

    try {
      $.ajax({
        method: "GET",
        url: `https://auth.discordservers.com/info`,
        headers: {
          "Accept": "application/json;",
          "Content-Type": "application/json;"
        },
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        success: data => {
          // Utils.log("PublicServer", "Got data: " + JSON.stringify(data));
          self.setState({
            selectedCategory: 0,
            connection: {
              state: 2,
              user: data
            }
          });
          self.search("", true);
        },
        error: () => {
          self.setState({
            title: "Not connected to discordservers.com!",
            loading: true,
            selectedCategory: -1,
            connection: {
              state: 1,
              user: null
            }
          });
        }
      });
    } catch (error) {
      self.setState({
        title: "Not connected to discordservers.com!",
        loading: true,
        selectedCategory: -1,
        connection: {
          state: 1,
          user: null
        }
      });
    }
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_sidebarview__WEBPACK_IMPORTED_MODULE_1__["default"], {
      ref: "sbv",
      children: this.component
    });
  }

  get component() {
    return {
      sidebar: {
        component: this.sidebar
      },
      content: {
        component: this.content
      },
      tools: {
        component: modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_exitbutton__WEBPACK_IMPORTED_MODULE_2__["default"], {
          key: "pt",
          ref: "tools",
          onClick: this.close
        })
      }
    };
  }

  get sidebar() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "sidebar",
      key: "ps"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-tab-bar SIDE"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-tab-bar-header",
      style: {
        fontSize: "16px"
      }
    }, "Public Servers"), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_tabbar__WEBPACK_IMPORTED_MODULE_3__["default"].Separator, null), this.searchInput, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_tabbar__WEBPACK_IMPORTED_MODULE_3__["default"].Separator, null), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_tabbar__WEBPACK_IMPORTED_MODULE_3__["default"].Header, {
      text: "Categories"
    }), this.categoryButtons.map((value, index) => {
      return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_tabbar__WEBPACK_IMPORTED_MODULE_3__["default"].Item, {
        id: index,
        onClick: this.changeCategory,
        key: index,
        text: value,
        selected: this.state.selectedCategory === index
      });
    }), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_tabbar__WEBPACK_IMPORTED_MODULE_3__["default"].Separator, null), this.footer, this.connection));
  }

  get searchInput() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-form-item"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-text-input flex-vertical",
      style: {
        width: "172px",
        marginLeft: "10px"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("input", {
      ref: "searchinput",
      onKeyDown: this.searchKeyDown,
      onChange: () => {},
      type: "text",
      className: "input default",
      placeholder: "Search...",
      maxLength: "50"
    })));
  }

  searchKeyDown(e) {
    const self = this;
    if (self.state.loading || e.which !== 13) return;
    self.setState({
      loading: true,
      title: "Loading...",
      term: e.target.value
    });
    let query = `?term=${e.target.value}`;

    if (self.state.selectedCategory !== 0) {
      query += `&category=${self.categoryButtons[self.state.selectedCategory]}`;
    }

    self.search(query, true);
  }

  get categoryButtons() {
    return ["All", "FPS Games", "MMO Games", "Strategy Games", "MOBA Games", "RPG Games", "Tabletop Games", "Sandbox Games", "Simulation Games", "Music", "Community", "Language", "Programming", "Other"];
  }

  changeCategory(id) {
    const self = this;
    if (self.state.loading) return;
    self.refs.searchinput.value = "";
    self.setState({
      loading: true,
      selectedCategory: id,
      title: "Loading...",
      term: null
    });

    if (id === 0) {
      self.search("", true);
      return;
    }

    self.search(`?category=${self.categoryButtons[id]}`, true);
  }

  get content() {
    const self = this;
    const guildList = this.SortedGuildStore.guildPositions;
    const defaultList = this.AvatarDefaults.DEFAULT_AVATARS;
    if (self.state.connection.state === 1) return self.notConnected;
    return [modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      ref: "content",
      key: "pc",
      className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_settings_title__WEBPACK_IMPORTED_MODULE_4__["default"], {
      text: self.state.title
    }), self.bdServer, self.state.servers.map(server => {
      return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_card__WEBPACK_IMPORTED_MODULE_5__["default"], {
        key: server.identifier,
        server: server,
        join: self.join,
        guildList: guildList,
        fallback: defaultList[Math.floor(Math.random() * 5)]
      });
    }), self.state.next && modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("button", {
      type: "button",
      onClick: () => {
        if (self.state.loading) return;
        self.setState({
          loading: true
        });
        self.search(self.state.next, false);
      },
      className: "ui-button filled brand small grow",
      style: {
        width: "100%",
        marginTop: "10px",
        marginBottom: "10px"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-button-contents"
    }, self.state.loading ? "Loading" : "Load More")), self.state.servers.length > 0 && modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_settings_title__WEBPACK_IMPORTED_MODULE_4__["default"], {
      text: self.state.title
    }))];
  }

  get notConnected() {
    const self = this; //return React.createElement(SettingsTitle, { text: self.state.title });

    return [modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      key: "ncc",
      ref: "content",
      className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("h2", {
      className: "ui-form-title h2 margin-reset margin-bottom-20"
    }, "Not connected to discordservers.com!", modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("button", {
      onClick: self.connect,
      type: "button",
      className: "ui-button filled brand small grow",
      style: {
        display: "inline-block",
        minHeight: "18px",
        marginLeft: "10px",
        lineHeight: "14px"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-button-contents"
    }, "Connect"))), self.bdServer)];
  }

  get footer() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-tab-bar-header"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("a", {
      href: "https://discordservers.com",
      target: "_blank"
    }, "Discordservers.com"));
  }

  get connection() {
    const self = this;
    const {
      connection
    } = self.state;
    if (connection.state !== 2) return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("span", null);
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("span", null, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_tabbar__WEBPACK_IMPORTED_MODULE_3__["default"].Separator, null), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("span", {
      style: {
        color: "#b9bbbe",
        fontSize: "10px",
        marginLeft: "10px"
      }
    }, "Connected as: ", `${connection.user.username}#${connection.user.discriminator}`), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      style: {
        padding: "5px 10px 0 10px"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("button", {
      style: {
        width: "100%",
        minHeight: "20px"
      },
      type: "button",
      className: "ui-button filled brand small grow"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-button-contents",
      onClick: self.connect
    }, "Reconnect"))));
  }

}

/***/ }),

/***/ "./src/ui/publicservers/publicservers.js":
/*!***********************************************!*\
  !*** ./src/ui/publicservers/publicservers.js ***!
  \***********************************************/
/*! exports provided: Menu, Card, Layer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _menu__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./menu */ "./src/ui/publicservers/menu.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Menu", function() { return _menu__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./card */ "./src/ui/publicservers/card.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Card", function() { return _card__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _layer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./layer */ "./src/ui/publicservers/layer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Layer", function() { return _layer__WEBPACK_IMPORTED_MODULE_2__["default"]; });






/***/ }),

/***/ "./src/ui/publicservers/scroller.js":
/*!******************************************!*\
  !*** ./src/ui/publicservers/scroller.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2C_Scroller; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");

class V2C_Scroller extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
  }

  render() {
    //scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y
    let wrapperClass = `scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d${this.props.fade ? " scrollerFade-1Ijw5y" : ""}`;
    let scrollerClass = "scroller-2FKFPG scroller";
    /* fuck */

    if (this.props.sidebar) scrollerClass = "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix sidebarRegionScroller-3MXcoP sidebar-region-scroller scroller";

    if (this.props.contentColumn) {
      scrollerClass = "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix contentRegionScroller-26nc1e content-region-scroller scroller";
      /* fuck */

      wrapperClass = "scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix contentRegionScrollerWrap-3YZXdm content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv";
    }

    const {
      children
    } = this.props;
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      key: "scrollerwrap",
      className: wrapperClass
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      key: "scroller",
      ref: "scroller",
      className: scrollerClass
    }, children));
  }

}

/***/ }),

/***/ "./src/ui/publicservers/sidebarview.js":
/*!*********************************************!*\
  !*** ./src/ui/publicservers/sidebarview.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2C_SidebarView; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");
/* harmony import */ var _scroller__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scroller */ "./src/ui/publicservers/scroller.js");


class V2C_SidebarView extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      sidebar,
      content,
      tools
    } = this.props.children;
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "standardSidebarView-3F1I7i ui-standard-sidebar-view"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "sidebarRegion-VFTUkN sidebar-region"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement(_scroller__WEBPACK_IMPORTED_MODULE_1__["default"], {
      key: "sidebarScroller",
      ref: "sidebarScroller",
      sidebar: true,
      fade: sidebar.fade || true,
      dark: sidebar.dark || true,
      children: sidebar.component
    })), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "contentRegion-3nDuYy content-region"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "contentTransitionWrap-3hqOEW content-transition-wrap"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix contentRegionScrollerWrap-3YZXdm content-region-scroller-wrap scrollerThemed-2oenus themeGhost-28MSn0 scrollerTrack-1ZIpsv"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "scroller-2FKFPG firefoxFixScrollFlex-cnI2ix contentRegionScroller-26nc1e content-region-scroller scroller",
      ref: "contentScroller"
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default"
    }, content.component), tools.component)))));
  }

}

/***/ }),

/***/ "./src/ui/publicservers/tabbar.js":
/*!****************************************!*\
  !*** ./src/ui/publicservers/tabbar.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2Cs_TabBar; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");


class V2C_TabBarItem extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
    this.setInitialState();
    this.onClick = this.onClick.bind(this);
  }

  setInitialState() {
    this.state = {
      selected: this.props.selected || false
    };
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: `ui-tab-bar-item${this.props.selected ? " selected" : ""}`,
      onClick: this.onClick
    }, this.props.text);
  }

  onClick() {
    if (this.props.onClick) {
      this.props.onClick(this.props.id);
    }
  }

}

class V2C_TabBarSeparator extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-tab-bar-separator margin-top-8 margin-bottom-8"
    });
  }

}

class V2C_TabBarHeader extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "ui-tab-bar-header"
    }, this.props.text);
  }

}

class V2Cs_TabBar {
  static get Item() {
    return V2C_TabBarItem;
  }

  static get Header() {
    return V2C_TabBarHeader;
  }

  static get Separator() {
    return V2C_TabBarSeparator;
  }

}

/***/ }),

/***/ "./src/ui/settings/divider.jsx":
/*!*************************************!*\
  !*** ./src/ui/settings/divider.jsx ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Divider; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");

class Divider extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: "bd-divider divider-3573oO marginTop8-1DLZ1n marginBottom40-2vIwTv"
    });
  }

}

/***/ }),

/***/ "./src/ui/settings/group.jsx":
/*!***********************************!*\
  !*** ./src/ui/settings/group.jsx ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Group; });
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");
/* harmony import */ var _title__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./title */ "./src/ui/settings/title.jsx");
/* harmony import */ var _divider__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./divider */ "./src/ui/settings/divider.jsx");
/* harmony import */ var _switch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./switch */ "./src/ui/settings/switch.jsx");





const baseClassName = "bd-settings-group";
class Group extends modules__WEBPACK_IMPORTED_MODULE_1__["React"].Component {
  constructor(props) {
    super(props);

    if (this.props.button && this.props.collapsible) {
      const original = this.props.button.onClick;

      this.props.button.onClick = event => {
        event.stopPropagation();
        original(...arguments);
      };
    }

    this.container = modules__WEBPACK_IMPORTED_MODULE_1__["React"].createRef();
    this.state = {
      collapsed: this.props.collapsible && this.props.collapsed
    };
    this.onChange = this.onChange.bind(this);
  }

  toggleCollapse() {
    const container = this.container.current;
    const timeout = this.state.collapsed ? 300 : 1;
    container.style.setProperty("height", container.scrollHeight + "px");
    this.setState({
      collapsed: !this.state.collapsed
    }, () => setTimeout(() => container.style.setProperty("height", ""), timeout));
  }

  onChange(id, value) {
    if (!this.props.onChange) return;
    if (this.props.id) return this.props.onChange(this.props.id, id, value);
    this.props.onChange(id, value);
    this.forceUpdate();
  }

  render() {
    const {
      settings
    } = this.props;
    const collapseClass = this.props.collapsible ? `collapsible ${this.state.collapsed && "collapsed"}` : "";
    const groupClass = `${baseClassName} ${collapseClass}`;
    return modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement("div", {
      className: groupClass
    }, modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement(_title__WEBPACK_IMPORTED_MODULE_2__["default"], {
      text: this.props.title,
      collapsible: this.props.collapsible,
      onClick: () => this.toggleCollapse(),
      button: this.props.button
    }), modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement("div", {
      className: "bd-settings-container",
      ref: this.container
    }, settings.map(setting => {
      const item = modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement(_switch__WEBPACK_IMPORTED_MODULE_4__["default"], {
        id: setting.id,
        key: setting.id,
        name: setting.text,
        note: setting.info,
        checked: data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"][setting.id],
        onChange: this.onChange
      });
      const shouldHide = setting.shouldHide ? setting.shouldHide() : false;
      if (!shouldHide) return item;
    })), this.props.showDivider && modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement(_divider__WEBPACK_IMPORTED_MODULE_3__["default"], null));
  }

}

/***/ }),

/***/ "./src/ui/settings/settings.js":
/*!*************************************!*\
  !*** ./src/ui/settings/settings.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return V2_SettingsPanel; });
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");
/* harmony import */ var _settings_group__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../settings/group */ "./src/ui/settings/group.jsx");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ui */ "./src/ui/ui.js");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_4__);

 // import Sidebar from "./sidebar";
// import Scroller from "../scroller";
// import List from "../list";
// import ContentColumn from "./contentcolumn";
// import SectionedSettingsPanel from "./sectionedsettings";
// import Tools from "./exitbutton";
// import SettingsPanel from "./panel";
// import PluginCard from "./plugincard";
// import ThemeCard from "./themecard";
// import ReloadIcon from "../icons/reload";
// import CssEditor from "../customcss/editor";
// import SettingsGroup from "../settings/settingsgroup";




class V2_SettingsPanel {
  constructor({
    onChange
  }) {
    this.onChange = onChange;
  }

  get coreSettings() {
    const settings = this.getSettings("core");
    const categories = [...new Set(settings.map(s => s.category))];
    const sections = categories.map(c => {
      return {
        title: c,
        settings: settings.filter(s => s.category == c)
      };
    });
    return sections;
  }

  get emoteSettings() {
    return this.getSettings("emote");
  }

  getSettings(category) {
    return Object.keys(data__WEBPACK_IMPORTED_MODULE_0__["SettingsInfo"]).reduce((arr, key) => {
      const setting = data__WEBPACK_IMPORTED_MODULE_0__["SettingsInfo"][key];

      if (setting.cat === category && setting.implemented && !setting.hidden) {
        setting.text = key;
        arr.push(setting);
      }

      return arr;
    }, []);
  }

  get core2() {
    return this.coreSettings.map((section, i) => {
      if (i == 0) section.button = {
        title: "Call to Action!",
        onClick: () => {
          _ui__WEBPACK_IMPORTED_MODULE_3__["Toasts"].success("You did it!", {
            forceShow: true
          });
        }
      };
      console.log(section);
      if (section.settings.find(s => s.text == "Hide Channels")) section.settings.find(s => s.text == "Hide Channels").shouldHide = () => !data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"]["bda-gs-2"];
      return modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement(_settings_group__WEBPACK_IMPORTED_MODULE_2__["default"], Object.assign({}, section, {
        onChange: this.onChange,
        collapsible: true,
        collapsed: i > 1
      }));
    });
  }

  get attribution() {
    return modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement("div", {
      style: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#72767d",
        padding: "2px 10px"
      }
    }, `BBD v${data__WEBPACK_IMPORTED_MODULE_0__["Config"].bbdVersion} by `, modules__WEBPACK_IMPORTED_MODULE_1__["React"].createElement("a", {
      href: "https://github.com/rauenzi/",
      target: "_blank"
    }, "Zerebos"));
  } // get coreComponent() {
  //     return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [
  //         React.createElement(SectionedSettingsPanel, {key: "cspanel", onChange: this.onChange, sections: this.coreSettings}),
  //         React.createElement(Tools, {key: "tools"})
  //     ]});
  // }
  // get emoteComponent() {
  //     return React.createElement(Scroller, {
  //         contentColumn: true, fade: true, dark: true, children: [
  //             React.createElement(SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings, button: {
  //                 title: "Clear Emote Cache",
  //                 onClick: () => { Events.dispatch("emotes-clear"); /*EmoteModule.clearEmoteData(); EmoteModule.init();*/ }
  //             }}),
  //             React.createElement(Tools, {key: "tools"})
  //     ]});
  // }
  // get customCssComponent() {
  //     return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [React.createElement(CssEditor, {key: "csseditor"}), React.createElement(Tools, {key: "tools"})]});
  // }
  // contentComponent(type) {
  //     const componentElement = type == "plugins" ? this.pluginsComponent : this.themesComponent;
  //     const prefix = type.replace("s", "");
  //     const settingsList = this;
  //     class ContentList extends React.Component {
  //         constructor(props) {
  //             super(props);
  //             this.onChange = this.onChange.bind(this);
  //         }
  //         componentDidMount() {
  //             Events.on(`${prefix}-reloaded`, this.onChange);
  //             Events.on(`${prefix}-loaded`, this.onChange);
  //             Events.on(`${prefix}-unloaded`, this.onChange);
  //         }
  //         componentWillUnmount() {
  //             Events.off(`${prefix}-reloaded`, this.onChange);
  //             Events.off(`${prefix}-loaded`, this.onChange);
  //             Events.off(`${prefix}-unloaded`, this.onChange);
  //         }
  //         onChange() {
  //             settingsList.sideBarOnClick(type);
  //         }
  //         render() {return componentElement;}
  //     }
  //     return React.createElement(ContentList);
  // }
  // get pluginsComponent() {
  //     const plugins = Object.keys(Plugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
  //         arr.push(React.createElement(PluginCard, {key: key, plugin: Plugins[key].plugin}));return arr;
  //     }, []);
  //     const list = React.createElement(List, {key: "plugin-list", className: "bda-slist", children: plugins});
  //     const refreshIcon = !SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
  //         PluginManager.updatePluginList();
  //         this.sideBarOnClick("plugins");
  //     }});
  //     const pfBtn = React.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
  //     const contentColumn = React.createElement(ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
  //     return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, React.createElement(Tools, {key: "tools"})]});
  // }
  // get themesComponent() {
  //     const themes = Object.keys(Themes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
  //         arr.push(React.createElement(ThemeCard, {key: key, theme: Themes[key]}));return arr;
  //     }, []);
  //     const list = React.createElement(List, {key: "theme-list", className: "bda-slist", children: themes});
  //     const refreshIcon = !SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
  //         ThemeManager.updateThemeList();
  //         this.sideBarOnClick("themes");
  //     }});
  //     const tfBtn = React.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.themesFolder); }}, "Open Theme Folder");
  //     const contentColumn = React.createElement(ContentColumn, {key: "tcolumn", title: "Themes", children: [refreshIcon, tfBtn, list]});
  //     return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, React.createElement(Tools, {key: "tools"})]});
  // }


}

/***/ }),

/***/ "./src/ui/settings/switch.jsx":
/*!************************************!*\
  !*** ./src/ui/settings/switch.jsx ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Switch; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");

const flexContainer = "flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 switchItem-2hKKKK";
const flexWrap = "flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6";
const flexChild = "flexChild-faoVW3";
const title = "titleDefault-a8-ZSr title-31JmR4 da-titleDefault da-title";
const switchWrapper = "flexChild-faoVW3 da-flexChild switchEnabled-V2WDBB switch-3wwwcV da-switchEnabled da-switch valueUnchecked-2lU_20 value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX";
const switchWrapperChecked = "flexChild-faoVW3 da-flexChild switchEnabled-V2WDBB switch-3wwwcV da-switchEnabled da-switch valueChecked-m-4IJZ value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX";
const switchClass = "checkboxEnabled-CtinEn checkbox-2tyjJg";
const description = "description-3_Ncsb formText-3fs7AJ note-1V3kyJ modeDefault-3a2Ph1 primary-jw0I4K";
const divider = "divider-3573oO dividerDefault-3rvLe-";
class Switch extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.checked
    };
  }

  onChange() {
    this.props.onChange(this.props.id, !this.state.checked);
    this.setState({
      checked: !this.state.checked
    });
  }

  render() {
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: flexContainer,
      style: {
        flex: "1 1 auto"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: flexWrap,
      style: {
        flex: "1 1 auto"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: flexChild,
      style: {
        flex: "1 1 auto"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("label", {
      htmlFor: this.props.id,
      className: title
    }, this.props.name || this.props.data.text)), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: this.state.checked ? switchWrapperChecked : switchWrapper,
      tabIndex: "0",
      style: {
        flex: "0 0 auto"
      }
    }, modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("input", {
      id: this.props.id,
      className: switchClass,
      type: "checkbox",
      tabIndex: "-1",
      checked: this.state.checked,
      onChange: e => this.onChange(e)
    }))), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: description,
      style: {
        flex: "1 1 auto"
      }
    }, this.props.note || this.props.data.info), modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("div", {
      className: divider
    }));
  }

}

/***/ }),

/***/ "./src/ui/settings/title.jsx":
/*!***********************************!*\
  !*** ./src/ui/settings/title.jsx ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SettingsTitle; });
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");

const className = "bd-settings-title h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh2-2LTaUL marginBottom20-32qID7";
class SettingsTitle extends modules__WEBPACK_IMPORTED_MODULE_0__["React"].Component {
  constructor(props) {
    super(props);
  } //h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi da-h2 da-title da-size16 da-height20 da-weightSemiBold defaultColor-1_ajX0 da-defaultColor marginTop60-3PGbtK da-marginTop60 marginBottom20-32qID7 da-marginBottom20


  render() {
    const titleClass = this.props.className ? `${className} ${this.props.className}` : className;
    return modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("h2", {
      className: titleClass,
      onClick: () => {
        this.props.onClick && this.props.onClick();
      }
    }, this.props.text, this.props.button && modules__WEBPACK_IMPORTED_MODULE_0__["React"].createElement("button", {
      className: "bd-title-button",
      onClick: this.props.button.onClick
    }, this.props.button.title));
  }

}

/***/ }),

/***/ "./src/ui/toasts.js":
/*!**************************!*\
  !*** ./src/ui/toasts.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Toasts; });
/* harmony import */ var data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data */ "./src/data/data.js");
/* harmony import */ var modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules */ "./src/modules/modules.js");


const channelsClass = modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getByProps("channels").channels.split(" ")[0];
const membersWrapClass = modules__WEBPACK_IMPORTED_MODULE_1__["WebpackModules"].getByProps("membersWrap").membersWrap.split(" ")[0];
class Toasts {
  static get shouldShowToasts() {
    return data__WEBPACK_IMPORTED_MODULE_0__["SettingsCookie"]["fork-ps-2"];
  }
  /** Shorthand for `type = "success"` for {@link module:Toasts.show} */


  static async success(content, options = {}) {
    return this.show(content, Object.assign(options, {
      type: "success"
    }));
  }
  /** Shorthand for `type = "info"` for {@link module:Toasts.show} */


  static async info(content, options = {}) {
    return this.show(content, Object.assign(options, {
      type: "info"
    }));
  }
  /** Shorthand for `type = "warning"` for {@link module:Toasts.show} */


  static async warning(content, options = {}) {
    return this.show(content, Object.assign(options, {
      type: "warning"
    }));
  }
  /** Shorthand for `type = "error"` for {@link module:Toasts.show} */


  static async error(content, options = {}) {
    return this.show(content, Object.assign(options, {
      type: "error"
    }));
  }
  /** Shorthand for `type = "default"` for {@link module:Toasts.show} */


  static async default(content, options = {}) {
    return this.show(content, Object.assign(options, {
      type: ""
    }));
  }
  /**
   * This shows a toast similar to android towards the bottom of the screen.
   *
   * @param {string} content The string to show in the toast.
   * @param {object} options Options object. Optional parameter.
   * @param {string} [options.type=""] Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
   * @param {boolean} [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
   * @param {number} [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
   * @param {boolean} [options.forceShow=false] Whether to force showing the toast and ignore the bd setting
   */


  static show(content, options = {}) {
    const {
      type = "",
      icon = true,
      timeout = 3000,
      forceShow = false
    } = options;
    if (!this.shouldShowToasts && !forceShow) return;
    this.ensureContainer();
    const toastElem = document.createElement("div");
    toastElem.classList.add("bd-toast");
    if (type) toastElem.classList.add("toast-" + type);
    if (type && icon) toastElem.classList.add("icon");
    toastElem.innerText = content;
    document.querySelector(".bd-toasts").appendChild(toastElem);
    setTimeout(() => {
      toastElem.classList.add("closing");
      setTimeout(() => {
        toastElem.remove();
        if (!document.querySelectorAll(".bd-toasts .bd-toast").length) document.querySelector(".bd-toasts").remove();
      }, 300);
    }, timeout);
  }

  static ensureContainer() {
    if (document.querySelector(".bd-toasts")) return;
    const container = document.querySelector(`.${channelsClass} + div`);
    const memberlist = container.querySelector(`.${membersWrapClass}`);
    const form = container ? container.querySelector("form") : null;
    const left = container ? container.getBoundingClientRect().left : 310;
    const right = memberlist ? memberlist.getBoundingClientRect().left : 0;
    const width = right ? right - container.getBoundingClientRect().left : container.offsetWidth;
    const bottom = form ? form.offsetHeight : 80;
    const toastWrapper = document.createElement("div");
    toastWrapper.classList.add("bd-toasts");
    toastWrapper.style.setProperty("left", left + "px");
    toastWrapper.style.setProperty("width", width + "px");
    toastWrapper.style.setProperty("bottom", bottom + "px");
    document.querySelector("#app-mount").appendChild(toastWrapper);
  }

}

/***/ }),

/***/ "./src/ui/ui.js":
/*!**********************!*\
  !*** ./src/ui/ui.js ***!
  \**********************/
/*! exports provided: Toasts, Modals, SettingsPanel, PublicServers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _settings_settings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./settings/settings */ "./src/ui/settings/settings.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SettingsPanel", function() { return _settings_settings__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _publicservers_publicservers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./publicservers/publicservers */ "./src/ui/publicservers/publicservers.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "PublicServers", function() { return _publicservers_publicservers__WEBPACK_IMPORTED_MODULE_1__; });
/* harmony import */ var _toasts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./toasts */ "./src/ui/toasts.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Toasts", function() { return _toasts__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _modals__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modals */ "./src/ui/modals.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Modals", function() { return _modals__WEBPACK_IMPORTED_MODULE_3__["default"]; });







/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),

/***/ "electron":
/*!****************************************!*\
  !*** external "require(\"electron\")" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "events":
/*!**************************************!*\
  !*** external "require(\"events\")" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!**********************************!*\
  !*** external "require(\"fs\")" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "module":
/*!*************************!*\
  !*** external "module" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("module");

/***/ }),

/***/ "path":
/*!************************************!*\
  !*** external "require(\"path\")" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "request":
/*!***************************************!*\
  !*** external "require(\"request\")" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("request");

/***/ })

/******/ })["default"];