import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import type { FastifyBaseLogger } from 'fastify'
import type { AppConfig } from '@nexoprep/config'

/**
 * BehaviorEngineService
 *
 * Owns the Node <-> Python process boundary for the Behavior Engine
 * (behavior-engine/main.py). It does NOT know anything about posture,
 * gaze, scoring, or report formats — that logic is entirely inside the
 * Python engine and is never touched here (see docs/architecture.md,
 * Rule 2 & Rule 3: the Behavior Engine only observes, and its internals
 * are never modified by the backend).
 *
 * Responsibilities (per Phase 3B scope):
 *   - launch one Python process per interview session
 *   - track it by sessionId (never share/reuse a process across sessions)
 *   - detect unexpected exits
 *   - log stdout/stderr
 *   - terminate gracefully on interview end
 *   - never let a Behavior Engine failure crash NexoPrep
 */

export type BehaviorEngineStatus = 'starting' | 'running' | 'stopping' | 'stopped' | 'crashed' | 'unavailable'

interface TrackedProcess {
  sessionId: string
  pid: number
  child: ChildProcess
  status: BehaviorEngineStatus
  startedAt: string
  exitCode: number | null
}

export class BehaviorEngineService {
  private readonly processes = new Map<string, TrackedProcess>()

  constructor(
    private readonly config: AppConfig,
    private readonly logger: FastifyBaseLogger,
  ) {}

  isEnabled(): boolean {
    return this.config.BEHAVIOR_ENGINE_ENABLED
  }

  /**
   * Starts the Behavior Engine for a session. No-op (with a warning log)
   * if a process is already tracked for this sessionId — this is what
   * prevents duplicate launches / multiple engines per interview.
   *
   * Never throws: a launch failure (missing python, missing engine dir,
   * etc.) is logged as [BEHAVIOR_ENGINE_ERROR] and the interview
   * continues without behavior tracking.
   */
  start(sessionId: string): void {
    if (!this.isEnabled()) {
      this.logger.info({ sessionId }, '[BEHAVIOR_ENGINE_DISABLED] skipping start')
      return
    }

    const existing = this.processes.get(sessionId)
    if (existing && (existing.status === 'starting' || existing.status === 'running')) {
      this.logger.warn(
        { sessionId, pid: existing.pid },
        '[BEHAVIOR_ENGINE_DUPLICATE] engine already running for this session — ignoring duplicate start',
      )
      return
    }

    const cwd = path.resolve(this.config.BEHAVIOR_ENGINE_DIR)
    const entrypoint = this.config.BEHAVIOR_ENGINE_ENTRYPOINT
    const pythonBin = this.config.BEHAVIOR_ENGINE_PYTHON_BIN

    let child: ChildProcess
    try {
      child = spawn(pythonBin, [entrypoint], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        // Detached=false: the child dies with the Node process (belt-and-braces
        // alongside the explicit onClose() cleanup in container.ts).
        detached: false,
      })
    } catch (error) {
      this.logger.error({ sessionId, error }, '[BEHAVIOR_ENGINE_ERROR] failed to spawn process')
      return
    }

    // spawn() itself may still fail asynchronously (e.g. ENOENT if python
    // isn't installed) — that surfaces on the 'error' event, not a thrown
    // exception, so we handle it below rather than around spawn().
    const pid = child.pid ?? -1
    const tracked: TrackedProcess = {
      sessionId,
      pid,
      child,
      status: 'starting',
      startedAt: new Date().toISOString(),
      exitCode: null,
    }
    this.processes.set(sessionId, tracked)

    this.logger.info({ sessionId, pid, cwd, entrypoint, pythonBin }, '[BEHAVIOR_ENGINE_START]')

    child.stdout?.on('data', (chunk: Buffer) => {
      this.logger.info({ sessionId, pid }, `[BEHAVIOR_ENGINE_STDOUT] ${chunk.toString().trim()}`)
      if (tracked.status === 'starting') tracked.status = 'running'
    })

    child.stderr?.on('data', (chunk: Buffer) => {
      this.logger.warn({ sessionId, pid }, `[BEHAVIOR_ENGINE_STDERR] ${chunk.toString().trim()}`)
    })

    child.on('error', (error) => {
      // e.g. python binary not found — must not crash the interview
      tracked.status = 'unavailable'
      this.logger.error({ sessionId, pid, error }, '[BEHAVIOR_ENGINE_ERROR] process error — behavior tracking unavailable for this session')
    })

    child.on('exit', (code, signal) => {
      tracked.exitCode = code
      const wasIntentional = tracked.status === 'stopping'
      tracked.status = wasIntentional ? 'stopped' : code === 0 ? 'stopped' : 'crashed'
      this.logger.info(
        { sessionId, pid, exitCode: code, signal, wasIntentional },
        '[BEHAVIOR_ENGINE_EXIT]',
      )
      if (!wasIntentional && code !== 0) {
        this.logger.warn(
          { sessionId, pid, exitCode: code },
          '[BEHAVIOR_ENGINE_ERROR] engine exited unexpectedly — interview continues unaffected',
        )
      }
      // Keep the final record around briefly for status checks, but drop the
      // ChildProcess handle so it can be garbage collected.
      this.processes.set(sessionId, { ...tracked })
    })
  }

  /**
   * Stops the Behavior Engine for a session (interview end). Sends SIGTERM
   * and gives the process BEHAVIOR_ENGINE_STOP_TIMEOUT_MS to exit on its
   * own (it needs a moment to finish writing reports) before SIGKILL.
   *
   * Never throws — if nothing is tracked for this sessionId, this is a
   * no-op (e.g. engine was never enabled, or already stopped).
   */
  stop(sessionId: string): void {
    const tracked = this.processes.get(sessionId)
    if (!tracked || tracked.status === 'stopped' || tracked.status === 'crashed' || tracked.status === 'unavailable') {
      return
    }

    tracked.status = 'stopping'
    this.logger.info({ sessionId, pid: tracked.pid }, '[BEHAVIOR_ENGINE_STOP] sending SIGTERM')

    try {
      tracked.child.kill('SIGTERM')
    } catch (error) {
      this.logger.warn({ sessionId, pid: tracked.pid, error }, '[BEHAVIOR_ENGINE_ERROR] SIGTERM failed')
    }

    const timeout = setTimeout(() => {
      if (this.processes.get(sessionId)?.status === 'stopping') {
        this.logger.warn(
          { sessionId, pid: tracked.pid },
          '[BEHAVIOR_ENGINE_STOP] did not exit in time — sending SIGKILL',
        )
        try {
          tracked.child.kill('SIGKILL')
        } catch (error) {
          this.logger.error({ sessionId, pid: tracked.pid, error }, '[BEHAVIOR_ENGINE_ERROR] SIGKILL failed')
        }
      }
    }, this.config.BEHAVIOR_ENGINE_STOP_TIMEOUT_MS)
    timeout.unref()
  }

  /** Read-only status lookup — used for monitoring, never for control flow. */
  getStatus(sessionId: string): { status: BehaviorEngineStatus; pid: number | null; exitCode: number | null } | null {
    const tracked = this.processes.get(sessionId)
    if (!tracked) return null
    return { status: tracked.status, pid: tracked.pid, exitCode: tracked.exitCode }
  }

  /** Terminates every tracked process. Called once, on server shutdown. */
  stopAll(): void {
    for (const sessionId of this.processes.keys()) {
      this.stop(sessionId)
    }
  }
}
