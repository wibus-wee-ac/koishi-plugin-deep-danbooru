import { Context, Dict } from 'koishi';
export declare function download(ctx: Context, url: string, headers?: {}): Promise<ArrayBuffer>;
export declare function calcAccessKey(email: string, password: string): Promise<string>;
export declare function calcEncryptionKey(email: string, password: string): Promise<string>;
export declare const headers: {
    'content-type': string;
    'user-agent': string;
};
export declare class NetworkError extends Error {
    params: {};
    constructor(message: string, params?: {});
    static catch: (mapping: Dict<string>) => (e: any) => never;
}
export declare function closestMultiple(num: number, mult: number): number;
export interface Size {
    width: number;
    height: number;
}
export declare function resizeInput(size: Size): Size;
export declare function generate_code(code_len?: number): string;
