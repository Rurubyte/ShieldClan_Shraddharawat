import { useEffect, useMemo, useRef } from 'react'
import { useInterviewModule } from '../context/InterviewContext'

export function useInterviewSession({ autoBootstrap = false, config, resume = null } = {}) {
  const { session, status, errors, actions } = useInterviewModule()
  const bootstrapInFlight = useRef(false)

  useEffect(() => {
    if (!autoBootstrap || session) return
    // Guard against re-entrant bootstrap calls: `actions` is only stable
    // while its own dependencies (bootstrapConfig/resume/userId) are
    // stable, so if any of those change identity while a bootstrap is
    // still in flight, this effect re-runs before `session` is set —
    // and without this guard, each re-run fires another
    // POST /api/sessions (and, since Phase 3B, another Behavior Engine
    // process). `session` alone can't guard this because it only
    // updates after the async call resolves.
    if (bootstrapInFlight.current) return
    bootstrapInFlight.current = true
    Promise.resolve(actions.bootstrap(config, resume)).finally(() => {
      bootstrapInFlight.current = false
    })
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

