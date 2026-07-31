import { api } from './api'
import type { RankingJob } from '../types/api'
export const getRankingStatus = async (id: string) => (await api.get<RankingJob>(`/rankings/${id}/status`)).data
