# Dreamality - AI Image Generation for 3D Models

A modern web application that generates AI images optimized for 3D model creation using OpenAI's DALL-E API, built with Next.js, Supabase, and shadcn/ui.

## Features

- 🎨 **AI Image Generation**: Generate images from text prompts using OpenAI's DALL-E 3
- 🎯 **3D-Optimized**: Automatically adds white background for seamless 3D model generation
- 🎲 **3D Model Generation**: Convert images to 3D models using Meshy API (preview mode)
- 👁️ **3D Viewer**: Interactive 3D model viewer with Three.js
- 🔐 **Authentication**: Secure user authentication with Supabase Auth
- 💾 **Dual Storage**: Images and 3D models stored in Supabase
- 🖼️ **Dual Gallery**: Separate galleries for images and 3D models
- 📱 **Responsive Design**: Beautiful UI built with shadcn/ui components
- ⚡ **Modern Stack**: Next.js 16 with App Router and Server Components

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: shadcn/ui with Tailwind CSS
- **Authentication & Database**: Supabase
- **AI Image Generation**: OpenAI DALL-E 3 API
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account
- An [OpenAI](https://platform.openai.com) API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd dreamality
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `supabase-setup.sql` and run it
4. This will create:
   - `images` table for storing image metadata
   - Storage bucket `generated-images` for storing images
   - Row Level Security policies

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Meshy (for 3D model generation)
MESHY_API_KEY=your_meshy_api_key
```

**To get your Supabase credentials:**
- Go to your Supabase project settings
- Navigate to **API** section
- Copy the `Project URL` and `anon/public` key

**To get your OpenAI API key:**
- Go to [platform.openai.com](https://platform.openai.com)
- Navigate to **API Keys**
- Create a new secret key

**To get your Meshy API key:**
- Go to [meshy.ai](https://www.meshy.ai)
- Sign up and navigate to **API Keys**
- Create a new API key

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Login**: Sign in at `/login`
3. **Generate Images**: 
   - Describe the object you want to create (e.g., "a vintage wooden chair with carved details")
   - The system automatically adds "image for 3d model generation, white background," to optimize for 3D modeling
   - Click "Generate Image"
   - Wait for the AI to create your image with white background
   - Preview and download the result
4. **View Gallery**: Access `/gallery` to see all your generated images
5. **Use with Meshy API**: Download images and use them with Meshy API for 3D model generation

## Project Structure

```
dreamality/
├── app/
│   ├── api/
│   │   └── generate-image/    # OpenAI image generation endpoint
│   ├── auth/
│   │   └── callback/           # Auth callback handler
│   ├── gallery/                # Image gallery page
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   ├── layout.tsx              # Root layout with header
│   └── page.tsx                # Main image generation page
├── components/
│   ├── auth/
│   │   └── user-nav.tsx        # User navigation component
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── supabase/               # Supabase client utilities
│   └── utils.ts                # Utility functions
├── middleware.ts               # Auth middleware
└── supabase-setup.sql          # Database setup script
```

## Key Features Explained

### Authentication Flow
- Uses Supabase Auth with email/password
- Middleware protects routes automatically
- Server and client components handle auth state

### Image Generation
- Sends prompt to `/api/generate-image`
- Uses OpenAI DALL-E 3 for generation
- Automatically uploads to Supabase Storage
- Saves metadata to database

### Storage
- Images stored in Supabase Storage bucket
- Organized by user ID
- Public URLs for easy access
- Row Level Security ensures privacy

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `OPENAI_API_KEY` | Your OpenAI API key |

## Troubleshooting

### Images not uploading
- Ensure the `generated-images` bucket exists in Supabase Storage
- Check that storage policies are correctly set up
- Verify your Supabase credentials

### Authentication issues
- Confirm email confirmation is disabled in Supabase Auth settings (for development)
- Check that middleware is properly configured
- Verify environment variables are set

### OpenAI API errors
- Ensure your API key is valid and has credits
- Check rate limits on your OpenAI account
- Verify the API key has access to DALL-E 3

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
