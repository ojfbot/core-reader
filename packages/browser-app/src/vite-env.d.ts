/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CORE_READER_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
