import { api } from './api'
import type { RankingJob } from '../types/api'
export async function createRanking(files: { candidates: File; jobDescription: File; metadata?: File }): Promise<RankingJob> { const form = new FormData(); form.append('candidates', files.candidates); form.append('job_description', files.jobDescription); if (files.metadata) form.append('metadata', files.metadata); return (await api.post<RankingJob>('/rankings', form)).data }
