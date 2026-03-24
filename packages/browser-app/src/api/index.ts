// In production (same-origin Vercel deployment) use relative URLs.
// For local dev, point at the API server: VITE_CORE_READER_API_URL=http://localhost:3016
const BASE_URL: string = import.meta.env.VITE_CORE_READER_API_URL
  ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`)
  return res.json() as Promise<T>
}

export const api = {
  skills: {
    list: () => get<import('../store/slices/skillsSlice').SkillManifest[]>('/api/skills'),
    get: (name: string) => get<import('../store/slices/skillsSlice').SkillManifest>(`/api/skills/${name}`),
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
