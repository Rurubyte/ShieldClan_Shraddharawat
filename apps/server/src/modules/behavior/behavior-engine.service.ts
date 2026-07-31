import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { FastifyBaseLogger } from 'fastify'
import type { AppConfig } from '@nexoprep/config'
import { resolveRepoRoot, resolvePythonExecutable, getFreePort } from './launcher-utils.js'

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
 * Responsibilities:
 *   - launch one Python process per interview session
 *   - track it by sessionId (never share/reuse a process across sessions)
 *   - allocate each session its own local MJPEG stream port (Phase 3C)
 *   - detect unexpected exits
 *   - log stdout/stderr
 *   - terminate gracefully on interview end (SIGTERM — the Python side
 *     now traps this and finalizes its own report before exiting; no
 *     keyboard/desktop interaction is involved anywhere in this flow)
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
  streamPort: number
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
  async start(sessionId: string): Promise<void> {
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

    // ── Resolve cwd, python executable, entrypoint, and a free local
    //    port for this session's MJPEG stream — with full diagnostics
    //    logged before we even attempt to spawn anything ──
    const { root: repoRoot, resolvedFrom: rootResolvedFrom } = resolveRepoRoot()
    const cwd = path.resolve(repoRoot, this.config.BEHAVIOR_ENGINE_DIR)
    const entrypoint = this.config.BEHAVIOR_ENGINE_ENTRYPOINT
    const entrypointPath = path.join(cwd, entrypoint)
    const entrypointExists = existsSync(entrypointPath)

    const { command: pythonBin, resolvedFrom: pythonResolvedFrom, candidatesTried } =
      resolvePythonExecutable(this.config.BEHAVIOR_ENGINE_PYTHON_BIN)

    let streamPort: number
    try {
      streamPort = await getFreePort()
    } catch (error) {
      this.logger.error({ sessionId, error }, '[BEHAVIOR_ENGINE_ERROR] could not allocate a stream port — continuing without live preview')
      streamPort = 0
    }

    this.logger.info(
      {
        sessionId,
        repoRoot,
        repoRootResolvedFrom: rootResolvedFrom,
        cwd,
        entrypoint,
        entrypointPath,
        entrypointExists,
        pythonBin,
        pythonResolvedFrom,
        pythonCandidatesTried: candidatesTried,
        streamPort: streamPort || null,
      },
      '[BEHAVIOR_ENGINE_LAUNCH_DIAGNOSTICS]',
    )

    if (!entrypointExists) {
      this.logger.error(
        { sessionId, entrypointPath, cwd },
        '[BEHAVIOR_ENGINE_ERROR] entrypoint not found — check BEHAVIOR_ENGINE_DIR/BEHAVIOR_ENGINE_ENTRYPOINT; interview continues without behavior tracking',
      )
      return
    }

    let child: ChildProcess
    const spawnCommand = `${pythonBin} ${entrypoint}`
    try {
      child = spawn(pythonBin, [entrypoint], {
        cwd,
        // stdin is now a real pipe (was 'ignore') — stop() writes a
        // "STOP\n" line to it as the graceful-shutdown signal. See the
        // note on stop() for why this replaced SIGTERM as the primary
        // mechanism.
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          ...(streamPort ? { BEHAVIOR_ENGINE_STREAM_PORT: String(streamPort) } : {}),
        },
        // Detached=false: the child dies with the Node process (belt-and-braces
        // alongside the explicit onClose() cleanup in container.ts).
        detached: false,
      })
    } catch (error) {
      this.logger.error({ sessionId, spawnCommand, cwd, error }, '[BEHAVIOR_ENGINE_ERROR] failed to spawn process')
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
      streamPort,
    }
    this.processes.set(sessionId, tracked)

    this.logger.info({ sessionId, pid, cwd, entrypoint, pythonBin, streamPort }, '[BEHAVIOR_ENGINE_START]')

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
      const code = (error as NodeJS.ErrnoException).code
      const diagnosis =
        code === 'ENOENT'
          ? `no working Python interpreter found — tried [${candidatesTried.join(', ')}]; set BEHAVIOR_ENGINE_PYTHON_BIN to an absolute path (e.g. C:\\Python312\\python.exe) if none of these are on PATH`
          : 'unexpected spawn error'
      this.logger.error(
        { sessionId, pid, spawnCommand, cwd, errorCode: code, error, diagnosis },
        '[BEHAVIOR_ENGINE_ERROR] process error — behavior tracking unavailable for this session',
      )
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
   * Stops the Behavior Engine for a session (interview end). The
   * *primary* graceful-shutdown signal is a "STOP\n" line written to the
   * child's stdin — engine.py reads this on a background thread and
   * finalizes its report before exiting (same report generation the old
   * [E] keypress used to trigger). This is deliberately NOT SIGTERM:
   * on Windows, Node's child_process has no real signal delivery — 
   * `child.kill('SIGTERM')` calls TerminateProcess() under the hood,
   * which ends the process immediately and never gives Python's
   * `signal.signal(SIGTERM, ...)` handler a chance to run, so the report
   * was silently never written. A stdin write has no such platform gap.
   * SIGTERM is still sent alongside it (harmless, and still the real
   * graceful path on POSIX); SIGKILL remains the hard fallback if the
   * process hasn't exited within BEHAVIOR_ENGINE_STOP_TIMEOUT_MS.
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
    this.logger.info({ sessionId, pid: tracked.pid }, '[BEHAVIOR_ENGINE_STOP] requesting graceful shutdown')

    try {
      tracked.child.stdin?.write('STOP\n')
    } catch (error) {
      this.logger.warn({ sessionId, pid: tracked.pid, error }, '[BEHAVIOR_ENGINE_ERROR] stdin STOP write failed')
    }

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

  /**
   * Where this session's live MJPEG stream is being served (loopback
   * only — the frontend never talks to this port directly, it goes
   * through the Node proxy route). Returns null if there is no running
   * engine for this session, it wasn't given a port, or it hasn't
   * confirmed it's alive yet (status 'starting' — MediaPipe model
   * loading + camera open can take several seconds, during which the
   * stream server socket isn't bound yet; returning the port during
   * that window is what caused ECONNREFUSED). The frontend's retry loop
   * (see BehaviorCameraCard) covers the remaining small gap between
   * 'running' and the stream socket actually being bound.
   */
  getStreamTarget(sessionId: string): { host: '127.0.0.1'; port: number } | null {
    const tracked = this.processes.get(sessionId)
    if (!tracked || !tracked.streamPort) return null
    if (tracked.status !== 'running') return null
    return { host: '127.0.0.1', port: tracked.streamPort }
  }

  /** Terminates every tracked process. Called once, on server shutdown. */
  stopAll(): void {
    for (const sessionId of this.processes.keys()) {
      this.stop(sessionId)
    }
  }
}
