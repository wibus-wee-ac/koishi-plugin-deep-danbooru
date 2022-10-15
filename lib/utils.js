"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_code = exports.resizeInput = exports.closestMultiple = exports.NetworkError = exports.headers = exports.calcEncryptionKey = exports.calcAccessKey = exports.download = void 0;
/*
 * @FilePath: /deep-danbooru/src/utils.ts
 * @author: Wibus
 * @Date: 2022-10-15 18:29:51
 * @LastEditors: Wibus
 * @LastEditTime: 2022-10-15 18:29:51
 * Coding With IU
 */
const koishi_1 = require("koishi");
const libsodium_wrappers_1 = require("libsodium-wrappers");
const MAX_OUTPUT_SIZE = 1048576;
const MAX_CONTENT_SIZE = 10485760;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
async function download(ctx, url, headers = {}) {
    if (url.startsWith('data:')) {
        const [, type, base64] = url.match(/^data:(image\/\w+);base64,(.*)$/);
        if (!ALLOWED_TYPES.includes(type)) {
            throw new NetworkError('.unsupported-file-type');
        }
        const binary = atob(base64);
        const result = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            result[i] = binary.charCodeAt(i);
        }
        return result;
    }
    else {
        const head = await ctx.http.head(url, { headers });
        if (+head['content-length'] > MAX_CONTENT_SIZE) {
            throw new NetworkError('.file-too-large');
        }
        if (!ALLOWED_TYPES.includes(head['content-type'])) {
            throw new NetworkError('.unsupported-file-type');
        }
        return ctx.http.get(url, { responseType: 'arraybuffer', headers });
    }
}
exports.download = download;
async function calcAccessKey(email, password) {
    await libsodium_wrappers_1.ready;
    return (0, libsodium_wrappers_1.crypto_pwhash)(64, new Uint8Array(Buffer.from(password)), (0, libsodium_wrappers_1.crypto_generichash)(libsodium_wrappers_1.crypto_pwhash_SALTBYTES, password.slice(0, 6) + email + 'novelai_data_access_key'), 2, 2e6, libsodium_wrappers_1.crypto_pwhash_ALG_ARGON2ID13, 'base64').slice(0, 64);
}
exports.calcAccessKey = calcAccessKey;
async function calcEncryptionKey(email, password) {
    await libsodium_wrappers_1.ready;
    return (0, libsodium_wrappers_1.crypto_pwhash)(128, new Uint8Array(Buffer.from(password)), (0, libsodium_wrappers_1.crypto_generichash)(libsodium_wrappers_1.crypto_pwhash_SALTBYTES, password.slice(0, 6) + email + 'novelai_data_encryption_key'), 2, 2e6, libsodium_wrappers_1.crypto_pwhash_ALG_ARGON2ID13, 'base64');
}
exports.calcEncryptionKey = calcEncryptionKey;
exports.headers = {
    'content-type': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
};
class NetworkError extends Error {
    constructor(message, params = {}) {
        super(message);
        this.params = params;
    }
}
exports.NetworkError = NetworkError;
NetworkError.catch = (mapping) => (e) => {
    if (koishi_1.Quester.isAxiosError(e)) {
        const code = e.response?.status;
        for (const key in mapping) {
            if (code === +key) {
                throw new NetworkError(mapping[key]);
            }
        }
    }
    throw e;
};
function closestMultiple(num, mult) {
    const numInt = num;
    const floor = Math.floor(numInt / mult) * mult;
    const ceil = Math.ceil(numInt / mult) * mult;
    const closest = numInt - floor < ceil - numInt ? floor : ceil;
    if (Number.isNaN(closest))
        return 0;
    return closest <= 0 ? mult : closest;
}
exports.closestMultiple = closestMultiple;
function resizeInput(size) {
    // if width and height produce a valid size, use it
    const { width, height } = size;
    if (width % 64 === 0 && height % 64 === 0 && width * height <= MAX_OUTPUT_SIZE) {
        return { width, height };
    }
    // otherwise, set lower size as 512 and use aspect ratio to the other dimension
    const aspectRatio = width / height;
    if (aspectRatio > 1) {
        const height = 512;
        const width = closestMultiple(height * aspectRatio, 64);
        // check that image is not too large
        if (width * height <= MAX_OUTPUT_SIZE) {
            return { width, height };
        }
    }
    else {
        const width = 512;
        const height = closestMultiple(width / aspectRatio, 64);
        // check that image is not too large
        if (width * height <= MAX_OUTPUT_SIZE) {
            return { width, height };
        }
    }
    // if that fails set the higher size as 1024 and use aspect ratio to the other dimension
    if (aspectRatio > 1) {
        const width = 1024;
        const height = closestMultiple(width / aspectRatio, 64);
        return { width, height };
    }
    else {
        const height = 1024;
        const width = closestMultiple(height * aspectRatio, 64);
        return { width, height };
    }
}
exports.resizeInput = resizeInput;
function generate_code(code_len = 6) {
    let all_char = '0123456789qazwsxedcrfvtgbyhnujmikolp';
    let index = all_char.length - 1;
    let code = '';
    for (let i = 0; i < code_len; i++) {
        let num = Math.floor(Math.random() * (index + 1));
        code += all_char[num];
    }
    return code;
}
exports.generate_code = generate_code;
