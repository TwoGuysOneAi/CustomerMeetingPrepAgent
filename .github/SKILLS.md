# SKILLS.md

Agent skills and their step-by-step instructions live in `.github/scripts/`.
Add a new `.yaml` file there for each new skill — one skill per file.

Each script follows this schema:
- `name` — display name
- `trigger` — list of phrases that invoke the skill
- `steps` — ordered list of `run` (shell command) or `instruction` (agent instruction) entries

---

| Skill | Trigger | Script |
|-------|---------|--------|
| Git Push Current Changes | *"git push current changes"* / *"git push changes"* | [git-push-current-changes.yaml](scripts/git-push-current-changes.yaml) |
