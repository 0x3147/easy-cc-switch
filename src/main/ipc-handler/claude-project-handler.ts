import { ipcMain } from 'electron'
import { homedir } from 'os'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { CLAUDE_PROJECT_CHANNELS } from '../../shared/ipc-channels'
import type {
  ClaudeJson,
  ClaudeProjectConfig,
  UpdateProjectConfigRequest
} from '../../shared/types/claude-project'

const CLAUDE_JSON_PATH = join(homedir(), '.claude.json')

async function readClaudeJson(): Promise<ClaudeJson> {
  try {
    const content = await readFile(CLAUDE_JSON_PATH, 'utf-8')
    const data = JSON.parse(content)
    return { projects: data.projects && typeof data.projects === 'object' ? data.projects : {} }
  } catch (error) {
    return { projects: {} }
  }
}

async function writeClaudeJson(data: ClaudeJson): Promise<void> {
  const content = await readFile(CLAUDE_JSON_PATH, 'utf-8')
  const fullData = JSON.parse(content)
  fullData.projects = data.projects
  await writeFile(CLAUDE_JSON_PATH, JSON.stringify(fullData, null, 2), 'utf-8')
}

export function registerClaudeProjectHandlers(): void {
  ipcMain.handle(CLAUDE_PROJECT_CHANNELS.GET_ALL_PROJECTS, async (): Promise<ClaudeProjectConfig[]> => {
    const data = await readClaudeJson()
    return Object.entries(data.projects).map(([path, config]) => ({ path, ...config }))
  })

  ipcMain.handle(
    CLAUDE_PROJECT_CHANNELS.UPDATE_PROJECT,
    async (_, request: UpdateProjectConfigRequest): Promise<void> => {
      const data = await readClaudeJson()
      if (data.projects[request.path]) {
        data.projects[request.path] = { ...data.projects[request.path], ...request.config }
        await writeClaudeJson(data)
      }
    }
  )

  ipcMain.handle(CLAUDE_PROJECT_CHANNELS.DELETE_PROJECT, async (_, path: string): Promise<void> => {
    const data = await readClaudeJson()
    delete data.projects[path]
    await writeClaudeJson(data)
  })
}
