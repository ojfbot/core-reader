import { Router, Request, Response } from 'express'
import { parseCommands, getCommandContent } from '../parsers/parseCommands'
import { CommandManifest } from '../types'

export function commandsRouter(coreRepoPath: string): Router {
  const router = Router()
  let cache: CommandManifest[] | null = null

  router.get('/', (_req: Request, res: Response) => {
    if (!cache) cache = parseCommands(coreRepoPath)
    res.json(cache)
  })

  router.get('/:name', (req: Request, res: Response) => {
    const command = getCommandContent(coreRepoPath, req.params.name)
    if (!command) return res.status(404).json({ error: 'Command not found' })
    res.json(command)
  })

  return router
}
