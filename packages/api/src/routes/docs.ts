import { Router, Request, Response } from 'express'
import {
  parseDocs,
  parseDocContent,
  parseDocsFromGitHub,
  parseDocContentFromGitHub,
} from '../parsers/parseDocs'
import { DocManifest } from '../types'

export function docsRouter(coreRepoPath: string): Router {
  const router = Router()
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const GITHUB_REPO = process.env.GITHUB_CORE_REPO ?? 'ojfbot/core'

  let manifestCache: DocManifest[] | null = null
  let manifestPromise: Promise<DocManifest[]> | null = null

  function getManifest(): Promise<DocManifest[]> {
    if (manifestCache) return Promise.resolve(manifestCache)
    if (manifestPromise) return manifestPromise
    manifestPromise = (GITHUB_TOKEN
      ? parseDocsFromGitHub(GITHUB_REPO, GITHUB_TOKEN)
      : Promise.resolve(parseDocs(coreRepoPath))
    ).then(result => {
      manifestCache = result
      manifestPromise = null
      return result
    }).catch(err => {
      manifestPromise = null
      throw err
    })
    return manifestPromise
  }

  router.get('/', async (_req: Request, res: Response) => {
    try {
      res.json(await getManifest())
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.get('/:name', async (req: Request, res: Response) => {
    const name = String(req.params['name'] ?? '')
    // Sanitize: only allow alphanum, hyphens, underscores
    if (!/^[\w-]+$/.test(name)) {
      res.status(400).json({ error: 'Invalid doc name' })
      return
    }
    try {
      const content = GITHUB_TOKEN
        ? await parseDocContentFromGitHub(GITHUB_REPO, GITHUB_TOKEN, name)
        : parseDocContent(coreRepoPath, name)

      if (content === null) {
        res.status(404).json({ error: 'Doc not found' })
        return
      }
      res.json({ content })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return router
}
