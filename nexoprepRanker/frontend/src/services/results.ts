import { api } from './api'
import type { Candidate, RankingResults } from '../types/api'
export const getResults = async (id: string) => (await api.get<RankingResults>(`/rankings/${id}/results`)).data
export const getCandidate = async (rankingId: string, candidateId: string) => (await api.get<Candidate>(`/rankings/${rankingId}/candidates/${candidateId}`)).data
