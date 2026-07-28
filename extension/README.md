# Easy-Job-Tutor Chrome 插件 MVP

这是 Easy-Job-Tutor 的 Chrome Manifest V3 本机侧载实现，使用 Chrome 116+ 的 Side Panel API。

## 本机运行

```bash
npm install
npm test
npm run build
npm run verify:dist
```

然后在 Chrome 中打开 `chrome://extensions`，开启开发者模式，点击“加载已解压的扩展程序”，选择当前目录下的 `dist/`（从仓库根目录操作时是 `extension/dist/`）。

## 开发时自动刷新

首次仍需在 Chrome 中加载一次 `dist/`。之后执行：

```bash
npm run dev
```

侧边栏与样式修改会通过 HMR 自动刷新，已打开的侧边栏无需关闭或重新打开；内容脚本和后台脚本修改会由开发服务器自动重载。开发服务器使用固定的 `127.0.0.1:5173`，运行期间请保持该终端开启。只有变更端口、`manifest.json` 或重新启动开发服务器时，才需要在 `chrome://extensions` 手动点击一次“重新加载”。

插件图标会打开侧边栏。当前版本支持猎聘、BOSS 直聘、文本型 PDF、DOCX、本地设置、快速评分、深度润色和完整投递报告；扫描版 PDF、云端账户、OCR、PDF 导出和 Chrome Web Store 发布暂不在范围内。

模型设置可分别填写快速诊断模型与深度润色模型。快速阶段只返回证据映射、五维评分、追问和风险；用户完成必要追问后，再按需生成改写候选、ATS 纯文本、HR 摘要、Boss/猎头话术和面试问题。

## 目录职责

- `src/sidepanel/`：侧边栏 UI 与流程交互。
- `src/adapters/`：招聘网站适配器与通用正文提取。
- `src/parsers/`：本地 PDF/DOCX 解析。
- `src/core/`：事实状态、评分、Schema、模型客户端和改写闸门。
- `src/storage/`：Chrome 本地存储适配。
- `src/background.js`：Manifest V3 Service Worker。
- `src/content.js`：职位页面内容脚本。
- `tests/`：不依赖 Chrome 的领域模块测试。

## 数据边界

原始简历文件只在浏览器本地解析，确认后的文本才会按用户配置发送给模型服务。API Key 保存在 Chrome 本地存储中，不进入项目服务器、日志或诊断历史。

## 当前验证

2026-07-28：47 项测试覆盖 3 份脱敏简历 × 3 类 JD 的 9 组验收矩阵、真实性闸门、两阶段时序、报告结构、解析、旧会话迁移和 UI 逻辑；`npm run build` 与 `npm run verify:dist` 成功生成并校验 Manifest V3 侧载包。真实模型耗时由侧边栏分别记录为“快速诊断”和“深度润色”，实际速度取决于用户配置的模型与服务商，代码不承诺固定 5 秒完成。
