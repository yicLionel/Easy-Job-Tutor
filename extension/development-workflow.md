# 开发热更新工作流

## 首次配置

1. 在扩展目录运行 `npm run dev`，并保持终端开启。
2. 在 `chrome://extensions` 开启开发者模式，选择“加载已解压的扩展程序”。
3. 选择本目录的 `dist/`。

## 日常开发

- 修改 `src/sidepanel/` 中的界面或样式后，打开的侧边栏会自动更新，无需关闭再打开。
- 修改 `src/content.js` 或 `src/background.js` 后，CRXJS 会重新加载相应扩展运行时；刷新招聘网页以让新的内容脚本进入该页面。
- 只有更改端口、`public/manifest.json`，或停止后重新启动 `npm run dev` 时，才需在 `chrome://extensions` 点击一次“重新加载”。

## 发布验证

```bash
npm run build
npm run verify:dist
npm test
```

发布或手动测试时，加载生产构建后的 `dist/`；不要把开发服务器当作发布产物。
