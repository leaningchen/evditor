<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LeftSidebar from '@/components/LeftSidebar.vue'
import TyporaEditor from '@/components/TyporaEditor.vue'

const DEFAULT_MD = `# 欢迎使用

这里是 **即时渲染（IR）** 模式：输入 \`##\` 等语法时仍能看到标记，同时会排版成标题；**大纲**在编辑区右侧（工具栏可切换显示）。

## 二级标题示例

正文与 *斜体*、\`行内代码\`、[链接](https://b3log.org/vditor)。

### 三级标题

- 列表项一
- 列表项二

> 引用块

---

使用顶部工具栏切换 **编辑模式**、打开 **大纲** 面板或 **全屏**。**Ctrl+S** 保存，**Ctrl+O** 打开文件。
`

const EMPTY_DOC = `# 未命名\n\n`

const editorRef = ref<InstanceType<typeof TyporaEditor> | null>(null)
const currentPath = ref<string | null>(null)
const docKey = ref(0)
const initialMarkdown = ref(DEFAULT_MD)
const editorMode = ref<'wysiwyg' | 'ir' | 'sv'>('ir')

const titleText = ref('未命名')

const SIDEBAR_MIN = 160

const editorRowRef = ref<HTMLElement | null>(null)
const sidebarWidth = ref(240)

function sidebarMaxPx(): number {
  const rowW = editorRowRef.value?.clientWidth ?? window.innerWidth
  return Math.max(SIDEBAR_MIN, Math.floor(rowW * 0.5))
}

function clampSidebarWidth() {
  const max = sidebarMaxPx()
  if (sidebarWidth.value > max) sidebarWidth.value = max
  if (sidebarWidth.value < SIDEBAR_MIN) sidebarWidth.value = SIDEBAR_MIN
}

function onSplitMouseDown(downEvent: MouseEvent) {
  downEvent.preventDefault()
  const startX = downEvent.clientX
  const startW = sidebarWidth.value

  function onMove(ev: MouseEvent) {
    const max = sidebarMaxPx()
    const delta = ev.clientX - startX
    sidebarWidth.value = Math.min(max, Math.max(SIDEBAR_MIN, startW + delta))
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.body.style.removeProperty('cursor')
    document.body.style.removeProperty('user-select')
  }

  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

onMounted(() => {
  clampSidebarWidth()
  window.addEventListener('resize', clampSidebarWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', clampSidebarWidth)
})

function hasFileBridge(): boolean {
  return Boolean(window.electronAPI?.openMarkdown && window.electronAPI?.saveMarkdown)
}

async function onOpen() {
  const api = window.electronAPI
  if (!api?.openMarkdown) return
  const r = await api.openMarkdown()
  if (!r) return
  currentPath.value = r.path
  initialMarkdown.value = r.content
  titleText.value = r.path.split(/[/\\]/).pop() ?? r.path
  docKey.value += 1
}

async function onSave() {
  const api = window.electronAPI
  const ed = editorRef.value
  if (!api?.saveMarkdown || !ed) return
  const md = ed.getMarkdown()
  const r = await api.saveMarkdown(currentPath.value, md)
  if (r) {
    currentPath.value = r.path
    titleText.value = r.path.split(/[/\\]/).pop() ?? r.path
  }
}

function onOpenFileFromWorkspace(r: { path: string; content: string }) {
  currentPath.value = r.path
  initialMarkdown.value = r.content
  titleText.value = r.path.split(/[/\\]/).pop() ?? r.path
  docKey.value += 1
}

function closeFile() {
  currentPath.value = null
  initialMarkdown.value = EMPTY_DOC
  titleText.value = '未命名'
  docKey.value += 1
}

function newDoc() {
  currentPath.value = null
  initialMarkdown.value = DEFAULT_MD
  titleText.value = '未命名'
  docKey.value += 1
}
</script>

<template>
  <div class="app-shell">
    <!-- 与 Vditor 工具栏视觉连成一体：浅色、无系统「菜单栏」时由 Electron 处理 -->
    <header class="app-chrome">
      <div class="chrome-left">
        <span class="doc-title">{{ titleText }}</span>
        <span v-if="!hasFileBridge()" class="bridge-hint">浏览器预览 · 文件不可用</span>
      </div>
      <div class="chrome-right">
        <label class="mode">
          <span>模式</span>
          <select v-model="editorMode">
            <option value="ir">即时渲染</option>
            <option value="wysiwyg">所见即所得</option>
            <option value="sv">分屏</option>
          </select>
        </label>
        <button type="button" class="btn" :disabled="!hasFileBridge()" @click="closeFile">
          关闭
        </button>
        <button type="button" class="btn" :disabled="!hasFileBridge()" @click="newDoc">
          新建
        </button>
        <button type="button" class="btn" :disabled="!hasFileBridge()" @click="onOpen">
          打开
        </button>
        <button type="button" class="btn primary" :disabled="!hasFileBridge()" @click="onSave">
          保存
        </button>
      </div>
    </header>

    <main class="editor-pane">
      <div ref="editorRowRef" class="editor-row">
        <div class="sidebar-host" :style="{ width: `${sidebarWidth}px` }">
          <LeftSidebar @open-file="onOpenFileFromWorkspace" />
        </div>
        <div
          class="splitter"
          role="separator"
          aria-orientation="vertical"
          aria-label="调整侧栏宽度"
          @mousedown="onSplitMouseDown"
        />
        <div class="editor-main">
          <TyporaEditor
            ref="editorRef"
            :initial-markdown="initialMarkdown"
            :editor-mode="editorMode"
            :doc-key="docKey"
            @open-request="onOpen"
            @save-request="onSave"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
}

/* 与 Vditor 顶栏同高感、浅色 */
.app-chrome {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 38px;
  padding: 0 10px 0 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  font-size: 12px;
  color: #333;
}

.chrome-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.doc-title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bridge-hint {
  color: #888;
  flex-shrink: 0;
}

.chrome-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.mode {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #555;
  margin-right: 4px;
}

.mode select {
  font: inherit;
  font-size: 12px;
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #fff;
}

.btn {
  font: inherit;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 3px;
  border: 1px solid #c8c8c8;
  background: #fafafa;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn.primary {
  border-color: #0969da;
  background: #0969da;
  color: #fff;
}

.btn:not(:disabled):hover {
  filter: brightness(0.97);
}

.editor-pane {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.editor-row {
  display: flex;
  flex-direction: row;
  height: 100%;
  min-height: 0;
}

.sidebar-host {
  flex-shrink: 0;
  min-width: 0;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.splitter {
  flex: 0 0 2px;
  cursor: col-resize;
  background: #d8d8d8;
  box-sizing: border-box;
}

.splitter:hover {
  background: #b8cce8;
}

.editor-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
