<script setup lang="ts">
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

/** 包根路径，不要带 /dist（Vditor 内部会拼 `${cdn}/dist/js/...`） */
const VDITOR_CDN = 'https://unpkg.com/vditor@3.10.7'

const toolbar = [
  'emoji',
  'headings',
  'bold',
  'italic',
  'strike',
  'link',
  'list',
  'ordered-list',
  'outdent',
  'indent',
  'check',
  'line',
  'quote',
  'code',
  'inline-code',
  'insert-after',
  'insert-before',
  'upload',
  'record',
  'table',
  '|',
  'undo',
  'redo',
  '|',
  'both',
  'edit-mode',
  'content-theme',
  'code-theme',
  'export',
  'outline',
  'preview',
  'fullscreen',
  'devtools',
  'br',
] as const satisfies readonly string[]

const props = withDefaults(
  defineProps<{
    initialMarkdown: string
    editorMode?: 'wysiwyg' | 'ir' | 'sv'
    docKey?: number
  }>(),
  {
    editorMode: 'ir',
    docKey: 0,
  },
)

const emit = defineEmits<{
  'save-request': []
  'open-request': []
}>()

const host = ref<HTMLElement | null>(null)
let vditor: Vditor | undefined

function mountEditor(markdown: string) {
  const el = host.value
  if (!el) return

  vditor = new Vditor(el, {
    cdn: VDITOR_CDN,
    lang: 'zh_CN',
    mode: props.editorMode,
    height: '100%',
    minHeight: 320,
    width: '100%',
    theme: 'classic',
    icon: 'ant',
    placeholder: '在此书写 Markdown（即时渲染模式）……',
    toolbar: [...toolbar],
    toolbarConfig: {
      pin: true,
      hide: false,
    },
    counter: {
      enable: true,
      type: 'markdown',
    },
    cache: {
      enable: true,
      id: `typoora-${props.docKey}-${props.editorMode}`,
    },
    outline: {
      enable: true,
      position: 'right',
    },
    preview: {
      maxWidth: 800,
      theme: {
        current: 'light',
      },
      markdown: {
        toc: true,
        mark: true,
      },
      hljs: {
        style: 'github',
      },
    },
    value: markdown,
    after() {
      vditor?.setTheme('classic', 'light')
    },
  })
}

async function remount(usePropsInitial: boolean) {
  const nextMd = usePropsInitial
    ? props.initialMarkdown
    : (vditor?.getValue() ?? props.initialMarkdown)
  vditor?.destroy()
  vditor = undefined
  if (host.value) {
    host.value.innerHTML = ''
  }
  await nextTick()
  mountEditor(nextMd)
}

onMounted(() => {
  void remount(true)
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  vditor?.destroy()
  vditor = undefined
})

watch(
  () => props.docKey,
  () => {
    void remount(true)
  },
)

watch(
  () => props.editorMode,
  () => {
    void remount(false)
  },
)

function onGlobalKeydown(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey
  if (mod && e.key.toLowerCase() === 's') {
    e.preventDefault()
    emit('save-request')
  }
  if (mod && e.key.toLowerCase() === 'o') {
    e.preventDefault()
    emit('open-request')
  }
}

function getMarkdown(): string {
  return vditor?.getValue() ?? ''
}

defineExpose({ getMarkdown })
</script>

<template>
  <div class="vditor-shell">
    <div ref="host" class="vditor-host" />
  </div>
</template>

<style scoped>
.vditor-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #f5f5f5;
}

.vditor-host {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.vditor) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: none;
  border-radius: 0;
  background: #f5f5f5;
}

:deep(.vditor-toolbar) {
  flex: 0 0 auto;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  padding-right: 8px;
}

:deep(.vditor-content) {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 0;
  overflow: hidden;
  background: #fafafa;
}

:deep(.vditor-outline--right) {
  flex: 0 0 220px;
  width: 220px;
  max-width: min(220px, 32vw);
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  border-left: 1px solid #e0e0e0;
  background: #ededed;
  box-sizing: border-box;
}

:deep(.vditor-outline__title) {
  font-weight: 600;
  font-size: 13px;
  color: #444;
  padding: 10px 12px 6px;
  border-bottom: 1px solid #e0e0e0;
  background: #e8e8e8;
}

:deep(.vditor-ir),
:deep(.vditor-wysiwyg),
:deep(.vditor-sv),
:deep(.vditor-preview) {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

:deep(.vditor-ir__body),
:deep(.vditor-wysiwyg__body) {
  height: 100%;
  overflow: auto;
}

:deep(.vditor-reset) {
  font-size: 16px;
  line-height: 1.65;
}
</style>
