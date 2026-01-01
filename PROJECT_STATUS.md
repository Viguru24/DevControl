# DEVCONTROL STRATEGIC OVERVIEW

**Project Health:** 🟢 STABLE  
**Active Objective:** Voice interface optimization and user experience refinement.

## Current Blockers & Active Issues

### Voice System
- **Missing Voice:** User's preferred German-English accent voice is not appearing in the dropdown. Needs console log review to locate the correct voice URI.
- **STT Latency:** Speech-to-text transcription takes 1-3 seconds via Groq API. User may find this delay noticeable during dictation.

### Appraisal System
- **Context Freshness:** This file must be manually updated to reflect session work. Consider automation or real-time context injection.

## Pending Decisions

### Voice Engine Selection
- **Azure TTS:** User is blocked from Microsoft account. Integration paused indefinitely.
- **OpenAI TTS:** Available but costs $15/million characters. User has not requested implementation.
- **Current State:** Local Windows voices are functional and preferred.

## Next Actions Required
1. **User:** Review browser console (F12) to identify German-English voice from the numbered list
2. **Agent:** Await directive on next priority (voice refinement vs. new features)
3. **System:** Maintain current stable state until new objectives are defined

## Strategic Context
Voice interface is stable and functional. Currently transitioning from Phase 2 (Manager Integration) to Phase 3 (Execution Loop). 

## Architecture Log
- **Manager-Agent Bridge:** Uses `AGENT_INSTRUCTIONS.md` as a one-way command buffer. Manager writes, Agent (Antigravity) reads.
- **Context Injection:** `PROJECT_STATUS.md` is automatically prepended to the Groq Manager's system prompt to ensure total situational awareness.
- **UI Architecture:** React frontend with CSS Variables for themes. Layout uses a 280px sidebar and flexible content area.

## Strategic Memory (Session Knowledge)
- **Voice Preferences:** Louis prefers a specific German-English accent for the system output.
- **UI Philosophy:** High-contrast, neon-midnight aesthetic. Fast response and micro-animations are prioritized.
- **Workflow:** User consults Manager (Groq) for high-level strategy, then Agent (Antigravity) for execution.
- **Zero-Touch Philosophy:** Priority on time-saving. "Accept All" prompts are handled by an automated 3-second heartbeat pulse (Alt+Enter) to minimize manual friction.

## owner information
- **Name:** Louis de Souza
- **Location:** Purley, London, UK
- **Units:** Metric, Celsius
- **Preferred Greeting:** "Louis"
- **Communication Style:** Direct, professional, appreciates strategic foresight.

## Technical Debt & Backlog
- [ ] Implement "C" trigger logic for automated instruction checking.
- [ ] Optimize STT path for lower latency (Whisper options).
- [ ] Verify horizontal scroll on wide code snippets in chat.

## Prompt with an AI agent manager: 
-Start clear and specific—tell it exactly what you want, like "summarise this article in five bullet points."
-Break tasks into steps for complex stuff: Say "first research, then outline."
-Use examples if possible: Like "write like Hemingway but add modern slang."
-Role-play: E.g., act as a marketing expert.
-Chain prompts for refinement: "Revise this based on feedback."
-Keep language natural: Avoid fluff.
-Experiment and iterate.

