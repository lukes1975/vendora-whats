# Vendora Production Deployment Guide

## Netlify Deployment Setup

### 1. Initial Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy the site

### 2. Custom Domain Configuration
1. In Netlify dashboard, go to Site settings > Domain management
2. Add custom domain: `www.vendora.business`
3. Configure DNS:
   - Add CNAME record: `www` → `your-site-name.netlify.app`
   - Add CNAME record: `*` → `your-site-name.netlify.app` (for wildcard subdomains)
   - Add A record: `@` → Netlify's IP (or redirect to www)

### 3. SSL Certificate
- Netlify will automatically provision SSL certificates for your custom domain
- Enable "Force HTTPS" in Site settings > Domain management

### 4. Environment Variables
Set these in Netlify dashboard under Site settings > Environment variables:
- `VITE_SUPABASE_URL`: `https://ncetgnojwfrnsxpytcia.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZXRnbm9qd2ZybnN4cHl0Y2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzE0NTUsImV4cCI6MjA2NzMwNzQ1NX0.iqpQuWl2OThOYW2c7lefPOD9bMmU6YutE9HWEewuMw4`

## Supabase Configuration

### 1. Update Site URL
In Supabase dashboard:
1. Go to Authentication > Settings
2. Update Site URL to: `https://www.vendora.business`
3. Add redirect URLs:
   - `https://www.vendora.business/**`
   - `https://*.vendora.business/**`

### 2. CORS Configuration
In Supabase dashboard:
1. Go to Settings > API
2. Add CORS origins:
   - `https://www.vendora.business`
   - `https://*.vendora.business`

## DNS Configuration for Subdomains

### Domain Provider Settings
Add these DNS records at your domain provider:

```
Type    Name    Value                           TTL
CNAME   www     your-site-name.netlify.app     3600
CNAME   *       your-site-name.netlify.app     3600  
A       @       Netlify Load Balancer IP       3600
```

### Netlify Domain Settings
1. Add `vendora.business` as primary domain
2. Add `www.vendora.business` as redirect to primary
3. Enable wildcard subdomain support

## How Subdomain Routing Works

### Main Domain (www.vendora.business)
- Shows full dashboard application
- All admin/seller functionality
- Authentication flows

### Store Subdomains (storeslug.vendora.business)  
- Shows individual storefront
- Public-facing store pages
- No authentication required for viewing
- Redirects to main domain for admin actions

### Route Mapping
- `www.vendora.business/dashboard` → Dashboard
- `www.vendora.business/login` → Login page
- `africanhub.vendora.business` → Store "africanhub"
- `beautycentral.vendora.business` → Store "beautycentral"

## Testing Checklist

### Local Development
- [ ] `localhost:8080` shows main app
- [ ] All dashboard routes work
- [ ] Login/signup flows work

### Production Testing
- [ ] `www.vendora.business` loads correctly
- [ ] `www.vendora.business/dashboard` doesn't 404
- [ ] `storeslug.vendora.business` shows correct store
- [ ] Images load from Supabase storage
- [ ] Authentication works on main domain
- [ ] Mobile responsive design works
- [ ] HTTPS enforced everywhere

## Performance Optimizations

### Netlify Settings
- Asset optimization enabled
- Gzip compression enabled
- Caching headers configured (see netlify.toml)

### Build Optimizations
- Vite production build with tree-shaking
- Code splitting by routes
- Image optimization for web

## Security Considerations

### Headers
- HTTPS enforced everywhere
- CORS properly configured
- CSP headers (add if needed)

### Authentication
- Sessions work across www subdomain
- Store subdomains are public (no auth required)
- Admin actions redirect to main domain

## Monitoring

### Analytics
- Set up analytics on both main domain and subdomains
- Monitor 404 errors for invalid store slugs
- Track conversion from storefront to orders

### Error Tracking
- Monitor console errors
- Set up Sentry or similar for error tracking
- Monitor build failures in Netlify

## Troubleshooting

### Common Issues
1. **404 on refresh**: Check `_redirects` file is deployed
2. **Subdomain not working**: Verify wildcard DNS record
3. **Images not loading**: Check Supabase CORS settings
4. **Auth issues**: Verify Supabase redirect URLs

### Debug Steps
1. Check browser console for errors
2. Verify DNS propagation: `dig storeslug.vendora.business`
3. Test CORS: Check network tab for failed requests
4. Verify Supabase settings match production URLs