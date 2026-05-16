import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node,
  },
  openMarkdown: () => ipcRenderer.invoke('md:open'),
  saveMarkdown: (filePath: string | null, content: string) =>
    ipcRenderer.invoke('md:save', { path: filePath, content }),
  openWorkspaceFolder: () => ipcRenderer.invoke('fs:openDirectory'),
  readTextFileInWorkspace: (workspaceRoot: string, filePath: string) =>
    ipcRenderer.invoke('fs:readTextFile', { workspaceRoot, filePath }),
})
