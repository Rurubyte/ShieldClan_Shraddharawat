# 🧠 NexoPrep AI Brain
Version: 1.0
Last Updated: July 2026

---

# PURPOSE

This file is the persistent memory of the NexoPrep project.

Every AI assistant (Cursor, Claude, ChatGPT, Gemini, etc.) MUST read this file completely before modifying any code.

This document contains the current project state, completed features, architecture decisions, project philosophy, and development roadmap.

Do NOT rewrite existing working systems unless explicitly instructed.

Always preserve existing functionality.

---

# PROJECT OVERVIEW

Project Name:
NexoPrep

Tagline:
AI Powered Interview Preparation & Behavioral Analysis Platform

Purpose:

NexoPrep is an AI interview simulator that conducts realistic voice interviews while simultaneously analyzing candidate behavior.

The system consists of two completely independent engines:

1. Interview Intelligence Engine
2. Behavioral Intelligence Engine

Both engines run simultaneously during an interview but remain completely isolated from each other.

Only the final reports may later be merged.

---

# PROJECT GOALS

NexoPrep should provide:

• Realistic AI interviewer
• Resume-aware conversations
• Adaptive follow-up questions
• Company specific interviews
• Role specific interviews
• Difficulty based interviews
• Behavioral posture analysis
• Eye contact analysis
• Gesture analysis
• Professional reports
• Overall interview analytics

---

# CORE DESIGN PRINCIPLES

The following principles MUST NEVER be violated.

## Rule 1

Interview Engine and Behavior Engine are independent systems.

Behavior Engine must NEVER affect:

- Gemini prompts
- Interview flow
- Memory
- Conversation
- Transcript generation
- Question selection

Behavior Engine only observes.

---

## Rule 2

Interview quality always has highest priority.

Behavior analysis must never slow down the interview.

---

## Rule 3

Behavior Engine can fail safely.

If Python crashes:

Interview must continue.

---

## Rule 4

Never remove existing functionality.

Only extend.

---

## Rule 5

Always build production-ready architecture.

Avoid temporary hacks.

---

# CURRENT ARCHITECTURE

Frontend

React
TypeScript
Vite

↓

Backend

Node.js
Express

↓

AI

Gemini 2.5 Flash

↓

Voice

ElevenLabs Conversational AI

↓

Database

PostgreSQL

↓

Redis

Conversation Memory

---

# CURRENT INTERVIEW PIPELINE

Resume Upload

↓

Resume Processing

↓

Conversation Memory

↓

System Prompt Builder

↓

Gemini

↓

ElevenLabs Voice

↓

User Response

↓

Transcript

↓

Conversation Memory Update

↓

Next Question

---

# CURRENT FEATURES COMPLETED

## Authentication

Completed

---

## Resume Upload

Completed

---

## Resume Parsing

Completed

---

## Resume Summary Generation

Completed

---

## Candidate Memory

Completed

---

## Conversation Memory

Completed

---

## Adaptive Follow-up Questions

Completed

---

## Company Specific Interviews

Completed

---

## Role Specific Interviews

Completed

---

## Difficulty Levels

Completed

---

## Resume Based Questions

Completed

---

## Dynamic Prompt Builder

Completed

---

## Voice Interview

Completed

---

## ElevenLabs Integration

Completed

---

## Gemini Integration

Completed

---

## Transcript Storage

Completed

---

## Interview Dashboard

Basic version completed.

---

# GEMINI STATUS

Status:

Working

Known fixes already completed:

✔ Invalid API key fixed

✔ Environment loading fixed

✔ Monorepo dotenv loading fixed

✔ Resume prompt injection fixed

✔ System prompt validation completed

Resume is now correctly available inside Gemini prompts.

Example:

Agent can correctly answer:

"Yes, I have your resume."

and references projects from resume.

---

# CURRENT BEHAVIOR ENGINE

Status:

Fully functional standalone Python application.

Technology:

Python

OpenCV

MediaPipe

NumPy

Matplotlib

Capabilities:

• Posture Detection

• Head Tilt

• Eye Contact

• Iris Tracking

• Facial Expressions

• Hand Gestures

• Movement Stability

• Attention Score

• Engagement Score

• Warning Detection

• Timeline Tracking

• Scorecards

• Graph Generation

• JSON Reports

• TXT Reports

Current report storage:

Local filesystem

Behavior engine currently starts manually.

It is NOT integrated into NexoPrep yet.

---

update done - 


Behavior engine is now backend-managed.
Backend launches it automatically.
Event-driven lifecycle.
No manual python main.py workflow.
phase-history.md

update done 2 - 

Behavior Engine Integration
Behavior Engine is no longer a standalone workflow.
Backend owns the lifecycle.
Starting an interview automatically launches the Python engine.
Ending an interview automatically terminates the engine.
Event-driven orchestration remains the integration mechanism.
The launcher automatically resolves the repository root and Python executable.
The Behavior Engine remains an independent Python subsystem; only its lifecycle is managed by the backend.
Current limitation: the engine still runs in OpenCV standalone UI mode (cv2.imshow) and still exposes the legacy keyboard controls (S, E, Q). These will be removed in Phase 3C.

# CURRENT DEVELOPMENT PHASE

Current Phase

Phase 3C.3

Behavior Engine Integration Stabilization (Final)

Status

In Progress

--------------------------------------------

Completed

Phase 3A
Behavior Engine successfully modularized.
Detection, scoring, tracking and reporting algorithms preserved.

Phase 3B
Behavior Engine fully integrated into the backend lifecycle.
Interview automatically launches and stops the engine.

Phase 3C
Headless architecture completed.

Implemented

• Headless execution
• Backend orchestration
• React Behavior Camera panel
• MJPEG streaming architecture
• Live metrics architecture
• Local report architecture
• Automatic lifecycle

Phase 3C.1

Completed

• Windows launcher fixes
• Cross-platform Python resolution
• stdin graceful shutdown
• Improved launcher diagnostics
• Metrics endpoint

Phase 3C.2

Completed

Successfully achieved:

✓ Behavior Engine launches automatically.

✓ Python process launches correctly.

✓ MediaPipe initializes correctly.

✓ Webcam starts automatically.

✓ Live behavior metrics update correctly inside React.

✓ Backend lifecycle integration works.

--------------------------------------------

Remaining Integration Issues

1.

React MJPEG preview is still not visible although MediaPipe is processing frames.

2.

Behavior reports are not generated after interview completion.

3.

After interview completion another interview session is unintentionally created, launching another Behavior Engine instance.

--------------------------------------------

Important

The Behavior Engine itself is considered stable.

Detection algorithms

Tracking

Scoring

Thresholds

MediaPipe pipeline

Behavior calculations

Report calculations

remain unchanged.

Only the integration layer still requires stabilization.

--------------------------------------------

Current Goal

Complete Phase 3C.3 by fixing only:

• MJPEG stream delivery
• Report finalization
• Duplicate session lifecycle

No architecture redesign.
No algorithm changes.

# PHASE ROADMAP

Phase 1

Core Interview Platform

Completed ✅

---

Phase 2

AI Interview Intelligence

Completed ✅

---

Phase 3A

Behavior Engine Modularization

Completed ✅

---

Phase 3B

Backend Lifecycle Integration

Completed ✅

---

Phase 3C

Headless Behavior Engine + React Integration

Architecture Completed

Integration Stabilization Ongoing

---

Phase 3C.2

Integration Diagnostics & Repair

Current Phase

Purpose:

- Diagnose remaining integration failures.
- Repair stream initialization.
- Repair live metrics.
- Repair report finalization.
- Repair session lifecycle.
- Preserve all existing detection/scoring algorithms.

---

Phase 4

Unified Reporting

Pending

---

Phase 5

Production Platform

Pending

# PHASE 3 OBJECTIVE

Behavior Engine Integration

Objective:

Embed the existing Behavior Engine into NexoPrep while preserving its original analysis pipeline.

Completed:

- Backend lifecycle management.
- Automatic startup.
- Automatic shutdown.
- Headless execution.
- React integration architecture.
- Local MJPEG streaming architecture.

Remaining (Phase 3C.2):

- Restore live camera preview.
- Restore live behavior metrics.
- Restore automatic report generation.
- Eliminate duplicate interview session creation after interview completion.

No changes are permitted to:

- MediaPipe
- Detection algorithms
- Scoring algorithms
- Tracking
- Thresholds
- Report calculations
- Interview Intelligence Engine

# IMPORTANT ARCHITECTURE DECISIONS

Behavior Engine is NOT part of Gemini.

Behavior Engine is NOT part of ElevenLabs.

Behavior Engine is NOT part of Prompt Engineering.

Behavior Engine is NOT part of Conversation Memory.

Behavior Engine is a completely separate runtime.

---

# FUTURE REPORT ARCHITECTURE

Current

Interview Report

Behavior Report

Future

Interview Report

+

Behavior Report

↓

Unified Candidate Report

---

# CODING RULES

Before writing code:

Understand existing implementation.

Prefer extending over rewriting.

Avoid duplicate logic.

Maintain backward compatibility.

Follow existing project structure.

Always preserve working interview functionality.

---

# BEFORE EVERY TASK

Every AI assistant should answer internally:

1.
What phase am I working on?

2.
What already exists?

3.
What should NOT be modified?

4.
Will my change affect Interview Engine?

5.
Can this change be isolated?

Only after answering these questions should implementation begin.

---

# PHASE 3B — VALIDATED

Launcher bugs found and fixed (Phase 3B.1):

Repository root resolution — was resolving BEHAVIOR_ENGINE_DIR against
process.cwd() (apps/server, under npm workspaces), not the monorepo
root. Now walks up from cwd looking for the workspaces package.json.

Python executable resolution — was a single hardcoded name
(python3), which does not exist on most Windows installs. Now tries
the configured value first, then falls back through a
platform-ordered candidate list (py/python/python3 on Windows,
python3/python elsewhere), memoized per process.

Validated: backend launches Python automatically on interview start,
webcam opens, backend stops the process automatically on interview
end, no ENOENT, no orphan processes.

---

# PHASE 3C — HEADLESS ENGINE + REACT INTEGRATION

Behavior Engine architecture (final for this phase):

Interview starts
  -> BehaviorEngineService.start() allocates a free local port,
     spawns python main.py with BEHAVIOR_ENGINE_STREAM_PORT set
  -> engine.py auto-starts analysis immediately (no keyboard, no
     desktop window) and starts a local-only MJPEG server
  -> React <BehaviorCameraCard> renders an <img> pointed at
     GET /api/sessions/:id/behavior/stream (Node proxies the MJPEG
     bytes through from 127.0.0.1:<port>)
Interview ends
  -> BehaviorEngineService.stop() sends SIGTERM
  -> engine.py traps SIGTERM, stops the MJPEG server, finalizes the
     report (same report generation Phase 3A always had), exits
  -> Node escalates to SIGKILL only if it does not exit in time

Removed: cv2.imshow, waitKey, [S]/[E]/[Q] keyboard workflow. The
backend (process launch = start, SIGTERM = stop) is the only
controller.

Unchanged: MediaPipe, OpenCV detection, scoring, thresholds, tracking,
report format/content — draw_overlay's panel is now baked into the
streamed JPEG frames instead of an on-screen window, but the drawing
code itself was not touched.

New: behavior-engine/stream_server.py (MJPEG server),
apps/server .../behavior/launcher-utils.ts:getFreePort(),
GET /:sessionId/behavior/stream proxy route,
src/modules/interview/components/interview/BehaviorCameraCard.jsx.

Config change: INTERVIEW_DURATION 120 -> 0 (unlimited) — this is a
session-duration setting, not a detection threshold; a fixed timer
would have silently ended tracking mid-interview, contradicting
"backend is the only controller."

Future expansion point: BehaviorCameraCard already renders a
placeholder metrics row (Eye Contact, Posture, Gesture, Head
Stability, Confidence, Behavior Score) — a future phase can wire real
values in without restructuring the component or its place in the
interview page layout.

---

# END OF FILE