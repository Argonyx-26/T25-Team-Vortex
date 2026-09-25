# Sentinel Mesh — Setup Status

## Done (as of [date])
- [x] Repo created, all 3 members have push access
- [x] Backend folder set up — Flask + venv + requirements.txt
- [x] SQLite database schema created (events, incidents tables)
- [x] Groq API key generated and tested — using model `openai/gpt-oss-20b`
      (note: llama-3.1-8b-instant was deprecated, switched to gpt-oss-20b)
- [x] .env + .gitignore set up correctly — API key not exposed
- [x] Health check endpoint (`/`) working on localhost:5000

## To do before hackathon
- [ ] Socket.IO wired into backend
- [ ] React dashboard scaffolded
- [ ] Socket.IO connection tested frontend ↔ backend
- [ ] Full checklist from step 8 run end-to-end

## Notes for teammates
- I'm on Windows/PowerShell — if you hit bash-specific command errors, ping me
- Groq model must be `openai/gpt-oss-20b`, not the older llama models (deprecated Aug 2026)
- .env file is NOT in the repo (correctly gitignored) — each of you needs your own Groq key or I'll share mine securely (not via GitHub/chat)