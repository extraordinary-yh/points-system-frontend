# Deployment Guide for Render Hosting

## Prerequisites

1. **Backend Hosted**: Ensure your Django backend is hosted and accessible
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Render Account**: Sign up at [render.com](https://render.com)

## Step-by-Step Deployment

### 1. Prepare Your Backend
- Host your Django backend on Render or another service
- Get the production backend URL (e.g., `https://your-backend.onrender.com/api`)
- Ensure CORS is configured to allow your frontend domain

### 2. Update Environment Variables
Edit `.env.production` with your actual values:

```bash
# Update these values with your actual URLs
NEXT_PUBLIC_API_BASE_URL=https://your-actual-backend.onrender.com/api
NEXTAUTH_URL=https://your-frontend-app-name.onrender.com
NEXTAUTH_SECRET=your-actual-secure-secret-key
```

### 3. Deploy on Render

#### Option A: Using Render Dashboard (Recommended)
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: `p2e-frontend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose your plan (Free tier available)

#### Option B: Using render.yaml (Infrastructure as Code)
1. Push your code with `render.yaml` to your repository
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically create the service based on `render.yaml`

### 4. Set Environment Variables in Render
In your Render service dashboard, add these environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: Your backend API URL
- `NEXTAUTH_URL`: Your frontend URL
- `NEXTAUTH_SECRET`: A secure random string
- `NODE_ENV`: `production`

### 5. Configure Custom Domain (Optional)
1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain and configure DNS

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API endpoint | `https://api.yourdomain.com/api` |
| `NEXTAUTH_URL` | Frontend URL for NextAuth | `https://app.yourdomain.com` |
| `NEXTAUTH_SECRET` | Secret key for JWT encryption | `random-64-character-string` |
| `NODE_ENV` | Node environment | `production` |

## Post-Deployment Checklist

- [ ] Frontend is accessible at your Render URL
- [ ] API calls are working (check browser console)
- [ ] Authentication is working
- [ ] All features are functional
- [ ] Performance is acceptable
- [ ] SSL certificate is working (automatic on Render)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_BASE_URL` is correct
   - Check CORS configuration on backend
   - Ensure backend is accessible

3. **Authentication Issues**
   - Verify `NEXTAUTH_URL` matches your frontend URL
   - Check `NEXTAUTH_SECRET` is set
   - Ensure backend auth endpoints are working

### Performance Optimization

1. **Enable Caching**: Render automatically handles static asset caching
2. **Image Optimization**: Next.js handles image optimization automatically
3. **Bundle Analysis**: Use `npm run build` to analyze bundle size

## Monitoring and Maintenance

1. **Health Checks**: Render automatically monitors your service
2. **Logs**: Access logs in Render dashboard
3. **Updates**: Push to your main branch to trigger automatic deployments
4. **Scaling**: Adjust resources in Render dashboard as needed

## Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS**: Render provides automatic SSL certificates
3. **Headers**: Security headers are configured in `next.config.mjs`
4. **CORS**: Ensure backend CORS is properly configured

## Cost Optimization

1. **Free Tier**: Start with Render's free tier
2. **Auto-Sleep**: Free tier services sleep after inactivity
3. **Scaling**: Scale up only when needed
4. **Monitoring**: Use Render's built-in monitoring tools
