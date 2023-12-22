"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleApiFetch = exports.AsyncParallelismControl = exports.PhantomFetcherCustom = exports.PhantomFetcher = exports.PhantomEventEmitter = void 0;
//@ts-nocheck
const events_1 = require("events");
function PhantomEventEmitter(options) {
    return new events_1.EventEmitter(options);
}
exports.PhantomEventEmitter = PhantomEventEmitter;
function CallableProxy(handler) {
    return this.proxy = new Proxy((typeof handler.target === 'function' ? handler.target.bind(this) : handler.target), handler);
}
function PhantomFetcherCustom(callback) {
    const NewPathProxy = (RequestObject) => new CallableProxy({
        target(...args) {
            let body = null, query = null, options_override = {};
            if (args.length === 1)
                [body] = args;
            else if (args.length === 2)
                [body, query] = args;
            else if (args.length === 3)
                [body, query, options_override] = args;
            RequestObject.options = Object.assign(Object.assign({}, options_override), RequestObject.options);
            if (Array.isArray(body) && body.length && body.raw) {
                RequestObject.options.method = body[0];
                return NewPathProxy(RequestObject);
            }
            else {
                return callback(RequestObject.options, RequestObject.path, body, query);
            }
        },
        set(target, prop, value) {
            return __awaiter(this, void 0, void 0, function* () {
                yield target(value, {}, true);
            });
        },
        get(target, prop) {
            const RequestObjectClone = { options: RequestObject.options, path: [...RequestObject.path] };
            RequestObjectClone.path.push(prop);
            return NewPathProxy(RequestObjectClone);
        }
    });
    return new CallableProxy({
        target(options = {}) {
            return NewPathProxy({ options: Object.assign({}, options), path: [] });
        },
        get(target, prop) {
            return NewPathProxy({ options: {}, path: [prop] });
        }
    });
}
exports.PhantomFetcherCustom = PhantomFetcherCustom;
function PhantomFetcher(EventEmitter, Callback) {
    return PhantomFetcherCustom((options, path, body, query) => __awaiter(this, void 0, void 0, function* () {
        let { loading, before, success, error, silent, globalCatch } = options;
        let result = null;
        try {
            if (loading && loading.__v_isRef)
                loading.value = true;
            else if (typeof loading === 'function')
                loading(true);
            // await timeout(3000);
            EventEmitter && EventEmitter.emit('before', options, path, body, query);
            before && before();
            result = yield Callback(options, path, body, query);
            success && success(result);
            EventEmitter && EventEmitter.emit('success', result);
        }
        catch (err) {
            err.isPreventedDefault = false;
            err.preventDefault = () => err.isPreventedDefault = true;
            // this need to run after catch
            setTimeout(() => {
                !err.isPreventedDefault && globalCatch != false && EventEmitter && EventEmitter.emit('error', err);
            }, 1);
            error && error(err);
            if (!silent)
                throw err;
        }
        finally {
            if (loading && loading.__v_isRef)
                loading.value = false;
            else if (typeof loading === 'function')
                loading(false);
        }
        return silent ? undefined : result;
    }));
}
exports.PhantomFetcher = PhantomFetcher;
function AsyncParallelismControl(name, prevent, queue, fn) {
    if (queue.length == 0) {
        queue.push(new events_1.EventEmitter());
    }
    const events = queue[0];
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const event_name = prevent ? name : name + Math.random();
        const is_first = !events.eventNames().includes(event_name);
        events.once(event_name, function (error, result) {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        if (prevent && !is_first) {
            return;
        }
        try {
            events.emit(event_name, null, yield fn());
        }
        catch (error) {
            events.emit(event_name, error, null);
        }
    }));
}
exports.AsyncParallelismControl = AsyncParallelismControl;
const simpleApiFetch = function (method, path, body, query, headers, opts = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = Object.assign({ method, headers: Object.assign({}, headers) }, opts.fetch_options || {});
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        if (query) {
            if (typeof query === 'string') {
                path = `${path}?${query}`;
            }
            else if (typeof query === 'object') {
                path = `${path}?${new URLSearchParams(query).toString()}`;
            }
        }
        return yield fetch(path, options);
    });
};
exports.simpleApiFetch = simpleApiFetch;
