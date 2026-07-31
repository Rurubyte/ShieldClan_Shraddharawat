import axios from 'axios'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api', timeout: 20_000 })
export const apiError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return 'An unexpected error occurred.'
  const body = error.response?.data as { message?: string; detail?: string } | undefined
  return body?.message ?? body?.detail ?? error.message
}
