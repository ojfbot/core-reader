// Vercel catch-all serverless function for CoreReader API (/api/*).
// Requires the API package to be compiled (packages/api/dist/) before deployment.
// CORE_REPO_PATH env var: set in Vercel project settings.
// Fallback: process.cwd() = /var/task (project root) — ADR files must be in decisions/adr/.
'use strict'

const { createApp } = require('../packages/api/dist/app')
const app = createApp(process.env.CORE_REPO_PATH || process.cwd())
module.exports = app
