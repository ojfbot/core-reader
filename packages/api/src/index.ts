import path from 'path'
import fs from 'fs'
import { createApp } from './app'

const PORT = process.env.PORT ?? 3016
const CORE_REPO_PATH = process.env.CORE_REPO_PATH || process.cwd()

const resolvedPath = path.resolve(CORE_REPO_PATH)
if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: CORE_REPO_PATH does not exist: ${resolvedPath}`)
  process.exit(1)
}

const app = createApp(resolvedPath)

app.listen(Number(PORT), () => {
  console.log(`CoreReader API listening on :${PORT}`)
  console.log(`Reading core repo: ${resolvedPath}`)
})
