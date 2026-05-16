# evditor

**evditor** 是一款面向桌面的 Markdown 编辑器：渲染层使用 **Vditor**，壳层使用 **Electron 22**，界面使用 **Vue 3** + **Vite**。默认以 **即时渲染（IR）** 为主，工具栏可切换模式；**大纲**固定在编辑区右侧（与 Vditor 自带大纲一致）。

---

## 为什么要做它：替掉 Typora，而不是「再装一个玩具」

很多人把 **Typora** 当成 Markdown 笔记的「默认答案」：界面干净、即时渲染顺滑、导出顺手——这些优点不假，Typora 也确实把「像写文档一样写 Markdown」这件事做到了行业标杆。问题在于：**标杆开始收门票，还把老观众拦在门外**。

- **收费**：Typora 结束长期免费测试后转向商业授权，对高频使用者、多台设备、公司/学生预算来说，是一笔持续的心理账：明明写的是纯文本，却要为「壳」反复买单；更烦的是那种「用惯了再涨价」的落差感——工具越顺手，锁链越显眼。  
- **系统门槛**：新版本普遍跟着新系统、新运行时走；如果你还守着 **Windows 7**（或同类老旧环境），往往会发现：要么装不上，要么官方不再承诺支持，要么每次升级都在赌兼容性。对「只想稳定写笔记」的人来说，这等于被迫换电脑、换系统、换一整套习惯。

**Typora 不是坏产品，只是不再匹配「免费 + 老 Win + 自己说了算」这条需求。** 它走它的精品商业路线，无可厚非；但你的键盘和硬盘不必跟着它的路线图跳舞。

**evditor** 就是冲着这条缝隙来的：  

- **钱**：代码在你手里，构建在你机器上，没有按席位、按年订阅的「Markdown 税」。想改交互、换图标、砍掉某个菜单， fork 一下比给客服写信快。  
- **系统**：本项目刻意选用较老一代 **Electron** 线路，并打出 **Windows x64 便携包**，目标之一就是在「新软件纷纷抛弃 Win7」的时代，仍给旧机器一条能写、能存、能打开目录的退路——**老系统不是原罪，不该被编辑器的版本号判刑。**  
- **体验**：IR 模式、右侧大纲、侧栏文件树、**Ctrl+S / Ctrl+O**、关闭/新建/保存一条龙——不求像素级复刻 Typora，但求你肌肉记忆迁移过来时，不会觉得自己从跑车换成了独轮车。  
- **透明度**：没有黑盒同步、没有「先登录再写字」的套路；打开的是本地文件，走的是显式 IPC，连 Vditor 的 CDN 配错都会在控制台诚实报错——**丑话说在前头，比漂亮广告后藏雷舒服。**

一句话：**Typora 把 Markdown 写成了精致商品；evditor 想把它捡回工具箱——趁手、免费、在老 Windows 上也能落地。**

---

## 功能概览

- **顶栏**：应用自绘标题区（主进程已关闭系统菜单栏），显示当前文档名；右侧提供模式选择、**关闭** / **新建** / **打开** / **保存**。
- **左侧「文件」侧栏**：在 Electron 中可选中磁盘上的**工作目录**，递归展示目录树；目录默认**折叠**，点击行可展开/收起；点击文件会在主编辑区打开（UTF-8 文本）。侧栏与编辑区之间有**可拖拽分隔条**（最窄约 160px，最宽约为主行宽度的 50%）。
- **编辑区**：Vditor 完整工具栏（表情、标题、列表、表格、导出、大纲、全屏等）；外链在应用内拦截后由系统默认浏览器打开。
- **保存逻辑**：若当前文档已有磁盘路径，则直接覆盖写入；若为未命名（无路径），会弹出「另存为」对话框，默认文件名为 `未命名.md`。
- **关闭** 与 **新建**：二者都会清除当前文件路径并将标题置为「未命名」。**关闭** 后内容为极简占位（`# 未命名`）；**新建** 会加载内置欢迎示例文档。
- **浏览器预览**：仅用 `npm run dev` 打开 Vite 页面时，没有 Electron 预加载脚本，顶栏会提示「浏览器预览 · 文件不可用」，侧栏亦不可用；完整能力请在 Electron 窗口中使用。

---

## 环境要求

| 项目 | 说明 |
|------|------|
| **Node.js** | 建议 **18+**（LTS） |
| **npm** | 建议 **9+** |
| **操作系统** | 当前仓库的 `electron-builder` 配置主要面向 **Windows x64** 便携包 |

---

## 快速开始

```bash
# 安装依赖
npm install

# 开发：Vite 热更新 + Electron 窗口（开发态会附加 DevTools）
npm run dev

# 仅做 TypeScript 检查（不打包）
npm run typecheck

# 生产：类型检查 → Vite 构建 → electron-builder 打 Windows 便携包
npm run build
```

开发时主进程会读取环境变量 **`VITE_DEV_SERVER_URL`**（由 `vite-plugin-electron` 注入），从而 `loadURL` 到本地开发服务器；生产构建则 `loadFile` 到 `dist/index.html`。

---

## 使用说明（界面与快捷键）

### 顶栏按钮

| 按钮 | 作用 |
|------|------|
| **模式** | 在下拉框中选择 **即时渲染（IR）**、**所见即所得（WYSIWYG）** 或 **分屏（SV）**；切换会尽量保留当前编辑器中的 Markdown 文本并重新挂载 Vditor。 |
| **关闭** | 取消当前磁盘关联，标题变为「未命名」，内容为极简未命名稿。 |
| **新建** | 取消当前磁盘关联，标题「未命名」，内容为内置欢迎/说明文档。 |
| **打开** | 系统文件对话框，筛选 `md` / `markdown` / `txt` 等，读取 UTF-8 内容到编辑器。 |
| **保存** | 有路径则写回；无路径则另存为 `.md`。 |

### 快捷键（在编辑区全局监听）

| 快捷键 | 作用 |
|--------|------|
| **Ctrl + S**（macOS 上为 **⌘ + S**） | 触发保存（与「保存」按钮相同逻辑）。 |
| **Ctrl + O**（macOS 上为 **⌘ + O**） | 触发打开文件对话框。 |

其余快捷键以 **Vditor** 行为为准（如撤销重做等）。

### 左侧文件树

1. 点击 **打开目录**，选择根文件夹；树为**递归**构建，子目录需手动展开。
2. 点击 **更换目录…** 可重新选择根目录。
3. 从树中打开的文件路径会同步到顶栏「当前文档」逻辑；与 **打开** 按钮打开的独立文件一致，均可 **保存** 写回。

---

## 项目结构（主要路径）

```
electron/
  main.ts          # 主进程：窗口、IPC、对话框、读写文件
  preload.ts       # 预加载：contextBridge 暴露 window.electronAPI
  fs-utils.ts      # 递归目录树、路径是否在工作区根内
src/
  App.vue          # 顶栏、侧栏宽度、文档状态、打开/保存/关闭/新建
  components/
    TyporaEditor.vue   # Vditor 封装、CDN、工具栏、大纲位置、Ctrl+S/O
    LeftSidebar.vue    # 工作区目录树入口
    FileTreeItem.vue   # 树节点（目录默认折叠）
  types/
    electron-api.d.ts  # window.electronAPI 类型声明
dist/                # Vite 构建后的渲染进程静态资源（生产加载）
dist-electron/       # 主进程 main.cjs、预加载 preload.cjs
release/           # electron-builder 输出目录
```

---

## 预加载与 IPC 一览

预加载脚本在隔离上下文中通过 **`contextBridge`** 暴露 **`window.electronAPI`**（渲染进程无 Node 集成）。主进程注册的通道如下：

| IPC 通道 | 方向 | 说明 |
|----------|------|------|
| `md:open` | invoke | 打开单个 Markdown/文本文件，返回 `{ path, content }` 或取消时 `null`。 |
| `md:save` | invoke | 入参 `{ path: string \| null, content }`；无 `path` 时弹出保存对话框；成功返回 `{ path }`。 |
| `fs:openDirectory` | invoke | 选择文件夹，返回 `{ root, tree }`；`tree` 为递归文件树节点数组。 |
| `fs:readTextFile` | invoke | 入参 `{ workspaceRoot, filePath }`；仅当 `filePath` 解析后仍在 `workspaceRoot` 目录树下时才读取，否则返回 `null`（防止路径穿越）。 |

类型定义见 `src/types/electron-api.d.ts`。

---

## 构建与发布

### 产物位置

执行 `npm run build` 成功后，Windows **便携版** 单文件可执行程序位于：

`release/evditor-<version>-win-x64.exe`

其中 `<version>` 与 `package.json` 的 `version` 字段一致（例如 `1.0.0`）。同目录下通常还有 `win-unpacked` 等中间目录，便于调试未压缩目录结构。

### `package.json` 中与打包相关的要点

- **`main`**：`dist-electron/main.cjs`（主进程以 **CommonJS** 输出，避免在 `"type": "module"` 下出现 Electron 对 ESM 主进程的兼容问题）。
- **`build.files`**：包含 `dist/**`、`dist-electron/**` 与 `package.json`；启用 **`asar`**。
- **`build.win`**：目标为 **portable**、**x64**；已配置关闭 **`sign` / `signDlls` / `signAndEditExecutable`**，减少本机或 CI 上因签名工具链导致的失败。
- **`build.electronDownload.mirror`**：使用 `npmmirror` 镜像下载 Electron，缓解官方地址超时。

若在其它环境仍遇到 **代码签名 / CSC** 相关报错，可在执行打包前设置：

```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false   # Linux / macOS shell
set CSC_IDENTITY_AUTO_DISCOVERY=false      # Windows cmd
$env:CSC_IDENTITY_AUTO_DISCOVERY="false"   # Windows PowerShell
```

### 应用图标

未配置自定义图标时，`electron-builder` 会使用 **Electron 默认图标**。若需品牌图标，可在 `package.json` 的 `build` 段增加 `icon` 等配置，并放入对应尺寸的 `.ico` / `.png` 资源。

---

## 实现上值得注意的细节

### Vditor CDN

Vditor 在运行时仍会从 CDN 拉取部分资源。配置中的 **`cdn` 必须是包根 URL**（例如 `https://unpkg.com/vditor@3.10.7`），**不要**写成带 `/dist` 的路径，否则会出现资源 404。见 `src/components/TyporaEditor.vue` 内注释与常量 **`VDITOR_CDN`**。

### 预加载产物扩展名

在 `"type": "module"` 下，`vite-plugin-electron` 可能将预加载默认命名为 `.mjs`，而实际内容为 CJS 时会导致预加载失败。本仓库在 `vite.config.ts` 中通过 **`entryFileNames: 'preload.cjs'`** 固定输出名，并与 `electron/main.ts` 中的 `preload.cjs` 路径一致。

### 环境变量

根目录 **`.env`** 中的 **`VITE_APP_TITLE`** 供 Vite 侧使用（若代码中有引用）；窗口标题也可在 `index.html` 的 `<title>` 与 `package.json` 的 `build.productName` 等处统一维护。

---

## 常见问题（排错）

| 现象 | 可能原因 | 处理方向 |
|------|----------|----------|
| 开发时 Electron 白屏或无法读写文件 | 预加载未加载、`electronAPI` 为空 | 确认 `dist-electron/preload.cjs` 生成且 `BrowserWindow` 的 `webPreferences.preload` 路径正确。 |
| Vditor 工具栏或模式异常、控制台 404 | CDN 路径错误 | 检查 `VDITOR_CDN` 是否含多余的 `/dist`。 |
| `npm run build` 下载 Electron 很慢或失败 | 网络访问官方 CDN 受限 | 已配置 npmmirror；也可检查代理或防火墙。 |
| 打包阶段与 **winCodeSign** / **签名** 相关报错 | 本机或 CI 自动探测到证书 | 设置 `CSC_IDENTITY_AUTO_DISCOVERY=false`，并确认 `build.win` 签名相关项为关闭。 |
| 浏览器里「文件不可用」 | 预期行为 | 使用 `npm run dev` 启动的 Electron 窗口以获取完整 API。 |

---

## 技术栈版本（以 `package.json` 为准）

- **Electron** 22.x  
- **Vue** 3.x  
- **Vite** 5.x  
- **Vditor** 3.x（README 中示例 CDN 版本需与实际 `dependencies` 中版本一致，升级时请同步修改 `VDITOR_CDN`）

---

## 许可证与隐私

本仓库在 `package.json` 中标记为 **`"private": true`**，未默认附带开源许可证。若你计划对外分发或开源，请自行补充 `LICENSE` 文件并审阅 **Vditor**、**Electron** 等依赖的许可证条款。
