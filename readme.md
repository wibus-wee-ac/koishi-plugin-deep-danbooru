# koishi-plugin-deep-danbooru

[![npm](https://img.shields.io/npm/v/koishi-plugin-deep-danbooru?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-deep-danbooru)

基于 [DeepDanbooru](https://github.com/KichangKim/DeepDanbooru) 的图像分析插件。目前实现功能如下：

- 上传图片，使用 huggingface 训练的模型获取推理结果。

得益于 Koishi 的插件化机制，只需配合其他插件即可实现更多功能：

- 多平台支持 (QQ、Discord、Telegram、开黑啦等)
- 与 [NovelAI](https://github.com/koishijs/novelai-bot) 组合使用，可以获得更好体验

## What's Deep Danbooru?

DeepDanbooru 是一个基于 TensorFlow 实现的深度卷积神经网络项目，实现画像分类。

## Reference

1. [DeepDanbooru](https://github.com/KichangKim/DeepDanbooru)
2. [koishijs/novelai-bot](https://github.com/koishijs/novelai-bot)

Request API based on https://huggingface.co/spaces/hysts/DeepDanbooru

## Author

koishi-plugin-deep-danbooru © Wibus, Released under AGPLv3. Created on Oct 15, 2022

> [Personal Website](http://iucky.cn/) · [Blog](https://blog.iucky.cn/) · GitHub [@wibus-wee](https://github.com/wibus-wee/) · Telegram [@wibus✪](https://t.me/wibus_wee)
