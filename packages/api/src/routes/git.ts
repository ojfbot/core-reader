import { Router, Request, Response } from 'express'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const exec = promisify(execFile)

export interface FileStatus {
  path: string
  status: string // 'M', 'A', 'D', '?', etc.
}

export interface GitStatusResult {
  staged: FileStatus[]
  unstaged: FileStatus[]
  untracked: string[]
}

export function gitRouter(coreRepoPath: string): Router {
  const router = Router()

  // Resolve + validate path is within coreRepoPath
  function safePath(rel: string): string | null {
    const resolved = path.resolve(coreRepoPath, rel)
    if (!resolved.startsWith(path.resolve(coreRepoPath) + path.sep)) return null
    return resolved
  }

  // GET /api/git/status
  router.get('/status', async (_req: Request, res: Response) => {
    try {
      const { stdout } = await exec('git', ['status', '--porcelain'], { cwd: coreRepoPath })
      const staged: FileStatus[] = []
      const unstaged: FileStatus[] = []
      const untracked: string[] = []
      for (const line of stdout.split('\n').filter(Boolean)) {
        const xy = line.slice(0, 2)
        const filePath = line.slice(3).trim()
        const x = xy[0] // index (staged)
        const y = xy[1] // working tree (unstaged)
        if (x !== ' ' && x !== '?') staged.push({ path: filePath, status: x })
        if (y === '?') untracked.push(filePath)
        else if (y !== ' ' && y !== '?') unstaged.push({ path: filePath, status: y })
      }
      res.json({ staged, unstaged, untracked })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  // GET /api/git/diff?path=<relative>&staged=true|false
  router.get('/diff', async (req: Request, res: Response) => {
    const rel = String(req.query.path ?? '')
    const staged = req.query.staged === 'true'
    if (!rel) return void res.status(400).json({ error: 'path required' })
    if (!safePath(rel)) return void res.status(400).json({ error: 'invalid path' })
    try {
      const args = staged
        ? ['diff', '--cached', '--', rel]
        : ['diff', 'HEAD', '--', rel]
      const { stdout } = await exec('git', args, { cwd: coreRepoPath })
      res.json({ diff: stdout })
    } catch {
      res.json({ diff: '' })
    }
  })

  // POST /api/git/stage  body: { paths: string[] }
  router.post('/stage', async (req: Request, res: Response) => {
    const { paths } = req.body as { paths?: string[] }
    if (!Array.isArray(paths) || paths.length === 0) return void res.status(400).json({ error: 'paths required' })
    const safe = paths.map(p => safePath(p)).filter(Boolean) as string[]
    if (safe.length !== paths.length) return void res.status(400).json({ error: 'invalid path' })
    try {
      await exec('git', ['add', '--', ...paths], { cwd: coreRepoPath })
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  // POST /api/git/unstage  body: { paths: string[] }
  router.post('/unstage', async (req: Request, res: Response) => {
    const { paths } = req.body as { paths?: string[] }
    if (!Array.isArray(paths) || paths.length === 0) return void res.status(400).json({ error: 'paths required' })
    const safe = paths.map(p => safePath(p)).filter(Boolean) as string[]
    if (safe.length !== paths.length) return void res.status(400).json({ error: 'invalid path' })
    try {
      await exec('git', ['restore', '--staged', '--', ...paths], { cwd: coreRepoPath })
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  // POST /api/git/commit  body: { message: string }
  router.post('/commit', async (req: Request, res: Response) => {
    const { message } = req.body as { message?: string }
    if (!message?.trim()) return void res.status(400).json({ error: 'message required' })
    try {
      const { stdout } = await exec('git', ['commit', '-m', message], { cwd: coreRepoPath })
      res.json({ ok: true, output: stdout })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  // GET /api/git/file?path=<relative>  — read file content for editing
  router.get('/file', async (req: Request, res: Response) => {
    const rel = String(req.query.path ?? '')
    if (!rel) return void res.status(400).json({ error: 'path required' })
    const abs = safePath(rel)
    if (!abs) return void res.status(400).json({ error: 'invalid path' })
    try {
      const content = await fs.readFile(abs, 'utf-8')
      res.json({ content })
    } catch {
      res.status(404).json({ error: 'file not found' })
    }
  })

  // PUT /api/git/file  body: { path: string, content: string }
  router.put('/file', async (req: Request, res: Response) => {
    const { path: rel, content } = req.body as { path?: string; content?: string }
    if (!rel || content === undefined) return void res.status(400).json({ error: 'path and content required' })
    const abs = safePath(rel)
    if (!abs) return void res.status(400).json({ error: 'invalid path' })
    try {
      // Only allow editing existing files
      await fs.access(abs)
      await fs.writeFile(abs, content, 'utf-8')
      res.json({ ok: true })
    } catch {
      res.status(400).json({ error: 'file does not exist or cannot be written' })
    }
  })

  return router
}
