"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleApiFetch = exports.AsyncParallelismControl = exports.PhantomFetcherCustom = exports.PhantomFetcher = exports.PhantomEventEmitter = void 0;
//@ts-nocheck
var events_1 = require("events");
function PhantomEventEmitter(options) {
    return new events_1.EventEmitter(options);
}

exports.PhantomEventEmitter = PhantomEventEmitter;
function CallableProxy(handler) {
    return this.proxy = new Proxy((typeof handler.target === 'function' ? handler.target.bind(this) : handler.target), handler);
}
function PhantomFetcherCustom(callback) {
    var NewPathProxy = function (RequestObject) { return new CallableProxy({
        target: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var body = null, query = null, options_override = {};
            if (args.length === 1)
                body = args[0];
            else if (args.length === 2)
                body = args[0], query = args[1];
            else if (args.length === 3)
                body = args[0], query = args[1], options_override = args[2];
            RequestObject.options = __assign(__assign({}, options_override), RequestObject.options);
            if (Array.isArray(body) && body.length && body.raw) {
                RequestObject.options.method = body[0];
                return NewPathProxy(RequestObject);
            }
            else {
                return callback(RequestObject.options, RequestObject.path, body, query);
            }
        },
        set: function (target, prop, value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, target(value, {}, true)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        get: function (target, prop) {
            var RequestObjectClone = { options: RequestObject.options, path: __spreadArray([], RequestObject.path, true) };
            RequestObjectClone.path.push(prop);
            return NewPathProxy(RequestObjectClone);
        }
    }); };
    return new CallableProxy({
        target: function (options) {
            if (options === void 0) { options = {}; }
            return NewPathProxy({ options: __assign({}, options), path: [] });
        },
        get: function (target, prop) {
            return NewPathProxy({ options: {}, path: [prop] });
        }
    });
}
exports.PhantomFetcherCustom = PhantomFetcherCustom;
function PhantomFetcher(EventEmitter, Callback) {
    var _this = this;
    return PhantomFetcherCustom(function (options, path, body, query) { return __awaiter(_this, void 0, void 0, function () {
        var loading, before, success, error, silent, globalCatch, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loading = options.loading, before = options.before, success = options.success, error = options.error, silent = options.silent, globalCatch = options.globalCatch;
                    result = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    if (loading && loading.__v_isRef)
                        loading.value = true;
                    else if (typeof loading === 'function')
                        loading(true);
                    // await timeout(3000);
                    EventEmitter && EventEmitter.emit('before', options, path, body, query);
                    before && before();
                    return [4 /*yield*/, Callback(options, path, body, query)];
                case 2:
                    result = _a.sent();
                    success && success(result);
                    EventEmitter && EventEmitter.emit('success', result);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    err_1.isPreventedDefault = false;
                    err_1.preventDefault = function () { return err_1.isPreventedDefault = true; };
                    // this need to run after catch
                    setTimeout(function () {
                        !err_1.isPreventedDefault && globalCatch != false && EventEmitter && EventEmitter.emit('error', err_1);
                    }, 1);
                    error && error(err_1);
                    if (!silent)
                        throw err_1;
                    return [3 /*break*/, 5];
                case 4:
                    if (loading && loading.__v_isRef)
                        loading.value = false;
                    else if (typeof loading === 'function')
                        loading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/, silent ? undefined : result];
            }
        });
    }); });
}
exports.PhantomFetcher = PhantomFetcher;
function AsyncParallelismControl(name, prevent, queue, fn) {
    var _this = this;
    if (queue.length == 0) {
        queue.push(new events_1.EventEmitter());
    }
    var events = queue[0];
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    events.once(name, function (error, result) {
                        if (error)
                            reject(error);
                        else
                            resolve(result);
                    });
                    if (prevent && events.eventNames().includes(name)) {
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    _b = (_a = events).emit;
                    _c = [name, null];
                    return [4 /*yield*/, fn()];
                case 2:
                    _b.apply(_a, _c.concat([_d.sent()]));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _d.sent();
                    events.emit(name, error_1, null);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
}
exports.AsyncParallelismControl = AsyncParallelismControl;
var simpleApiFetch = function (method, path, body, query, headers, opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var options;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = {
                        method: method,
                        headers: __assign({}, headers)
                    };
                    if (body) {
                        options.headers['Content-Type'] = 'application/json';
                        options.body = JSON.stringify(body);
                    }
                    if (query) {
                        if (typeof query === 'string') {
                            path = "".concat(path, "?").concat(query);
                        }
                        else if (typeof query === 'object') {
                            path = "".concat(path, "?").concat(new URLSearchParams(query).toString());
                        }
                    }
                    return [4 /*yield*/, fetch(path, options)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.simpleApiFetch = simpleApiFetch;
