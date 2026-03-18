import { Router, Request, Response } from 'express'
import { parseOKRs, parseOKRsFromGitHub } from '../parsers/parseOKRs'
import { OKRFile } from '../types'

export function okrsRouter(coreRepoPath: string): Router {
  const router = Router()
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const GITHUB_REPO = process.env.GITHUB_CORE_REPO ?? 'ojfbot/core'

  let cache: OKRFile[] | null = null
  let cachePromise: Promise<OKRFile[]> | null = null

  function getAll(): Promise<OKRFile[]> {
    if (cache) return Promise.resolve(cache)
    if (cachePromise) return cachePromise
    cachePromise = (GITHUB_TOKEN
      ? parseOKRsFromGitHub(GITHUB_REPO, GITHUB_TOKEN)
      : Promise.resolve(parseOKRs(coreRepoPath))
    ).then(result => {
      cache = result
      cachePromise = null
      return result
    }).catch(err => {
      cachePromise = null
      throw err
    })
    return cachePromise
  }

  router.get('/', async (_req: Request, res: Response) => {
    try {
      res.json(await getAll())
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return router
}
