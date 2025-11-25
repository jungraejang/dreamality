# Quick Start Guide

Get Dreamality running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works!)
- An OpenAI API key with credits

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the contents of `supabase-setup.sql`
3. Get your credentials from Project Settings → API

### 3. Configure Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx...
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Sign Up** at `/signup`
2. **Generate an image** with a prompt like:
   - "A peaceful zen garden with cherry blossoms"
   - "A futuristic cityscape at night"
   - "A cozy coffee shop interior"
3. **View your gallery** at `/gallery`

## Need Help?

- See `SETUP_GUIDE.md` for detailed instructions
- Check `README.md` for full documentation
- Review `supabase-setup.sql` for database schema

## Common Issues

**"Unauthorized" error**: Make sure you're logged in and environment variables are set correctly

**Images not saving**: Verify the `generated-images` bucket exists in Supabase Storage

**OpenAI errors**: Check your API key has credits and is valid

---

That's it! Start generating amazing AI images! 🎨✨

