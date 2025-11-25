# Dreamality - Project Summary

## Overview

Dreamality is a full-stack AI image generation application that allows users to create stunning images from text prompts using OpenAI's DALL-E 3 API. The app includes user authentication, image storage, and a personal gallery for each user.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **shadcn/ui** - Modern, accessible UI components
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Backend as a Service
  - Authentication (email/password)
  - PostgreSQL database
  - Storage for images
  - Row Level Security (RLS)
- **OpenAI API** - DALL-E 3 image generation

## Project Structure

```
dreamality/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── generate-image/       # Image generation endpoint
│   │       └── route.ts
│   ├── auth/
│   │   └── callback/             # OAuth callback handler
│   │       └── route.ts
│   ├── gallery/                  # User's image gallery
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── login/                    # Login page
│   │   └── page.tsx
│   ├── signup/                   # Signup page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout with header
│   ├── page.tsx                  # Home page (conditional rendering)
│   ├── page-client.tsx           # Client-side image generator
│   └── globals.css               # Global styles + CSS variables
│
├── components/
│   ├── auth/
│   │   └── user-nav.tsx          # User navigation/auth UI
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   └── skeleton.tsx
│   └── landing-hero.tsx          # Landing page for non-auth users
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Auth middleware helper
│   └── utils.ts                  # Utility functions (cn)
│
├── types/
│   └── database.types.ts         # TypeScript types for database
│
├── middleware.ts                 # Next.js middleware for auth
├── components.json               # shadcn/ui configuration
├── supabase-setup.sql           # Database setup script
├── README.md                     # Main documentation
├── SETUP_GUIDE.md               # Detailed setup instructions
├── QUICKSTART.md                # Quick start guide
└── PROJECT_SUMMARY.md           # This file
```

## Key Features

### 1. User Authentication
- Email/password authentication via Supabase Auth
- Protected routes using Next.js middleware
- Automatic session management
- Login and signup pages with error handling

### 2. AI Image Generation
- Text-to-image using OpenAI DALL-E 3
- Real-time preview of generated images
- Loading states and error handling
- Download functionality

### 3. Image Storage
- Automatic upload to Supabase Storage
- Organized by user ID
- Public URLs for easy access
- Metadata stored in PostgreSQL

### 4. Personal Gallery
- View all generated images
- Sorted by creation date
- Download and view options
- Responsive grid layout
- Loading and error states

### 5. Modern UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark mode support (via CSS variables)
- Accessible components
- Loading skeletons
- Error boundaries

## Database Schema

### `images` Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- prompt: TEXT (the user's prompt)
- image_url: TEXT (public URL to image)
- storage_path: TEXT (path in storage bucket)
- created_at: TIMESTAMP
```

### Storage Buckets
- `generated-images`: Public bucket for storing images
  - Organized by user_id folders
  - Public read access
  - User-specific write/delete access

### Row Level Security (RLS)
- Users can only view/insert/delete their own images
- Enforced at the database level
- Storage policies match database policies

## API Endpoints

### POST `/api/generate-image`
Generates an image from a text prompt.

**Request Body:**
```json
{
  "prompt": "A serene mountain landscape at sunset"
}
```

**Response:**
```json
{
  "imageUrl": "https://...",
  "prompt": "A serene mountain landscape at sunset"
}
```

**Authentication:** Required (via Supabase session)

## Environment Variables

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key | platform.openai.com → API Keys |

## Security Features

1. **Row Level Security (RLS)**: Database-level access control
2. **Server-side API calls**: OpenAI key never exposed to client
3. **Authentication middleware**: Protected routes
4. **Environment variables**: Sensitive data not in code
5. **CORS protection**: API routes only accessible from same origin

## Performance Optimizations

1. **Server Components**: Reduced client-side JavaScript
2. **Image optimization**: Next.js Image component
3. **Lazy loading**: Images load on demand
4. **Streaming**: Server components stream data
5. **Static generation**: Where possible

## User Flow

### New User
1. Lands on marketing page (LandingHero)
2. Clicks "Get Started Free"
3. Signs up with email/password
4. Redirected to image generator
5. Generates first image
6. Image saved to gallery

### Returning User
1. Visits site
2. Redirected to login if not authenticated
3. Logs in
4. Sees image generator immediately
5. Can generate new images or view gallery

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Linting**: `npm run lint`
3. **Build**: `npm run build`
4. **Production**: `npm start`

## Deployment Considerations

### Vercel (Recommended)
- Automatic deployments from Git
- Environment variables in project settings
- Edge functions for API routes
- Global CDN

### Environment Setup
1. Add all environment variables
2. Ensure Supabase allows your domain
3. Update OpenAI usage limits if needed
4. Enable email confirmation in production

## Cost Estimates

### Free Tier Usage
- **Supabase**: 500MB storage, 2GB bandwidth/month
- **Vercel**: Unlimited bandwidth for hobby projects
- **OpenAI**: Pay-per-use (~$0.04 per image)

### Scaling Considerations
- Monitor OpenAI API usage
- Set up rate limiting
- Consider image compression
- Implement caching strategies

## Future Enhancements

Potential features to add:

1. **Image Editing**
   - Variations of existing images
   - Inpainting/outpainting
   - Style transfers

2. **Social Features**
   - Share images publicly
   - Like/comment system
   - Follow other users

3. **Advanced Options**
   - Different image sizes
   - Quality settings
   - Multiple images per prompt

4. **Organization**
   - Folders/collections
   - Tags and search
   - Favorites

5. **Monetization**
   - Credit system
   - Subscription tiers
   - Premium features

## Testing Checklist

- [ ] User can sign up
- [ ] User can log in
- [ ] User can log out
- [ ] User can generate image
- [ ] Image appears in preview
- [ ] Image saves to gallery
- [ ] Gallery displays all images
- [ ] User can download images
- [ ] Error handling works
- [ ] Loading states display
- [ ] Responsive on mobile
- [ ] Dark mode works

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Check environment variables
   - Verify user is logged in
   - Check Supabase session

2. **Images not saving**
   - Verify storage bucket exists
   - Check storage policies
   - Review API logs

3. **OpenAI errors**
   - Verify API key
   - Check account credits
   - Review rate limits

4. **Build errors**
   - Clear `.next` folder
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions:
1. Check the documentation files
2. Review error messages in console
3. Check Supabase logs
4. Review OpenAI API status

---

Built with ❤️ using Next.js, Supabase, and OpenAI

