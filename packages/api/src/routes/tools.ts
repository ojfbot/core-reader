import { Router, Request, Response } from 'express'

export function toolsRouter(): Router {
  const router = Router()

  router.get('/', (_req: Request, res: Response) => {
    res.json({
      service: 'core-reader',
      version: '1.0.0',
      description: 'Reads the core repo filesystem and surfaces commands, ADRs, and roadmap as queryable APIs',
      tools: [
        {
          name: 'get_commands',
          endpoint: 'GET /api/commands',
          description: 'List all slash commands with tier, phase, and description',
          input: {},
          deprecated: false,
        },
        {
          name: 'get_command',
          endpoint: 'GET /api/commands/:name',
          description: 'Get full markdown content of a specific slash command',
          input: { name: 'string — command name without leading slash (e.g. plan-feature)' },
          deprecated: false,
        },
        {
          name: 'get_adrs',
          endpoint: 'GET /api/adrs',
          description: 'List all Architecture Decision Records with status and metadata',
          input: { status: 'string? — filter by Accepted | Proposed | Superseded' },
          deprecated: false,
        },
        {
          name: 'get_adr',
          endpoint: 'GET /api/adrs/:number',
          description: 'Get full markdown content of a specific ADR',
          input: { number: 'string — zero-padded ADR number (e.g. 0010)' },
          deprecated: false,
        },
        {
          name: 'get_roadmap',
          endpoint: 'GET /api/roadmap',
          description: 'Get Frame OS roadmap phases with current status',
          input: {},
          deprecated: false,
        },
      ],
      dataEndpoints: {
        commands: 'GET /api/commands',
        adrs: 'GET /api/adrs',
        roadmap: 'GET /api/roadmap',
      },
    })
  })

  return router
}
