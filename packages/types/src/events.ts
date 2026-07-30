import type { ActiveSessionState, EventSeverity } from './domain.js'
import type { PersistedReport } from './reports.js'

export const REALTIME_EVENT_TYPES = [
  'SESSION_STARTED',
  'SESSION_UPDATED',
  'TRANSCRIPT_UPDATED',
  'REPORT_UPDATED',
  'USER_CONNECTED',
  'CONVERSATION_STARTED',
  'AI_SPEAKING',
  'USER_SPEAKING',
  'TRANSCRIPT_PARTIAL',
  'TRANSCRIPT_FINAL',
  'AI_THINKING',
  'CONVERSATION_ERROR',
  'CONVERSATION_ENDED',
] as const

export type ConversationLifecycle =
  | 'setup'
  | 'connecting'
  | 'listening'
  | 'ai_processing'
  | 'ai_speaking'
  | 'completed'

export type RealtimeEventType = (typeof REALTIME_EVENT_TYPES)[number]

export interface RealtimeEventPayloads {
  SESSION_STARTED: {
    sessionId: string
    userId: string
    state: ActiveSessionState
  }
  SESSION_UPDATED: {
    sessionId: string
    userId: string
    state: ActiveSessionState
  }
  TRANSCRIPT_UPDATED: {
    sessionId: string
    userId: string
    transcriptId?: string
    sequence: number
    content: string
    speaker: string
  }
  REPORT_UPDATED: {
    sessionId: string
    userId: string
    report: PersistedReport
  }
  USER_CONNECTED: {
    userId: string
    connectionId: string
    connectedAt: string
  }
  CONVERSATION_STARTED: {
    sessionId: string
    userId: string
    lifecycle: ConversationLifecycle
  }
  AI_SPEAKING: {
    sessionId: string
    userId: string
  }
  USER_SPEAKING: {
    sessionId: string
    userId: string
  }
  TRANSCRIPT_PARTIAL: {
    sessionId: string
    userId: string
    speaker: string
    content: string
    sequence?: number
  }
  TRANSCRIPT_FINAL: {
    sessionId: string
    userId: string
    speaker: string
    content: string
    sequence: number
    transcriptId?: string
  }
  AI_THINKING: {
    sessionId: string
    userId: string
  }
  CONVERSATION_ERROR: {
    sessionId: string
    userId: string
    message: string
  }
  CONVERSATION_ENDED: {
    sessionId: string
    userId: string
    lifecycle: ConversationLifecycle
  }
}

export interface RealtimeEvent<TType extends RealtimeEventType = RealtimeEventType> {
  id: string
  type: TType
  occurredAt: string
  correlationId?: string | undefined
  severity: EventSeverity
  payload: RealtimeEventPayloads[TType]
}

export interface EventPublisher {
  publish<TType extends RealtimeEventType>(event: RealtimeEvent<TType>): Promise<void>
}

export interface EventSubscriber {
  subscribe(handler: (event: RealtimeEvent) => Promise<void> | void): Promise<() => Promise<void>>
}
