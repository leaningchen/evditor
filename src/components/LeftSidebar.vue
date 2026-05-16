<script setup lang="ts">
import FileTreeItem from '@/components/FileTreeItem.vue'
import { ref } from 'vue'

interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

const emit = defineEmits<{
  'open-file': [payload: { path: string; content: string }]
}>()

const workspaceRoot = ref<string | null>(null)
const tree = ref<FileNode[]>([])
const loading = ref(false)

function hasFsBridge(): boolean {
  return Boolean(
    window.electronAPI?.openWorkspaceFolder && window.electronAPI?.readTextFileInWorkspace,
  )
}

async function onOpenDirectory() {
  const api = window.electronAPI
  if (!api?.openWorkspaceFolder) return
  loading.value = true
  try {
    const r = await api.openWorkspaceFolder()
    if (!r) return
    workspaceRoot.value = r.root
    tree.value = r.tree
  } finally {
    loading.value = false
  }
}

async function onFileTreeOpen(filePath: string) {
  const api = window.electronAPI
  const root = workspaceRoot.value
  if (!api?.readTextFileInWorkspace || !root) return
  const r = await api.readTextFileInWorkspace(root, filePath)
  if (r) emit('open-file', r)
}
</script>

<template>
  <aside class="left-sidebar">
    <div class="sidebar-head">文件</div>

    <div class="panel files-panel">
      <template v-if="!hasFsBridge()">
        <p class="hint">仅在 Electron 中可用</p>
      </template>
      <template v-else-if="!workspaceRoot">
        <div class="empty">
          <button type="button" class="open-dir-btn" :disabled="loading" @click="onOpenDirectory">
            {{ loading ? '读取中…' : '打开目录' }}
          </button>
        </div>
      </template>
      <template v-else>
        <div class="root-label" :title="workspaceRoot">{{ workspaceRoot }}</div>
        <div class="tree-scroll">
          <FileTreeItem
            v-for="n in tree"
            :key="n.path"
            :node="n"
            :depth="0"
            @open-file="onFileTreeOpen"
          />
        </div>
        <button type="button" class="linkish" @click="onOpenDirectory">更换目录…</button>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.left-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: #f0f0f0;
}

.sidebar-head {
  flex: 0 0 auto;
  padding: 9px 12px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.files-panel {
  padding: 0;
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.open-dir-btn {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 4px;
  border: 1px solid #bbb;
  background: #fff;
  cursor: pointer;
}

.open-dir-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.hint {
  margin: 12px;
  font-size: 12px;
  color: #888;
}

.root-label {
  flex-shrink: 0;
  padding: 8px 10px;
  font-size: 11px;
  color: #666;
  border-bottom: 1px solid #e4e4e4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #eaeaea;
}

.tree-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 0 8px;
}

.linkish {
  flex-shrink: 0;
  margin: 6px 10px 10px;
  padding: 0;
  border: none;
  background: none;
  font-size: 11px;
  color: #0969da;
  cursor: pointer;
  text-align: left;
}

.linkish:hover {
  text-decoration: underline;
}
</style>
