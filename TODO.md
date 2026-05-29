# TODO

## Backend migration + GitHub push
- [x] Add Render startup step to run Django migrations before starting gunicorn.
- [ ] Ensure migrations run safely (no interactive prompts) on Render.
- [ ] Create a git branch `blackboxai/backend-migration`.
- [ ] Commit changes.
- [ ] Push to GitHub and open PR (if you want).
- [ ] Redeploy/verify backend endpoints.

## Notes
- Current Render config exists in `render.yaml`.
- Backend uses SQLite (`db.sqlite3`) which may be ephemeral on free tiers—migration should still apply to the schema on first boot.

