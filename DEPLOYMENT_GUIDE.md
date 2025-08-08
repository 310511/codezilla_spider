# 🚀 Deployment Guide

This guide will help you deploy the Spider Medical System to Render (Backend) and Vercel (Frontend).

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Vercel account (free tier available)
- Git installed on your machine

## 🔧 Backend Deployment to Render

### Step 1: Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository: `https://github.com/310511/codezilla_spider`
4. Configure the service:
   - **Name**: `spider-medical-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### Step 2: Environment Variables

Add these environment variables in Render:
- `PYTHON_VERSION`: `3.11.0`
- `PORT`: `8000`

### Step 3: Deploy

1. Click "Create Web Service"
2. Wait for the build to complete (usually 2-3 minutes)
3. Note the deployment URL (e.g., `https://spider-medical-backend.onrender.com`)

## 🌐 Frontend Deployment to Vercel

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/310511/codezilla_spider`
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Environment Variables

Add this environment variable in Vercel:
- `VITE_API_URL`: `https://spider-medical-backend.onrender.com` (your Render backend URL)

### Step 3: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be available at the provided Vercel URL

## 🔗 Update Backend URL

After deploying the backend to Render, update the frontend environment variable:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Update `VITE_API_URL` with your Render backend URL
4. Redeploy the frontend

## ✅ Verification

### Backend Health Check
```bash
curl https://your-render-backend-url.onrender.com/health
```

### Frontend Check
Visit your Vercel URL and verify:
- ✅ Dashboard loads
- ✅ RFID functionality works
- ✅ Inventory management works
- ✅ All features are functional

## 🛠️ Troubleshooting

### Backend Issues
- Check Render logs for build errors
- Verify all dependencies are in `backend/requirements.txt`
- Ensure the start command is correct

### Frontend Issues
- Check Vercel build logs
- Verify environment variables are set correctly
- Ensure the API URL is accessible

### CORS Issues
If you encounter CORS errors, the backend is configured to allow all origins in production.

## 📊 Monitoring

### Render (Backend)
- Monitor logs in Render dashboard
- Check service health status
- View resource usage

### Vercel (Frontend)
- Monitor build status
- Check deployment logs
- View analytics and performance

## 🔄 Updates

To update your deployment:

1. Push changes to GitHub
2. Render will automatically redeploy the backend
3. Vercel will automatically redeploy the frontend

## 📞 Support

If you encounter issues:
1. Check the logs in both Render and Vercel dashboards
2. Verify all environment variables are set correctly
3. Ensure the backend URL is accessible from the frontend

---

**🎉 Your Spider Medical System is now deployed and ready to use!** 