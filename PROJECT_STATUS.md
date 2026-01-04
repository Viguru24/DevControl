# DEVCONTROL STRATEGIC OVERVIEW

**Project Health:** 🟢 STABLE  
**Active Objective:** Voice interface optimization and user experience refinement.

### UI / UX System
- **Layout Precision:** Resolved horizontal scrolling and "cut off" issues in Manager Interface by removing redundant grid wrappers.
- **Visual Contrast:** High-contrast input dock refined for better visibility.
- **Sidebar Navigation:** Scrollbar visibility increased and scrolling functionality restored.

### Voice System
- **Missing Voice:** User's preferred German-English accent voice is not appearing in the dropdown. Confirmed SAPI5 limitation; browser-based voice discovery logs show correct identities.
- **Port Correction:** Fixed incorrect port (3001) in `check_auto_mode.mjs` to match server port (42424).
- **STT Latency:** Speech-to-text transcription stabilized via Groq Whisper.

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
Voice interface is stable and functional. Currently in Phase 3 (Execution Loop), transitioning to Phase 4 (Project Features). Zero-Touch automation is live and verified.

## Architecture Log
- **Manager-Agent Bridge:** Uses `AGENT_INSTRUCTIONS.md` as a one-way command buffer.
- **Context Injection:** `PROJECT_STATUS.md` is prepended to Groq Manager's system prompt.
- **Autopilot Bridge:** Standalone daemon script pulses `Alt+Enter` to unblock agent prompts autonomously.
- **GitHub Sync:** DevControl is now synchronized to `https://github.com/Viguru24/DevControl` and integrated into the local `repos-config.json` sync pool.

## Strategic Memory (Session Knowledge)
- **Voice Preferences:** Louis prefers a German-English accent. Microsoft David/Zira are currently the only detected system voices.
- **UI Philosophy:** High-contrast, neon-midnight aesthetic. Horizontal cutoff and sidebar scrolling issues resolved 2026-01-03.
- **Efficiency Goal:** "Zero-Touch" philosophy. Minimize manual clicks; prioritize background automation.
- **Backups:** Full strategic backup completed 2026-01-01 (including GitHub push). Port-mismatch fixed in check scripts 2026-01-03.

## owner information
- **Name:** Louis de Souza
- **Location:** Purley, London, UK
- **Units:** Metric, Celsius
- **Preferred Greeting:** "Louis"
- **Communication Style:** Direct, professional, values time-saving.

## Technical Debt & Backlog
- [x] Establish "Zero-Touch" autopilot loop.
- [x] Full Project Backup and GitHub Sync.
- [x] Integrated "Strategic Hub" (Backup/Protocol/Automation UI).
- [ ] Investigate additional "OneCore" voices for German-English accent.
- [ ] Implement "Session Checkpoint" for automated status updates.

## Strategic Prompting Guidelines (Added by Louis)
1. **Clear & Specific**: Give exact directives (e.g., "5 bullet points").
2. **Step-by-Step**: Break complex tasks (e.g., "Research then Outline").
3. **Contextual Examples**: Use stylistic references (e.g., "Write like Hemingway").
4. **Role-Play**: Direct the AI to act as a specific expert.
5. **Chain & Refine**: Iterate based on feedback.
6. **Natural Language**: Keep it direct and fluff-free.

