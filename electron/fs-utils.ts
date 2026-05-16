import fs from 'node:fs/promises'
import path from 'node:path'

export interface FileTreeNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileTreeNode[]
}

export function isPathInsideRoot(root: string, target: string): boolean {
  const r = path.resolve(root)
  const t = path.resolve(target)
  if (t === r) return true
  const prefix = r.endsWith(path.sep) ? r : r + path.sep
  return t.startsWith(prefix)
}

export async function readDirectoryTree(dirPath: string): Promise<FileTreeNode[]> {
  let entries
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
  const sorted = [...entries].sort((a, b) => {
    const an = String(a.name)
    const bn = String(b.name)
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
    return an.localeCompare(bn, undefined, { sensitivity: 'base' })
  })
  const nodes: FileTreeNode[] = []
  for (const ent of sorted) {
    const name = String(ent.name)
    const full = path.join(dirPath, name)
    if (ent.isDirectory()) {
      nodes.push({
        name,
        path: full,
        isDirectory: true,
        children: await readDirectoryTree(full),
      })
    } else {
      nodes.push({
        name,
        path: full,
        isDirectory: false,
      })
    }
  }
  return nodes
}
