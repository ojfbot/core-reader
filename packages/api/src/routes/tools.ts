import { Router, Request, Response } from 'express'

export function toolsRouter(): Router {
  const router = Router()

  router.get('/', (_req: Request, res: Response) => {
    res.json({
      service: 'core-reader',
      version: '1.0.0',
      description: 'Reads the core repo filesystem and surfaces skills, ADRs, and roadmap as queryable APIs',
      tools: [
        {
          name: 'get_skills',
          endpoint: 'GET /api/skills',
          description: 'List all slash skills with tier, phase, and description',
          input: {},
          deprecated: false,
        },
        {
          name: 'get_skill',
          endpoint: 'GET /api/skills/:name',
          description: 'Get full markdown content of a specific slash skill',
          input: { name: 'string — skill name without leading slash (e.g. plan-feature)' },
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
        skills: 'GET /api/skills',
        adrs: 'GET /api/adrs',
        roadmap: 'GET /api/roadmap',
      },
    })
  })

  return router
}
