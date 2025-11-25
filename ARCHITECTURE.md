# Dreamality Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Next.js Frontend                         │ │
│  │  • React Components (shadcn/ui)                            │ │
│  │  • Client-side State Management                            │ │
│  │  • Image Preview & Display                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Server (Vercel)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Server Components                         │ │
│  │  • Authentication Check                                     │ │
│  │  • Data Fetching (Gallery)                                 │ │
│  │  • Server-side Rendering                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Routes                               │ │
│  │  • /api/generate-image (POST)                              │ │
│  │    - Validates user auth                                   │ │
│  │    - Calls OpenAI API                                      │ │
│  │    - Uploads to Supabase Storage                           │ │
│  │    - Saves metadata to database                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Middleware                               │ │
│  │  • Auth verification on every request                      │ │
│  │  • Redirects unauthenticated users                         │ │
│  │  • Session refresh                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                    │                    │
                    │                    │
        ┌───────────┘                    └───────────┐
        │                                            │
        ▼                                            ▼
┌──────────────────────┐              ┌──────────────────────────┐
│   OpenAI API         │              │      Supabase            │
│                      │              │                          │
│  • DALL-E 3 Model    │              │  ┌────────────────────┐ │
│  • Image Generation  │              │  │   Auth Service     │ │
│  • 1024x1024 images  │              │  │  • User sessions   │ │
│  • Standard quality  │              │  │  • Email/password  │ │
│                      │              │  └────────────────────┘ │
└──────────────────────┘              │  ┌────────────────────┐ │
                                      │  │   PostgreSQL DB    │ │
                                      │  │  • images table    │ │
                                      │  │  • RLS policies    │ │
                                      │  └────────────────────┘ │
                                      │  ┌────────────────────┐ │
                                      │  │   Storage          │ │
                                      │  │  • Image files     │ │
                                      │  │  • Public bucket   │ │
                                      │  └────────────────────┘ │
                                      └──────────────────────────┘
```

## Data Flow

### 1. User Authentication Flow

```
User → Signup/Login Page
  ↓
Enter Credentials
  ↓
Supabase Auth API
  ↓
Session Cookie Set
  ↓
Redirect to Home
  ↓
Middleware Validates Session
  ↓
Access Granted
```

### 2. Image Generation Flow

```
User Enters Prompt
  ↓
Click "Generate Image"
  ↓
POST /api/generate-image
  ↓
Middleware: Verify Auth
  ↓
API Route: Check User Session
  ↓
Call OpenAI DALL-E 3 API
  ↓
Receive Image URL (temporary)
  ↓
Download Image Data
  ↓
Upload to Supabase Storage
  ↓
Get Public URL
  ↓
Save Metadata to Database
  ↓
Return Public URL to Client
  ↓
Display Image in Browser
```

### 3. Gallery Loading Flow

```
User Visits /gallery
  ↓
Server Component Runs
  ↓
Check User Auth
  ↓
Query Supabase Database
  ↓
Filter by user_id (RLS)
  ↓
Fetch Image Records
  ↓
Render Gallery Grid
  ↓
Images Load from Storage
```

## Component Architecture

```
app/layout.tsx (Root Layout)
├── Header
│   ├── Logo/Title
│   └── UserNav Component
│       ├── If Authenticated: Email + Sign Out
│       └── If Not: Login + Sign Up buttons
└── Main Content
    └── {children}

app/page.tsx (Home)
├── If Not Authenticated
│   └── LandingHero Component
│       ├── Hero Section
│       ├── Features Grid
│       └── CTA Buttons
└── If Authenticated
    └── ImageGenerator Component
        ├── Prompt Input (Textarea)
        ├── Generate Button
        ├── Loading State
        ├── Error Display
        └── Image Preview Card
            ├── Generated Image
            └── Action Buttons

app/gallery/page.tsx
├── Header Section
│   ├── Title
│   └── Back Button
└── If Has Images
    └── Grid Layout
        └── Image Cards
            ├── Image Display
            ├── Prompt Text
            ├── Date
            └── Action Buttons
```

## Database Schema

```sql
┌─────────────────────────────────────┐
│            images table              │
├─────────────────────────────────────┤
│ id          UUID (PK)                │
│ user_id     UUID (FK → auth.users)  │
│ prompt      TEXT                     │
│ image_url   TEXT                     │
│ storage_path TEXT                    │
│ created_at  TIMESTAMP                │
└─────────────────────────────────────┘
         │
         │ RLS Policies:
         │ • SELECT: WHERE user_id = auth.uid()
         │ • INSERT: WHERE user_id = auth.uid()
         │ • DELETE: WHERE user_id = auth.uid()
         │
         ▼
┌─────────────────────────────────────┐
│       auth.users (Supabase)         │
├─────────────────────────────────────┤
│ id          UUID (PK)                │
│ email       TEXT                     │
│ ...         (managed by Supabase)    │
└─────────────────────────────────────┘
```

## Storage Structure

```
generated-images/ (bucket)
├── {user_id_1}/
│   ├── 1234567890.png
│   ├── 1234567891.png
│   └── 1234567892.png
├── {user_id_2}/
│   ├── 1234567893.png
│   └── 1234567894.png
└── ...

Storage Policies:
• Upload: user_id matches folder name
• Read: Public (anyone can read)
• Delete: user_id matches folder name
```

## Authentication Flow Detail

```
┌─────────────────────────────────────────────────────────┐
│                    Every Request                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   middleware.ts                          │
│  • Runs on every request                                │
│  • Checks for auth cookie                               │
│  • Validates session with Supabase                      │
│  • Refreshes token if needed                            │
└─────────────────────────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
        ┌──────────────┐   ┌──────────────┐
        │ Authenticated │   │ Not Auth     │
        └──────────────┘   └──────────────┘
                │                 │
                ▼                 ▼
        ┌──────────────┐   ┌──────────────┐
        │ Allow Access │   │ Redirect to  │
        │              │   │ /login       │
        └──────────────┘   └──────────────┘
```

## API Security

```
Client Request
  ↓
POST /api/generate-image
  ↓
┌─────────────────────────────────┐
│ Security Checks:                │
│ 1. Middleware validates session │
│ 2. API route gets user from     │
│    Supabase session             │
│ 3. If no user → 401 Unauthorized│
│ 4. Validate prompt input        │
│ 5. Rate limiting (optional)     │
└─────────────────────────────────┘
  ↓
Process Request
  ↓
┌─────────────────────────────────┐
│ OpenAI API Call:                │
│ • API key from env (server-side)│
│ • Never exposed to client       │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ Supabase Storage:               │
│ • Upload with user_id folder    │
│ • RLS enforces user ownership   │
└─────────────────────────────────┘
  ↓
Return Response
```

## Environment Variables Flow

```
.env.local (local) / Vercel Environment Variables (production)
  ↓
┌──────────────────────────────────────────────┐
│ NEXT_PUBLIC_* variables                      │
│ • Available to browser                       │
│ • Used in client components                  │
│ • NEXT_PUBLIC_SUPABASE_URL                   │
│ • NEXT_PUBLIC_SUPABASE_ANON_KEY              │
└──────────────────────────────────────────────┘
  ↓
Client-side Supabase Client

┌──────────────────────────────────────────────┐
│ Server-only variables                        │
│ • Only available on server                   │
│ • Never sent to browser                      │
│ • OPENAI_API_KEY                             │
└──────────────────────────────────────────────┘
  ↓
Server-side API Routes
```

## Performance Optimizations

1. **Server Components**: Reduce client-side JavaScript
2. **Image Optimization**: Next.js Image component with lazy loading
3. **Streaming**: Server components stream data progressively
4. **Static Generation**: Pre-render where possible
5. **Edge Functions**: Fast response times via Vercel Edge

## Security Layers

```
Layer 1: Middleware
  ↓ Validates every request
Layer 2: Server Components
  ↓ Check auth before rendering
Layer 3: API Routes
  ↓ Verify user session
Layer 4: Supabase RLS
  ↓ Database-level access control
Layer 5: Storage Policies
  ↓ File-level access control
```

## Scalability Considerations

- **Horizontal Scaling**: Vercel automatically scales
- **Database**: Supabase connection pooling
- **Storage**: CDN for image delivery
- **API**: Rate limiting can be added
- **Caching**: Consider Redis for sessions

## Monitoring Points

1. **Frontend**: Error boundaries, loading states
2. **API**: Response times, error rates
3. **OpenAI**: Usage, costs, rate limits
4. **Supabase**: Storage usage, bandwidth, queries
5. **Vercel**: Function execution, bandwidth

---

This architecture provides a secure, scalable foundation for AI image generation!

