import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  shell,
  type WebContents,
} from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPathInsideRoot, readDirectoryTree } from './fs-utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let mainWindow: BrowserWindow | null = null

function windowFromEvent(sender: WebContents): BrowserWindow | undefined {
  return BrowserWindow.fromWebContents(sender) ?? BrowserWindow.getFocusedWindow() ?? undefined
}

function registerMarkdownIpc() {
  ipcMain.handle('fs:openDirectory', async (event) => {
    const win = windowFromEvent(event.sender)
    if (!win) return null
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    })
    if (canceled || filePaths.length === 0) return null
    const root = filePaths[0]
    const tree = await readDirectoryTree(root)
    return { root, tree }
  })

  ipcMain.handle(
    'fs:readTextFile',
    async (
      _event,
      payload: { filePath: string; workspaceRoot: string },
    ): Promise<{ path: string; content: string } | null> => {
      if (!isPathInsideRoot(payload.workspaceRoot, payload.filePath)) {
        return null
      }
      let st: Awaited<ReturnType<typeof fs.stat>>
      try {
        st = await fs.stat(payload.filePath)
      } catch {
        return null
      }
      if (!st.isFile()) return null
      try {
        const content = await fs.readFile(payload.filePath, 'utf-8')
        return { path: payload.filePath, content }
      } catch {
        return null
      }
    },
  )

  ipcMain.handle('md:open', async (event) => {
    const win = windowFromEvent(event.sender)
    if (!win) return null
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
        { name: '所有文件', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })
    if (canceled || filePaths.length === 0) return null
    const filePath = filePaths[0]
    const content = await fs.readFile(filePath, 'utf-8')
    return { path: filePath, content }
  })

  ipcMain.handle(
    'md:save',
    async (event, payload: { path: string | null; content: string }) => {
      const win = windowFromEvent(event.sender)
      if (!win) return null
      let target = payload.path
      if (!target) {
        const r = await dialog.showSaveDialog(win, {
          filters: [{ name: 'Markdown', extensions: ['md'] }],
          defaultPath: '未命名.md',
        })
        if (r.canceled || !r.filePath) return null
        target = r.filePath
      }
      await fs.writeFile(target, payload.content, 'utf-8')
      return { path: target }
    },
  )
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 800,
    minHeight: 520,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  registerMarkdownIpc()
  createWindow()
})
