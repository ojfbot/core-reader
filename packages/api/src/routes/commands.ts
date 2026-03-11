import { Router, Request, Response } from 'express'
import {
  parseCommands,
  parseCommandsFromGitHub,
  getCommandContent,
  getCommandFromGitHub,
} from '../parsers/parseCommands'
import { CommandManifest } from '../types'

export function commandsRouter(coreRepoPath: string): Router {
  const router = Router()
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const GITHUB_REPO = process.env.GITHUB_CORE_REPO ?? 'ojfbot/core'

  // In-memory cache — persists for the lifetime of the serverless function instance.
  // Deduplicates concurrent requests during the initial cold-start fetch.
  let cache: CommandManifest[] | null = null
  let cachePromise: Promise<CommandManifest[]> | null = null

  function getAll(): Promise<CommandManifest[]> {
    if (cache) return Promise.resolve(cache)
    if (cachePromise) return cachePromise
    cachePromise = (GITHUB_TOKEN
      ? parseCommandsFromGitHub(GITHUB_REPO, GITHUB_TOKEN)
      : Promise.resolve(parseCommands(coreRepoPath))
    ).then(result => {
      cache = result
      cachePromise = null
      return result
    }).catch(err => {
      cachePromise = null // allow retry on next request
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

  router.get('/:name', async (req: Request, res: Response) => {
    try {
      const name = String(req.params.name)
      const command = GITHUB_TOKEN
        ? await getCommandFromGitHub(GITHUB_REPO, GITHUB_TOKEN, name)
        : getCommandContent(coreRepoPath, name)
      if (!command) {
        res.status(404).json({ error: 'Command not found' })
        return
      }
      res.json(command)
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return router
}
