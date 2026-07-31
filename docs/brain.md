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

Phase 3

Behavior Engine Integration

Status:

Planning completed

Implementation not started.

---

# PHASE ROADMAP

Phase 1

Core Interview Platform

Status:

Completed

---

Phase 2

AI Interview Intelligence

Status:

Completed

---

Phase 3

Behavior Engine Integration

Status:

Current Phase

---

Phase 4

Unified Reporting System

Pending

---

Phase 5

Production Ready Platform

Pending

---

# PHASE 3 OBJECTIVE

Integrate Behavior Engine into NexoPrep.

Requirements:

Behavior Engine starts automatically.

Behavior Engine stops automatically.

Runs simultaneously with interview.

Embedded inside interview UI.

No popup window.

No effect on Interview Engine.

Reports continue saving locally.

Production-ready architecture.

---

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

# END OF FILE