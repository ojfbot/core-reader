const BASE_URL = import.meta.env.VITE_CORE_READER_API_URL || 'http://localhost:3016'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`)
  return res.json() as Promise<T>
}

export const api = {
  commands: {
    list: () => get<import('../store/slices/commandsSlice').CommandManifest[]>('/api/commands'),
    get: (name: string) => get<import('../store/slices/commandsSlice').CommandManifest>(`/api/commands/${name}`),
  },
  adrs: {
    list: (status?: string) =>
      get<import('../store/slices/adrsSlice').ADRManifest[]>(
        status ? `/api/adrs?status=${encodeURIComponent(status)}` : '/api/adrs'
      ),
    get: (number: string) => get<import('../store/slices/adrsSlice').ADRManifest>(`/api/adrs/${number}`),
  },
  roadmap: {
    list: () => get<import('../store/slices/roadmapSlice').RoadmapPhase[]>('/api/roadmap'),
  },
}
