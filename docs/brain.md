# 🧠 NexoPrep AI Brain

**Version:** 2.0\
**Project Status:** Phase 3 Complete → Phase 4 Architecture\
**Last Updated:** July 2026

------------------------------------------------------------------------

# PURPOSE

This document is the single source of truth for NexoPrep.

Every AI assistant (Claude, ChatGPT, Cursor, Gemini, Copilot, etc.)
**must read this document before making architectural or code changes.**

Core principles:

-   Extend, don't rewrite.
-   Preserve working systems.
-   Respect subsystem boundaries.
-   Design for production scalability.

------------------------------------------------------------------------

# PROJECT OVERVIEW

**Project:** NexoPrep

**Tagline:** AI Powered Interview Preparation & Behavioral Intelligence
Platform

NexoPrep combines conversational AI with real-time behavioral analysis.

Two independent intelligence systems operate simultaneously:

1.  Interview Intelligence Engine
2.  Behavioral Intelligence Engine

Both remain independent and are only combined inside the reporting
layer.

------------------------------------------------------------------------

# LONG TERM VISION

Resume → AI Interview → Behavior Analysis → Technical Evaluation →
Unified Intelligence Layer → AI Mentor

------------------------------------------------------------------------

# DESIGN PRINCIPLES

## Separation of Concerns

Interview Engine and Behavior Engine are independent.

## Observation Only

Behavior Engine never changes prompts, transcript, memory, Gemini
reasoning or interview flow.

## Interview First

Behavior failures must never interrupt interviews.

## Safe Failure

Behavior crashes must not stop the interview.

## Extend, Never Rewrite

Preserve working systems.

------------------------------------------------------------------------

# CURRENT STATUS

## Phase 1

Core Platform ✅

## Phase 2

Interview Intelligence ✅

## Phase 3

Behavior Engine Integration ✅

Completed: - Backend-managed lifecycle - Automatic launch/shutdown -
Headless execution - MJPEG streaming - Live metrics - MediaPipe
analysis - Graceful STOP workflow - Automatic report generation - Local
report storage

Behavior Engine is backend-managed and no longer a standalone workflow.

------------------------------------------------------------------------

# CURRENT ARCHITECTURE

Frontend - React - TypeScript - Vite

Backend - Node.js

Interview Intelligence - Gemini 2.5 Flash - ElevenLabs - Resume-aware
prompting - Memory - Transcript pipeline

Behavior Intelligence - Python - OpenCV - MediaPipe - NumPy - Matplotlib

Storage - PostgreSQL - Redis - Local Reports

------------------------------------------------------------------------

# DATA OWNERSHIP

## Interview Engine

-   Resume
-   Questions
-   Answers
-   Transcript
-   Memory
-   Technical Evaluation

## Behavior Engine

-   Eye Contact
-   Posture
-   Engagement
-   Confidence
-   Timeline
-   Graphs
-   report.json
-   report.txt
-   scorecard.txt

## Unified Report

Owns no primary data. Aggregates existing outputs.

------------------------------------------------------------------------

# PHASE 4

Objective:

Create a Unified AI Report combining:

-   Resume Intelligence
-   Interview Intelligence
-   Behavioral Intelligence
-   Conversation Intelligence
-   Session Metadata

The Unified Report is an Intelligence Layer, not merely a merge of
reports.

Implementation:

Phase 4A - Architecture

Phase 4B - Interview Intelligence Report

Phase 4C - Unified Intelligence Layer

Phase 4D - Frontend Experience

------------------------------------------------------------------------

# FROZEN SYSTEMS

Do not redesign: - Interview Engine - Gemini prompts - ElevenLabs flow -
Resume parser - MediaPipe algorithms - Behavior scoring - Tracking
algorithms

------------------------------------------------------------------------

# CODING GUIDELINES

1.  Identify current phase.
2.  Reuse existing modules.
3.  Extend before rewriting.
4.  Preserve compatibility.
5.  Respect subsystem boundaries.

------------------------------------------------------------------------

# FUTURE ROADMAP

Phase 4 - Unified Intelligence Report

Phase 5 - AI Mentor

Phase 6 - Resume Intelligence

Phase 7 - Progress Dashboard

Phase 8 - Company Simulation

Phase 9 - Coding Interviews

Phase 10 - Advanced Analytics

Phase 11 - Adaptive AI

Phase 12 - Recruiter Portal

Phase 13 - SaaS Platform

------------------------------------------------------------------------

# FINAL PRINCIPLE

Every change should make NexoPrep more modular, scalable, maintainable
and production-ready.

END OF FILE
