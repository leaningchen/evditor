export interface MarkdownOpenResult {
  path: string
  content: string
}

export interface MarkdownSaveResult {
  path: string
}

export interface FileTreeNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileTreeNode[]
}

export interface WorkspaceOpenResult {
  root: string
  tree: FileTreeNode[]
}

declare global {
  interface Window {
    electronAPI?: {
      platform: string
      versions: { chrome: string; electron: string; node: string }
      openMarkdown?: () => Promise<MarkdownOpenResult | null>
      saveMarkdown?: (
        path: string | null,
        content: string,
      ) => Promise<MarkdownSaveResult | null>
      openWorkspaceFolder?: () => Promise<WorkspaceOpenResult | null>
      readTextFileInWorkspace?: (
        workspaceRoot: string,
        filePath: string,
      ) => Promise<MarkdownOpenResult | null>
    }
  }
}

export {}
