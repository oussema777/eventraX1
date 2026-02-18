# Eventra B2B Matchmaking Engine - Technical Documentation

**Date:** February 16, 2026  
**Analyst:** AI Security & Systems Expert  
**Component:** EventB2BMatchmakingTab.tsx

---

## Executive Summary

The Eventra B2B Matchmaking Engine is an AI-powered system that analyzes attendee profiles and generates intelligent connection suggestions for networking events. It uses a multi-dimensional scoring algorithm with configurable weights to match people based on industry alignment, role compatibility, company stage, shared interests, and networking goals.

**Key Metrics:**
- **Algorithm Type:** Weighted Multi-Criteria Scoring
- **Maximum Suggestions:** 200 pairs per run
- **Scoring Range:** 0-100%
- **Default Minimum Match Score:** 75%
- **Matching Modes:** 3 (All Attendees, Category-Based, Opt-in Only)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Profile Building System](#2-profile-building-system)
3. [Matching Algorithm](#3-matching-algorithm)
4. [Scoring System](#4-scoring-system)
5. [Suggestion Generation Process](#5-suggestion-generation-process)
6. [Configuration & Weights](#6-configuration--weights)
7. [Data Flow](#7-data-flow)
8. [Performance & Optimization](#8-performance--optimization)
9. [Limitations & Edge Cases](#9-limitations--edge-cases)

---

