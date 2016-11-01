(function() {

    "use strict";

    var electron = require("electron");
    var src_js_modules_modules, src_js_utils, src_js_api, src_js_event, src_js_core;
    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ('value' in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function (Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
    src_js_modules_modules = function () {
        var modules = {};
        return modules;
    }();
    src_js_utils = function () {
        var Utils = function Utils() {
            _classCallCheck(this, Utils);
        };
        return new Utils();
    }();
    src_js_api = function () {
        var Api = function Api() {
            _classCallCheck(this, Api);
        };
        return new Api();
    }();
    src_js_event = function () {
        var eventEmitter = new require('events').EventEmitter;
        var event = function () {
            function event() {
                _classCallCheck(this, event);
            }
            _createClass(event, [
                {
                    key: 'on',
                    value: function on(eventName, callback) {
                        eventEmitter.on(eventName, callback);
                    }
                },
                {
                    key: 'emit',
                    value: function emit() {
                        return 'Not allowed';
                    }
                }
            ]);
            return event;
        }();
        return new event();
    }();
    src_js_core = function (modules, utils, api, plugin, event) {
        var Core = function () {
            function Core(args) {
                _classCallCheck(this, Core);
                this.beta = true;
                this.alpha = true;
                this.plugin = plugin;
                this.event = event;
                this.eventEmitter = event.eventEmitter;
            }
            _createClass(Core, [
                {
                    key: 'init',
                    value: function init() {
                        console.log('Initialized');
                    }
                },
                {
                    key: '__version',
                    get: function get() {
                        return '2.0.0';
                    }
                },
                {
                    key: '__versionString',
                    get: function get() {
                        return '' + this.__version + (this.alpha ? 'A' : this.beta ? 'B' : '');
                    }
                }
            ]);
            return Core;
        }();
        window.$B = function (s) {
            return $('[data-bd=' + s);
        };
        var BD = new Core();
        BD.init();
    }(src_js_modules_modules, src_js_utils, src_js_api, src_js_event);

}());