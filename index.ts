//@ts-nocheck
import {EventEmitter} from "events";

export interface PhantomEvents<ConfigT> extends EventEmitter {
    on(eventName: "before",  listener: (options: ConfigT, path: string[], body: null | object, query: null | object | string) => void): this;
    on(eventName: "success", listener: (result: any) => void): this;
    on(eventName: "error",   listener: (error: Error & {response: any}) => void): this;
}

function PhantomEventEmitter<ConfigT>(options?: any): PhantomEvents<ConfigT> {
    return new EventEmitter(options);
}

function CallableProxy(handler) {
    return this.proxy = new Proxy((typeof handler.target === 'function' ? handler.target.bind(this) : handler.target), handler);
}

// (method: TemplateStringsArray): Runnable<BodyT, RespT>

type NoData /*NoData*/              <ConfigT, RespT>                = (                                            config?: ConfigT) => Promise<RespT>;

type BodyRe /*BodyRequired*/        <ConfigT, BodyT, RespT>         = (body:  BodyT,                               config?: ConfigT) => Promise<RespT>;
type BodyOp /*BodyOptional*/        <ConfigT, BodyT, RespT>         = (body?: BodyT,                               config?: ConfigT) => Promise<RespT>;

type QuerRe /*QueryRequired*/       <ConfigT, QueryT, RespT>        = (body:  null,         query:  QueryT,        config?: ConfigT) => Promise<RespT>;
type QuerOp /*QueryOptional*/       <ConfigT, QueryT, RespT>        = (body?: null,         query?: QueryT,        config?: ConfigT) => Promise<RespT>;

type CplxRe /*ComplexRequired*/     <ConfigT, BodyT, QueryT, RespT> = (body:  BodyT,        query:  QueryT,        config?: ConfigT) => Promise<RespT>;
type CplxOp /*ComplexOptional*/     <ConfigT, BodyT, QueryT, RespT> = (body:  BodyT | null, query:  QueryT | null, config?: ConfigT) => Promise<RespT>;
type CplxBR /*ComplexQueryRequired*/<ConfigT, BodyT, QueryT, RespT> = (body:  BodyT | null, query:  QueryT,        config?: ConfigT) => Promise<RespT>;
type CplxQR /*ComplexBodyRequired*/ <ConfigT, BodyT, QueryT, RespT> = (body:  BodyT,        query?: QueryT | null, config?: ConfigT) => Promise<RespT>;


function PhantomFetcherCustom(callback) {

    const NewPathProxy = (RequestObject) => new CallableProxy({
        target(...args) {
            let body = null, query = null, options_override = {};

            if      (args.length === 1) [body                         ] = args;
            else if (args.length === 2) [body, query                  ] = args;
            else if (args.length === 3) [body, query, options_override] = args;

            RequestObject.options = {...options_override, ...RequestObject.options};

            if (Array.isArray(body) && body.length && body.raw) {
                RequestObject.options.method = body[0];
                return NewPathProxy(RequestObject);
            } else {
                return callback(RequestObject.options, RequestObject.path, body, query);
            }
        },
        async set(target, prop, value) {
            await target(value, {}, true);
        },
        get(target, prop) {
            const RequestObjectClone = {options: RequestObject.options, path: [...RequestObject.path]};
            RequestObjectClone.path.push(prop);
            return NewPathProxy(RequestObjectClone);
        }
    });

    return new CallableProxy({
        target(options = {}) {
            return NewPathProxy({options: {...options}, path: []});
        },
        get(target, prop) {
            return NewPathProxy({options: {}, path: [prop]});
        }
    });

}

type VueRef = object & {value: any;}

export interface DefaultConfig {
    loading?:     VueRef | ((state: boolean) => void)
    before?:      () => void
    success?:     (result: any) => void
    error?:       (error: Error & {preventDefault: () => void, response: any}) => void
    silent?:      boolean
    globalCatch?: boolean
}

/*export interface RootConfigurable<ConfigT, RootT> extends RootT {
    (config?: ConfigT): RootT
}*/

/*export type RootConfigurable<ConfigT, RootT> = RootT & {
    (config?: ConfigT): RootT
}*/

export type RootConfigurable<ConfigT, RootT> = (config?: ConfigT) => RootT;

type FetchProcedureT<ConfigT> = (
    options: ConfigT,
    path:    string[],
    body:    null | object,
    query:   null | object | string
) => Promise<any>;

function PhantomFetcher<ConfigT, RootT>(EventEmitter: EventEmitter | null, Callback: FetchProcedureT<ConfigT & DefaultConfig>): RootConfigurable<ConfigT & DefaultConfig, RootT> {
    return PhantomFetcherCustom(async (options, path, body, query) => {
        let {loading, before, success, error, silent, globalCatch} = options;
        let result = null;

        try {
            if      (loading && loading.__v_isRef)  loading.value = true;
            else if (typeof loading === 'function') loading(true);

            // await timeout(3000);
            EventEmitter && EventEmitter.emit('before', options, path, body, query);
            before && before();
            result = await Callback(options, path, body, query);
            success && success(result);
            EventEmitter && EventEmitter.emit('success', result);

        } catch (err) {
            err.isPreventedDefault = false;
            err.preventDefault = () => err.isPreventedDefault = true;

            // this need to run after catch
            setTimeout(() => {
                !err.isPreventedDefault && globalCatch != false && EventEmitter && EventEmitter.emit('error', err);
            }, 1);

            error && error(err);
            if (!silent) throw err;

        } finally {
            if      (loading && loading.__v_isRef)  loading.value = false;
            else if (typeof loading === 'function') loading(false);
        }

        return silent? undefined : result;
    });
}

export interface EmptyArray extends Array<any> {}

function AsyncParallelismControl(name: string, prevent: boolean, queue: EmptyArray, fn: () => any) {
    if (queue.length == 0) {
        queue.push(new EventEmitter());
    }

    const events = queue[0];

    return new Promise(async (resolve, reject) => {
        const is_first = !events.eventNames().includes(name);

        events.once(name, function(error, result) {
            if (error) reject(error);
            else       resolve(result);
        });

        if (prevent && !is_first) {
            return;
        }

        try {
            events.emit(name, null, await fn());
        } catch (error) {
            events.emit(name, error, null);
        }
    });
}

const simpleApiFetch = async function(
    method:  string,
    path:    string,
    body:    object | null,
    query:   object | string | null,
    headers: object | null,
    opts:    object = {}
) {
    const options: any = {
        method,
        headers: {...headers},
        ...opts.fetch_options || {}
    }

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

    return await fetch(path, options);
}

export {
    PhantomEventEmitter,
    PhantomFetcher,
    PhantomFetcherCustom,
    AsyncParallelismControl,
    simpleApiFetch,

    NoData,
    BodyRe,
    BodyOp,
    QuerRe,
    QuerOp,
    CplxRe,
    CplxOp,
    CplxBR,
    CplxQR,
};