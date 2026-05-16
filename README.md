# evditor

基于 **Electron**、**Vue 3** 与 **Vditor** 的 Markdown 编辑器，即时渲染（IR）为主，带侧栏文件树与可调整宽度。

## 环境要求

- **Node.js** 18+（建议 LTS）
- **npm** 9+

Windows 下打包使用 **x64** 便携版（见下方输出路径）。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 开发模式（Vite + Electron） |
| `npm run typecheck` | 仅 TypeScript 检查 |
| `npm run build` | 类型检查 → Vite 构建 → `electron-builder` 打包 |

## 打包产物

成功执行 `npm run build` 后，Windows 便携可执行文件位于：

`release/evditor-<version>-win-x64.exe`

（具体文件名以 `package.json` 中的 `version` 为准。）

若在 CI 或本机遇到代码签名相关干扰，可在打包前设置：

`CSC_IDENTITY_AUTO_DISCOVERY=false`

（本项目 `package.json` 的 `build.win` 中已关闭签名相关步骤，一般无需额外设置。）

## 技术栈摘要

- **Electron** 22.x（主进程构建为 CommonJS，与 `package.json` 的 `"type": "module"` 共存）
- **Vue 3** + **Vite** 5
- **Vditor** 3.x（Markdown 编辑与预览）

## 许可证

私有项目（`package.json` 中 `"private": true`）。如需开源请自行补充许可证文件。
