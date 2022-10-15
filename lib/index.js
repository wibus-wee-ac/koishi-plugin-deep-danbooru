"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.Config = exports.name = void 0;
const koishi_1 = require("koishi");
const utils_1 = require("./utils");
exports.name = 'deep-danbooru';
const logger = new koishi_1.Logger(exports.name);
exports.Config = koishi_1.Schema.object({});
function errorHandler(session, err) {
    if (koishi_1.Quester.isAxiosError(err)) {
        logger.error(err);
        if (err.response?.status === 402) {
            return session.text('unauthorized');
        }
        else if (err.response?.status) {
            return session.text(`请求出现错误 (HTTP ${err.response.status})`);
        }
        else if (err.code === 'ETIMEDOUT') {
            return session.text('请求超时了');
        }
        else if (err.code) {
            return session.text('请求失败了 (错误代码: ' + err.code + ')');
        }
    }
    logger.error(err);
    return session.text('发生了未知的错误');
}
function apply(ctx) {
    ctx
        .command('法术鉴赏 <image:text>')
        .action(async ({ session }, input) => {
        if (!input?.trim())
            return session.execute('help 法术鉴赏');
        let imgUrl;
        input = koishi_1.segment.transform(input, {
            image(attrs) {
                imgUrl = attrs.url;
                return '';
            },
        });
        if (!imgUrl) {
            return session.text('没有检测到图片，请检查格式并给出图片。');
        }
        let imageBuff;
        try {
            imageBuff = Buffer.from(await (0, utils_1.download)(ctx, imgUrl));
        }
        catch (err) {
            if (err instanceof utils_1.NetworkError) {
                return session.text(err.message, err.params);
            }
            logger.error(err);
            return session.text("哎呀，图片加载失败了 › (╯°口°)╯");
        }
        const body = {
            "action": "predict",
            "fn_index": 0,
            "data": [`data:image/png;base64,${String(imageBuff.toString('base64'))}`, 0.5],
            "session_hash": (0, utils_1.generate_code)(11),
        };
        const art = await ctx.http.axios('https://hf.space/embed/hysts/DeepDanbooru/api/queue/push/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...utils_1.headers,
            },
            responseType: 'json',
            data: JSON.stringify(body)
        }).then(res => {
            return {
                hash: res.data.hash,
            };
        });
        session.send("正在尝试魔法鉴别(´・ω・`)");
        const getStatus = async (hash) => {
            return await ctx.http.axios('https://hf.space/embed/hysts/DeepDanbooru/api/queue/status/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...utils_1.headers,
                },
                responseType: 'json',
                data: JSON.stringify({
                    'hash': hash
                })
            }).then(res => {
                let data = res.data;
                if (res.data.status === 'PENDING') {
                    data = getStatus(hash);
                }
                return data;
            }).catch(err => {
                return errorHandler(session, err);
            });
        };
        const result = await getStatus(art.hash);
        // 获取这条信息的 id，回复
        const reply = `tags: ${result.data.data[0].confidences.map((tag) => { return tag.label; })}`;
        await session.send((0, koishi_1.segment)('quote', { id: session.messageId }) + reply);
    });
}
exports.apply = apply;
