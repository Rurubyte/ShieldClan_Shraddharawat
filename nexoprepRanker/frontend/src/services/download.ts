import { api } from './api'
import type { DownloadFile } from '../types/api'
export const getDownloads = async (id: string) => (await api.get<DownloadFile[]>(`/rankings/${id}/downloads`)).data
