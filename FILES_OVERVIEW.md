# Files Overview

Complete list of all files created for the Dreamality project.

## Configuration Files

### `components.json`
shadcn/ui configuration file specifying component paths, styling, and aliases.

### `tsconfig.json`
TypeScript configuration with path aliases and compiler options.

### `next.config.ts`
Next.js configuration file.

### `postcss.config.mjs`
PostCSS configuration for Tailwind CSS.

### `.gitignore`
Specifies files to ignore in git (includes `.env*` files).

## Application Files

### App Directory (`app/`)

#### Root Files
- **`layout.tsx`**: Root layout with header and user navigation
- **`page.tsx`**: Home page with conditional rendering (landing vs generator)
- **`page-client.tsx`**: Client-side image generator component
- **`globals.css`**: Global styles and CSS variables for theming

#### Auth Pages
- **`login/page.tsx`**: Login page with email/password form
- **`signup/page.tsx`**: Signup page with email/password form
- **`auth/callback/route.ts`**: OAuth callback handler for Supabase Auth

#### Gallery
- **`gallery/page.tsx`**: Image gallery showing all user's generated images
- **`gallery/loading.tsx`**: Loading skeleton for gallery
- **`gallery/error.tsx`**: Error boundary for gallery page

#### API Routes
- **`api/generate-image/route.ts`**: POST endpoint for AI image generation

## Components

### Auth Components (`components/auth/`)
- **`user-nav.tsx`**: User navigation component with login/logout

### UI Components (`components/ui/`)
All from shadcn/ui:
- **`button.tsx`**: Button component
- **`card.tsx`**: Card component with header, content, footer
- **`input.tsx`**: Input field component
- **`label.tsx`**: Form label component
- **`textarea.tsx`**: Textarea component
- **`skeleton.tsx`**: Loading skeleton component

### Custom Components (`components/`)
- **`landing-hero.tsx`**: Landing page hero section for non-authenticated users

## Library Files (`lib/`)

### Supabase (`lib/supabase/`)
- **`client.ts`**: Browser-side Supabase client
- **`server.ts`**: Server-side Supabase client
- **`middleware.ts`**: Middleware helper for auth

### Utilities
- **`utils.ts`**: Utility functions (cn for className merging)

## Type Definitions (`types/`)
- **`database.types.ts`**: TypeScript types for Supabase database schema

## Middleware
- **`middleware.ts`**: Next.js middleware for authentication protection

## Database & Setup

### `supabase-setup.sql`
SQL script to set up:
- `images` table
- Storage bucket
- Row Level Security policies
- Storage policies

## Documentation Files

### `README.md`
Main documentation covering:
- Project overview
- Features
- Setup instructions
- Tech stack
- Project structure
- Deployment guide

### `SETUP_GUIDE.md`
Detailed step-by-step setup guide with:
- Prerequisites
- Supabase configuration
- Environment variables
- Common issues and solutions
- Testing prompts

### `QUICKSTART.md`
Quick 5-minute setup guide for getting started fast.

### `PROJECT_SUMMARY.md`
Comprehensive project documentation:
- Architecture overview
- Database schema
- API endpoints
- Security features
- User flows
- Future enhancements

### `DEPLOYMENT_CHECKLIST.md`
Pre-deployment checklist covering:
- Code quality checks
- Supabase setup
- Security considerations
- Monitoring setup
- Cost management
- Post-launch tasks

### `FILES_OVERVIEW.md` (this file)
Complete list of all files and their purposes.

## File Count Summary

- **App Pages**: 7 files
- **API Routes**: 1 file
- **Components**: 9 files
- **Library Files**: 4 files
- **Configuration**: 5 files
- **Documentation**: 6 files
- **Database**: 1 SQL file
- **Middleware**: 1 file
- **Types**: 1 file

**Total**: ~35 files created

## Key File Relationships

```
app/layout.tsx
├── imports globals.css
├── uses lib/supabase/server.ts
└── uses components/auth/user-nav.tsx

app/page.tsx
├── uses lib/supabase/server.ts
├── uses components/landing-hero.tsx
└── uses app/page-client.tsx

app/page-client.tsx
├── calls api/generate-image/route.ts
└── uses components/ui/*

app/gallery/page.tsx
├── uses lib/supabase/server.ts
└── uses components/ui/*

app/api/generate-image/route.ts
├── uses lib/supabase/server.ts
├── calls OpenAI API
└── stores in Supabase Storage

middleware.ts
└── uses lib/supabase/middleware.ts
```

## Environment Dependencies

Files that require environment variables:

1. **`lib/supabase/client.ts`**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **`lib/supabase/server.ts`**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **`lib/supabase/middleware.ts`**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **`app/api/generate-image/route.ts`**
   - `OPENAI_API_KEY`

## External Dependencies

### Production Dependencies
- `next`: Next.js framework
- `react`: React library
- `react-dom`: React DOM
- `@supabase/supabase-js`: Supabase client
- `@supabase/ssr`: Supabase SSR helpers
- `openai`: OpenAI API client
- `class-variance-authority`: CVA for component variants
- `clsx`: Utility for className
- `tailwind-merge`: Merge Tailwind classes
- `lucide-react`: Icon library

### Dev Dependencies
- `typescript`: TypeScript
- `@types/node`: Node.js types
- `@types/react`: React types
- `@types/react-dom`: React DOM types
- `tailwindcss`: Tailwind CSS
- `@tailwindcss/postcss`: Tailwind PostCSS
- `eslint`: Linting
- `eslint-config-next`: Next.js ESLint config

## File Sizes (Approximate)

- Small (< 100 lines): Most UI components, utilities
- Medium (100-300 lines): Page components, API routes
- Large (> 300 lines): Documentation files

## Modification Priority

If customizing the app, modify in this order:

1. **High Priority** (Core functionality):
   - `app/api/generate-image/route.ts`
   - `lib/supabase/*`
   - `middleware.ts`

2. **Medium Priority** (Features):
   - `app/page-client.tsx`
   - `app/gallery/page.tsx`
   - `components/auth/user-nav.tsx`

3. **Low Priority** (Styling):
   - `app/globals.css`
   - `components/ui/*`
   - `components/landing-hero.tsx`

## Files You Should NOT Modify

- `components/ui/*` (shadcn components - regenerate if needed)
- `node_modules/*` (dependencies)
- `.next/*` (build output)
- `next-env.d.ts` (auto-generated)

## Files to Customize

- `app/globals.css` - Change colors/theme
- `components/landing-hero.tsx` - Update marketing copy
- `app/layout.tsx` - Change header/branding
- `README.md` - Update with your info

---

This overview should help you navigate the project structure and understand the purpose of each file!

