# NexoPrep Phase History

--------------------------------

## Phase 1

Completed

Core Interview Platform

Achievements

- Frontend
- Backend
- Resume Upload
- Dashboard
- Database
- Session Management

--------------------------------

## Phase 2A

Completed

Voice Interview

Achievements

- ElevenLabs
- Gemini
- Voice Conversation
- WebRTC

--------------------------------

## Phase 2B

Completed

Interview Stability

Achievements

- Reconnect Fix
- Memory Fix
- Transcript Persistence
- Backend Synchronization

--------------------------------

## Phase 2C

Completed

Interview Intelligence

Achievements

- Resume Context Injection
- Candidate Profile
- Stage Machine
- Adaptive Follow-ups
- Question Diversity
- Answer Scoring
- Gemini Diagnostics
- Environment Fix
- Custom LLM Debugging

Major Milestone

AI now understands

- Resume
- Projects
- Skills
- Company
- Role
- Difficulty

--------------------------------

## Current Phase

Phase 3A — Behavior Engine Modularization ✅
Split monolithic engine into modules.
Preserved all algorithms.
No scoring or detection changes.
Phase 3B — Backend Lifecycle Integration ✅

Completed:

Event-driven launcher
Automatic process management
Cross-platform launcher improvements
Repository root resolution
Python executable auto-detection
Automatic startup
Automatic shutdown
Graceful termination
Improved diagnostics

Validation:

Python launches automatically.
Webcam opens automatically.
Backend starts and stops the engine.
Interview continues independently if the engine fails.

Phase 3B.1 — Windows Launcher Fix ✅

Root cause: BEHAVIOR_ENGINE_DIR was resolved against process.cwd(),
which under npm workspaces is apps/server, not the repo root; and
BEHAVIOR_ENGINE_PYTHON_BIN had a single hardcoded value with no
fallback. Fixed with a workspaces-root walk-up and a cross-platform
Python candidate list. Validated on Windows: no ENOENT, correct
directory resolution, launch diagnostics logged.

Phase 3C — Headless Engine + React Integration ✅

Completed:

Removed cv2.imshow/waitKey/keyboard workflow — backend is now the
only controller (process launch = start, SIGTERM = graceful stop).
Local-only MJPEG streaming from the Python engine.
Node proxy route for the stream (GET /:sessionId/behavior/stream).
BehaviorCameraCard React component, placed beneath the AI Interviewer
card in the interview page's left column, with a placeholder metrics
row for future phases.

Preserved: all Phase 3A detection/scoring/tracking/report algorithms
— verified byte-identical except config.py's INTERVIEW_DURATION
(120 -> 0, a session-duration setting, not a detection threshold).

Known carry-over to future phases:

Placeholder metrics row in BehaviorCameraCard is not yet wired to
live values.
BehaviorMetric/EmotionState DB tables exist in the schema but nothing
ingests the report JSON into them yet.