# TODO

## CORS fix (Render backend -> Vercel frontend)
- [x] Locate CORS configuration in `backend/core/settings.py`.
- [x] Add `https://dar-docs-coral.vercel.app` to `CORS_ALLOWED_ORIGINS` defaults so preflight requests succeed.
- [ ] Redeploy backend on Render (or restart service) and verify that login works from Vercel.

