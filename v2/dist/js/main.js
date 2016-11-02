(function() {

    "use strict";

    var electron = require("electron");
    var src_js_modules_observermodule, src_js_modules_modules, src_js_utils, src_js_api, src_js_plugin, src_js_event, src_js_core;
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
    src_js_modules_observermodule = function () {
        var Observer = function () {
            function Observer() {
                _classCallCheck(this, Observer);
                this.mutationObserver = new MutationObserver(this.observe);
                this.mutationObserver.observe(document, {
                    childList: true,
                    subtree: true
                });
            }
            _createClass(Observer, [{
                    key: 'observe',
                    value: function observe(mutations) {
                        mutations.forEach(function (mutation) {
                            BD.event.emit('raw-mutation', mutation);
                        });
                    }
                }]);
            return Observer;
        }();
        return new Observer();
    }();
    src_js_modules_modules = function (observerModule) {
        var modules = { observerModule: observerModule };
        return modules;
    }(src_js_modules_observermodule);
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
    src_js_plugin = function () {
        var Plugin = function () {
            function Plugin(args) {
                _classCallCheck(this, Plugin);
                this.info = args;
            }
            _createClass(Plugin, [
                {
                    key: 'author',
                    get: function get() {
                        return this.info.author;
                    }
                },
                {
                    key: 'name',
                    get: function get() {
                        return this.info.name;
                    }
                },
                {
                    key: 'version',
                    get: function get() {
                        return this.info.version;
                    }
                }
            ]);
            return Plugin;
        }();
        return Plugin;
    }();
    src_js_event = function () {
        var EventEmitter = events.EventEmitter;
        var Event = function () {
            function Event() {
                _classCallCheck(this, Event);
                this.eventEmitter = new EventEmitter();
            }
            _createClass(Event, [
                {
                    key: 'on',
                    value: function on(eventName, callback) {
                        this.eventEmitter.on(eventName, callback);
                    }
                },
                {
                    key: 'emit',
                    value: function emit() {
                        var _eventEmitter;
                        (_eventEmitter = this.eventEmitter).emit.apply(_eventEmitter, arguments);
                    }
                }
            ]);
            return Event;
        }();
        return new Event();
    }();
    src_js_core = function (modules, utils, api, plugin, event) {
        var Core = function () {
            function Core(args) {
                _classCallCheck(this, Core);
                console.log(event);
                this.event = event;
                this.modules = modules;
                this.beta = true;
                this.alpha = true;
                this.plugin = plugin;
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
        window.BD = new Core();
        BD.init();
    }(src_js_modules_modules, src_js_utils, src_js_api, src_js_plugin, src_js_event);

}());