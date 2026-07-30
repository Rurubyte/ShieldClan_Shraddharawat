import type { AnswerScore, InterviewSummary } from '@nexoprep/types'
import type { ConversationMemory } from '../conversation/memory.service.js'
import { GeminiService } from './gemini.service.js'

export class InterviewSummaryService {
  constructor(private readonly gemini: GeminiService) {}

  buildHeuristicSummary(memory: ConversationMemory): InterviewSummary {
    const avgScore =
      memory.answerScores.length > 0
        ? memory.answerScores.reduce((sum, s) => sum + s.average, 0) / memory.answerScores.length
        : 5

    return {
      strengths: memory.candidateStrengths.slice(0, 5),
      weaknesses: memory.candidateWeaknesses.slice(0, 5),
      keyTopics: memory.coveredTopics.slice(0, 10),
      recommendations: this.buildRecommendations(memory),
      overallRating: Math.round(avgScore * 10) / 10,
      generatedAt: new Date().toISOString(),
    }
  }

  async generateSummary(memory: ConversationMemory): Promise<InterviewSummary> {
    const heuristic = this.buildHeuristicSummary(memory)
    if (!this.gemini.isConfigured()) return heuristic

    try {
      const prompt = [
        'Generate an interview summary JSON for a completed mock interview.',
        `Role: ${memory.role}`,
        `Company: ${memory.company}`,
        `Difficulty: ${memory.difficulty}`,
        `Stages completed: ${memory.interviewStage}`,
        `Asked questions: ${memory.askedQuestions.slice(-12).join(' | ')}`,
        `Strong topics: ${memory.strongTopics.join(', ')}`,
        `Weak topics: ${memory.weakTopics.join(', ')}`,
        `Average answer scores: ${memory.answerScores.map((s) => s.average).join(', ')}`,
        'Return ONLY valid JSON with keys: strengths (string[]), weaknesses (string[]), keyTopics (string[]), recommendations (string[]), overallRating (number 0-10).',
      ].join('\n')

      const raw = await this.gemini.generateText(
        'You produce concise interview summaries as strict JSON.',
        prompt,
      )
      const parsed = JSON.parse(raw) as Partial<InterviewSummary>
      return {
        strengths: parsed.strengths?.length ? parsed.strengths : heuristic.strengths,
        weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : heuristic.weaknesses,
        keyTopics: parsed.keyTopics?.length ? parsed.keyTopics : heuristic.keyTopics,
        recommendations: parsed.recommendations?.length ? parsed.recommendations : heuristic.recommendations,
        overallRating: typeof parsed.overallRating === 'number' ? parsed.overallRating : heuristic.overallRating,
        generatedAt: new Date().toISOString(),
      }
    } catch {
      return heuristic
    }
  }

  toReportPayload(summary: InterviewSummary, scores: AnswerScore[]) {
    const latest = scores[scores.length - 1]
    return {
      summary: [
        `Overall rating: ${summary.overallRating}/10`,
        `Strengths: ${summary.strengths.join('; ') || 'N/A'}`,
        `Weaknesses: ${summary.weaknesses.join('; ') || 'N/A'}`,
        `Key topics: ${summary.keyTopics.join('; ') || 'N/A'}`,
        `Recommendations: ${summary.recommendations.join('; ') || 'N/A'}`,
      ].join('\n'),
      aiFeedback: {
        interviewSummary: summary,
        latestAnswerScore: latest || null,
      },
      behavioralSummary: {
        strongTopics: summary.strengths,
        weakTopics: summary.weaknesses,
      },
      scores: this.toScoreInputs(scores, summary.overallRating),
    }
  }

  private toScoreInputs(scores: AnswerScore[], overallRating: number) {
    if (!scores.length) {
      return [
        { domain: 'overall', scoreType: 'interview_rating', value: overallRating, weight: 1 },
      ]
    }

    const latest = scores[scores.length - 1] as AnswerScore
    return [
      { domain: 'overall', scoreType: 'interview_rating', value: overallRating, weight: 1 },
      { domain: 'technical', scoreType: 'technical_depth', value: latest.technicalDepth, weight: 1 },
      { domain: 'communication', scoreType: 'communication', value: latest.communication, weight: 1 },
      { domain: 'communication', scoreType: 'clarity', value: latest.clarity, weight: 1 },
      { domain: 'technical', scoreType: 'completeness', value: latest.completeness, weight: 1 },
      { domain: 'confidence', scoreType: 'confidence', value: latest.confidence, weight: 1 },
    ]
  }

  private buildRecommendations(memory: ConversationMemory): string[] {
    const recs: string[] = []
    if (memory.weakTopics.length) {
      recs.push(`Review and practice: ${memory.weakTopics.slice(0, 3).join(', ')}`)
    }
    if (memory.candidateWeaknesses.length) {
      recs.push(`Improve: ${memory.candidateWeaknesses.slice(0, 2).join('; ')}`)
    }
    if (!recs.length) recs.push('Continue practicing role-specific technical and behavioral questions.')
    return recs.slice(0, 5)
  }
}
