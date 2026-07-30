import { useEffect, useMemo } from 'react'
import { useInterviewModule } from '../context/InterviewContext'

export function useInterviewSession({ autoBootstrap = false, config, resume = null } = {}) {
  const { session, status, errors, actions } = useInterviewModule()

  useEffect(() => {
    if (autoBootstrap && !session) {
      actions.bootstrap(config, resume)
    }
  }, [actions, autoBootstrap, config, resume, session])

  useEffect(() => {
    if (session) actions.persist()
  }, [actions, session])

  const currentQuestion = useMemo(() => {
    if (!session?.questions?.length) return null
    return session.questions[session.currentQuestionIndex] || null
  }, [session])

  const currentRoundIndex = useMemo(() => {
    if (!session?.rounds?.length || !currentQuestion) return 0
    const id = currentQuestion.parentQuestionId || currentQuestion.id
    const idx = session.rounds.findIndex((r) => r.questionIds.includes(id))
    return idx === -1 ? 0 : idx
  }, [currentQuestion, session?.rounds])

  return { session, status, errors, actions, currentQuestion, currentRoundIndex }
}

