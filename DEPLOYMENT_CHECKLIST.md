# Deployment Checklist

Use this checklist before deploying Dreamality to production.

## Pre-Deployment

### Code Quality
- [x] Build succeeds (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] All TypeScript errors resolved
- [ ] Environment variables documented

### Supabase Setup
- [ ] Production Supabase project created
- [ ] Database schema deployed (run `supabase-setup.sql`)
- [ ] Storage bucket `generated-images` created and public
- [ ] Row Level Security policies enabled
- [ ] Email confirmation enabled (recommended for production)
- [ ] Email templates customized (optional)

### Authentication
- [ ] Email provider enabled in Supabase Auth
- [ ] Redirect URLs configured for production domain
- [ ] Password requirements set
- [ ] Rate limiting configured

### API Keys
- [ ] OpenAI API key has sufficient credits
- [ ] API key usage limits set
- [ ] Billing alerts configured

### Security
- [ ] Environment variables never committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] CORS configured properly
- [ ] Rate limiting considered for API routes
- [ ] RLS policies tested

## Vercel Deployment

### Setup
1. [ ] Push code to GitHub/GitLab/Bitbucket
2. [ ] Import project in Vercel
3. [ ] Configure environment variables:
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] `OPENAI_API_KEY`
4. [ ] Deploy

### Post-Deployment
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test image generation
- [ ] Test image storage
- [ ] Test gallery
- [ ] Test logout
- [ ] Verify images are saved
- [ ] Check error handling
- [ ] Test on mobile devices
- [ ] Test on different browsers

## Supabase Configuration

### Auth Settings
- [ ] Site URL set to production domain
- [ ] Redirect URLs include:
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/**` (for development)
- [ ] Email confirmation enabled
- [ ] Email rate limiting configured

### Storage Settings
- [ ] Bucket size limits set
- [ ] File upload size limits configured
- [ ] Public access verified
- [ ] CORS configured if needed

### Database
- [ ] Connection pooling configured
- [ ] Backups enabled
- [ ] Monitoring set up

## Monitoring & Analytics

### Error Tracking
- [ ] Error logging configured
- [ ] Sentry or similar tool integrated (optional)
- [ ] Console errors reviewed

### Performance
- [ ] Lighthouse score checked
- [ ] Core Web Vitals reviewed
- [ ] Image loading optimized
- [ ] API response times monitored

### Usage Monitoring
- [ ] OpenAI API usage dashboard checked
- [ ] Supabase usage dashboard reviewed
- [ ] Set up cost alerts

## Cost Management

### OpenAI
- [ ] Usage limits set
- [ ] Billing alerts configured
- [ ] Monitor cost per image
- [ ] Consider rate limiting users

### Supabase
- [ ] Monitor storage usage
- [ ] Monitor bandwidth
- [ ] Plan upgrade if needed
- [ ] Set up alerts for limits

### Vercel
- [ ] Monitor bandwidth usage
- [ ] Monitor function execution time
- [ ] Plan appropriate for traffic

## User Experience

### Testing
- [ ] Create test account
- [ ] Generate multiple images
- [ ] Test edge cases:
  - [ ] Very long prompts
  - [ ] Empty prompts
  - [ ] Special characters
  - [ ] Multiple rapid generations
- [ ] Test error scenarios:
  - [ ] Invalid credentials
  - [ ] Network errors
  - [ ] API failures

### Documentation
- [ ] README updated with production URL
- [ ] User guide created (optional)
- [ ] FAQ prepared (optional)
- [ ] Support email configured

## Legal & Compliance

- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Cookie policy (if applicable)
- [ ] GDPR compliance reviewed (if EU users)
- [ ] OpenAI usage policy compliance verified

## Backup & Recovery

- [ ] Database backup strategy in place
- [ ] Storage backup configured
- [ ] Recovery procedure documented
- [ ] Test restore process

## Performance Optimization

### Images
- [ ] Next.js Image component used
- [ ] Lazy loading implemented
- [ ] Proper image formats
- [ ] CDN configured (Vercel handles this)

### API
- [ ] Response caching considered
- [ ] Rate limiting implemented
- [ ] Error handling robust
- [ ] Timeouts configured

### Database
- [ ] Indexes added where needed
- [ ] Query performance reviewed
- [ ] Connection pooling configured

## Post-Launch

### Week 1
- [ ] Monitor error rates
- [ ] Check API usage
- [ ] Review user feedback
- [ ] Fix critical bugs
- [ ] Monitor costs

### Month 1
- [ ] Analyze usage patterns
- [ ] Optimize based on data
- [ ] Plan feature updates
- [ ] Review security
- [ ] Check performance metrics

## Rollback Plan

If something goes wrong:

1. [ ] Rollback procedure documented
2. [ ] Previous deployment preserved
3. [ ] Database migration rollback tested
4. [ ] Contact information for support

## Launch Announcement

- [ ] Social media posts prepared
- [ ] Blog post written (optional)
- [ ] Email to beta users (if applicable)
- [ ] Product Hunt launch (optional)

## Support

- [ ] Support email configured
- [ ] FAQ page created
- [ ] Documentation accessible
- [ ] Bug reporting process established

---

## Quick Deployment Commands

```bash
# Build and test locally
npm run build
npm start

# Deploy to Vercel (via CLI)
vercel --prod

# Check deployment status
vercel ls
```

## Environment Variables Template

```env
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx...
```

## Emergency Contacts

- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.io
- OpenAI Support: help.openai.com

---

**Remember**: Test everything in a staging environment before deploying to production!

