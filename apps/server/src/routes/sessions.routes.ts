import type { FastifyInstance } from 'fastify'
import {
  appendTranscriptSchema,
  createSessionSchema,
  sessionIdParamSchema,
  updateSessionStateSchema,
  ValidationError,
} from '@nexoprep/shared'
import type { TranscriptEntryInput } from '@nexoprep/types'
import type { UpdateSessionStateInput } from '@nexoprep/session-service'

export async function registerSessionRoutes(server: FastifyInstance): Promise<void> {
  server.post('/', async (request, reply) => {
    const parsed = createSessionSchema.safeParse(request.body)
    if (!parsed.success) throw new ValidationError('Invalid session payload', parsed.error.flatten())
    const session = await server.container.sessionService.createSession(parsed.data)
    return reply.status(201).send({ session })
  })

  server.get('/:sessionId', async (request) => {
    const params = sessionIdParamSchema.parse(request.params)
    const session = await server.container.prisma.interviewSession.findUnique({
      where: { id: params.sessionId },
      include: {
        rounds: { orderBy: { sequence: 'asc' } },
        transcripts: { orderBy: { sequence: 'asc' } },
        behaviorMetrics: true,
        emotionStates: true,
        scores: true,
        feedbackReport: true,
        roadmap: true,
        eventLogs: { orderBy: { occurredAt: 'desc' }, take: 100 },
      },
    })
    return { session }
  })

  server.get('/:sessionId/state', async (request) => {
    const params = sessionIdParamSchema.parse(request.params)
    const state = await server.container.sessionService.restoreSession(params.sessionId)
    return { state }
  })

  server.patch('/:sessionId/state', async (request) => {
    const params = sessionIdParamSchema.parse(request.params)
    const parsed = updateSessionStateSchema.safeParse(request.body)
    if (!parsed.success) throw new ValidationError('Invalid session state payload', parsed.error.flatten())
    const stateInput: UpdateSessionStateInput = parsed.data
    const state = await server.container.sessionService.updateState(params.sessionId, stateInput)
    return { state }
  })

  server.post('/:sessionId/transcripts', async (request, reply) => {
    const params = sessionIdParamSchema.parse(request.params)
    const parsed = appendTranscriptSchema.safeParse(request.body)
    if (!parsed.success) throw new ValidationError('Invalid transcript payload', parsed.error.flatten())
    const transcriptInput: TranscriptEntryInput = {
      ...parsed.data,
      sessionId: params.sessionId,
    }
    const transcript = await server.container.sessionService.appendTranscript(transcriptInput)
    return reply.status(201).send({ transcript })
  })

  // Read-only monitoring endpoint — never used to control the Behavior
  // Engine lifecycle (that's driven entirely by SESSION_STARTED /
  // SESSION_UPDATED events). Lets the UI show tracking availability
  // without any popup/manual-launch logic.
  server.get('/:sessionId/behavior/status', async (request) => {
    const params = sessionIdParamSchema.parse(request.params)
    const status = server.container.behaviorEngine.getStatus(params.sessionId)
    return { status: status ?? { status: 'unavailable', pid: null, exitCode: null } }
  })
}
