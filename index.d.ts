import { EventEmitter } from "events";
export interface PhantomEvents<ConfigT> extends EventEmitter {
    on(eventName: "before", listener: (options: ConfigT, path: string[], body: null | object, query: null | object | string) => void): this;
    on(eventName: "success", listener: (result: any) => void): this;
    on(eventName: "error", listener: (error: Error & {
        response: any;
    }) => void): this;
}
declare function PhantomEventEmitter<ConfigT>(options?: any): PhantomEvents<ConfigT>;
type NoData<ConfigT, RespT> = (config?: ConfigT) => Promise<RespT>;
type BodyRe<ConfigT, BodyT, RespT> = (body: BodyT, config?: ConfigT) => Promise<RespT>;
type BodyOp<ConfigT, BodyT, RespT> = (body?: BodyT, config?: ConfigT) => Promise<RespT>;
type QuerRe<ConfigT, QueryT, RespT> = (body: null, query: QueryT, config?: ConfigT) => Promise<RespT>;
type QuerOp<ConfigT, QueryT, RespT> = (body?: null, query?: QueryT, config?: ConfigT) => Promise<RespT>;
type CplxRe<ConfigT, BodyT, QueryT, RespT> = (body: BodyT, query: QueryT, config?: ConfigT) => Promise<RespT>;
type CplxOp<ConfigT, BodyT, QueryT, RespT> = (body: BodyT | null, query: QueryT | null, config?: ConfigT) => Promise<RespT>;
type CplxBR<ConfigT, BodyT, QueryT, RespT> = (body: BodyT | null, query: QueryT, config?: ConfigT) => Promise<RespT>;
type CplxQR<ConfigT, BodyT, QueryT, RespT> = (body: BodyT, query?: QueryT | null, config?: ConfigT) => Promise<RespT>;
declare function PhantomFetcherCustom(callback: any): any;
type VueRef = object & {
    value: any;
};
export interface DefaultConfig {
    loading?: VueRef | ((state: boolean) => void);
    before?: () => void;
    success?: (result: any) => void;
    error?: (error: Error & {
        preventDefault: () => void;
        response: any;
    }) => void;
    silent?: boolean;
    globalCatch?: boolean;
}
export type RootConfigurable<ConfigT, RootT> = (config?: ConfigT) => RootT;
type FetchProcedureT<ConfigT> = (options: ConfigT, path: string[], body: null | object, query: null | object | string) => Promise<any>;
declare function PhantomFetcher<ConfigT, RootT>(EventEmitter: EventEmitter | null, Callback: FetchProcedureT<ConfigT & DefaultConfig>): RootConfigurable<ConfigT & DefaultConfig, RootT>;
export interface EmptyArray extends Array<any> {
}
declare function AsyncParallelismControl(name: string, prevent: boolean, queue: EmptyArray, fn: () => any): any;
declare const simpleApiFetch: (method: string, path: string, body: object | null, query: object | string | null, headers: object | null, opts?: object) => Promise<Response>;
export { PhantomEventEmitter, PhantomFetcher, PhantomFetcherCustom, AsyncParallelismControl, simpleApiFetch, NoData, BodyRe, BodyOp, QuerRe, QuerOp, CplxRe, CplxOp, CplxBR, CplxQR, };
