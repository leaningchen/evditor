<script setup lang="ts">
import FileTreeItem from './FileTreeItem.vue'
import { ref } from 'vue'

interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

const props = defineProps<{
  node: FileNode
  depth: number
}>()

const emit = defineEmits<{
  openFile: [path: string]
}>()

const expanded = ref(false)

function toggleDir() {
  if (!props.node.isDirectory) return
  expanded.value = !expanded.value
}

function onRowClick() {
  if (props.node.isDirectory) {
    toggleDir()
    return
  }
  emit('openFile', props.node.path)
}
</script>

<template>
  <div class="ft-node">
    <div
      class="ft-row"
      :class="{ dir: node.isDirectory, file: !node.isDirectory }"
      :style="{ paddingLeft: `${8 + depth * 14}px` }"
      @click="onRowClick"
    >
      <span v-if="node.isDirectory" class="ft-chevron" aria-hidden="true">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span v-else class="ft-chevron ft-chevron--spacer" />
      <span class="ft-name" :title="node.path">{{ node.name }}</span>
    </div>
    <div v-if="node.isDirectory && expanded && node.children?.length" class="ft-kids">
      <FileTreeItem
        v-for="ch in node.children"
        :key="ch.path"
        :node="ch"
        :depth="depth + 1"
        @open-file="(p) => emit('openFile', p)"
      />
    </div>
  </div>
</template>

<style scoped>
.ft-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 26px;
  font-size: 12px;
  color: #333;
  cursor: default;
  user-select: none;
}

.ft-row.file {
  cursor: pointer;
}

.ft-row.file:hover {
  background: rgba(0, 0, 0, 0.05);
}

.ft-row.dir:hover {
  background: rgba(0, 0, 0, 0.04);
}

.ft-chevron {
  width: 14px;
  flex-shrink: 0;
  font-size: 9px;
  color: #777;
  text-align: center;
}

.ft-chevron--spacer {
  visibility: hidden;
}

.ft-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
