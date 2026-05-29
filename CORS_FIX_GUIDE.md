# CORS Fix & GitHub Auto-Deployment Setup

## Problem Solved ✅
**CORS Error**: "Access to fetch at 'https://dar-system-backend.onrender.com/api/accounts/login/' has been blocked by CORS policy"

## Solution Implemented

### 1. Backend CORS Configuration Fixed
- **File**: `backend/core/settings.py`
- **Changes**:
  - Added explicit `CORS_ALLOWED_ORIGINS` list with your Vercel frontend URL
  - Enabled `CORS_ALLOW_CREDENTIALS` for authentication tokens
  - Maintained backward compatibility with environment variables

### 2. GitHub Actions Auto-Deployment Setup
- **File**: `.github/workflows/deploy.yml`
- **Features**:
  - Automatic testing on every push
  - Automatic deployment to Render on main branch push
  - Django health checks before deployment

## 🚀 Next Steps to Enable Auto-Deploy

### Option A: Using Render Deploy Hook (Recommended)
1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend service (`dar-system-backend`)
3. Go to "Settings" → "Deploy Hook"
4. Copy the webhook URL
5. Add it to GitHub:
   - Go to: https://github.com/Neehkooo/DAR-SYSTEM/settings/secrets/actions
   - Click "New repository secret"
   - Name: `RENDER_DEPLOY_HOOK`
   - Value: (paste the Render webhook URL)
6. Now, every push to `main` will trigger automatic deployment!

### Option B: Direct Render Integration (Alternative)
1. In Render dashboard, go to your service settings
2. Under "Build & Deploy", ensure GitHub is connected
3. Enable "Auto-deploy on push"

## ✅ Verify the Fix Works

### Locally (Optional)
```bash
cd backend
python manage.py runserver
```

### Production Check
1. Push changes to GitHub (already done ✅)
2. Wait for GitHub Actions workflow to complete
3. Render will redeploy automatically
4. Test login at: https://dar-docs-coral.vercel.app

## 📋 What Was Changed

### CORS Settings Enhanced:
```python
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000',
    'http://localhost:5173',
    'http://localhost:8000',
    'https://dar-docs-coral.vercel.app',  # ← Your Vercel frontend
]
CORS_ALLOW_CREDENTIALS = True  # ← For auth tokens
```

## 🔐 Required Render Environment Variables

Make sure these are set in Render dashboard for your backend:
- `DJANGO_DEBUG`: `false`
- `DJANGO_SECRET_KEY`: (set securely)
- `DJANGO_ALLOWED_HOSTS`: `dar-system-backend.onrender.com,localhost`
- `CORS_ALLOWED_ORIGINS`: (optional, defaults are used if not set)

## 🐛 Troubleshooting

### Still getting CORS error?
1. Clear browser cache and cookies
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check Render logs: https://dashboard.render.com → Your service → Logs
4. Verify the frontend is calling the correct backend URL

### To check Render logs for CORS issues:
```bash
# In Render dashboard:
1. Click your service
2. Click "Logs" tab
3. Look for CORS-related errors
```

### Manual deployment trigger:
Go to Render dashboard → Your service → "Deploy" button → "Deploy latest commit"

## 📦 Files Modified
- ✅ `backend/core/settings.py` - CORS configuration
- ✅ `.github/workflows/deploy.yml` - Auto-deployment workflow

## 🔄 Future Changes
From now on, every time you:
1. Push changes to `main` branch
2. GitHub Actions will automatically test and deploy to Render
3. Your live application will be updated automatically!

---
**Last Updated**: 2026-05-29
**Status**: Ready for testing ✅
