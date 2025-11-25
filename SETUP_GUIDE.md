# Dreamality Setup Guide

This guide will walk you through setting up the Dreamality AI image generation app step by step.

## Quick Start Checklist

- [ ] Install dependencies
- [ ] Create Supabase project
- [ ] Run database setup SQL
- [ ] Get OpenAI API key
- [ ] Configure environment variables
- [ ] Start development server

## Detailed Setup Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `dreamality` (or your choice)
   - Database password: (save this securely)
   - Region: (choose closest to you)
4. Wait for the project to be created (~2 minutes)

### Step 3: Set Up Database and Storage

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-setup.sql` from this project
4. Paste into the SQL editor
5. Click "Run" or press `Ctrl/Cmd + Enter`
6. You should see "Success. No rows returned"

This creates:
- `images` table for storing image metadata
- `generated-images` storage bucket for image files
- Security policies for user data isolation

### Step 4: Configure Supabase Auth (Optional but Recommended for Development)

1. Go to **Authentication** → **Providers** in Supabase
2. Under **Email**, toggle on "Enable Email provider"
3. For development, you can disable "Confirm email" to skip email verification
4. Click "Save"

### Step 5: Get Supabase Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 6: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or login
3. Click your profile icon → "View API keys"
4. Click "Create new secret key"
5. Give it a name (e.g., "Dreamality")
6. Copy the key (you won't see it again!)
7. **Important**: Make sure you have credits in your OpenAI account

### Step 7: Create Environment Variables

1. Create a file named `.env.local` in the root of the project
2. Add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
```

**Important**: 
- Replace the placeholder values with your actual credentials
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `NEXT_PUBLIC_` prefix makes variables available to the browser

### Step 8: Verify Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. You should see a bucket named `generated-images`
3. Click on it and verify it's set to "Public"
4. If it doesn't exist, the SQL script may not have run correctly - try running it again

### Step 9: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 10: Test the Application

1. **Sign Up**: Go to `/signup` and create a test account
2. **Login**: You should be redirected to the home page
3. **Generate Image**: 
   - Enter a prompt like "a serene mountain landscape at sunset"
   - Click "Generate Image"
   - Wait 10-30 seconds for generation
4. **View Gallery**: Click "View your image gallery" to see saved images

## Common Issues and Solutions

### Issue: "Unauthorized" error when generating images

**Solution**: 
- Make sure you're logged in
- Check that your Supabase URL and anon key are correct in `.env.local`
- Restart the dev server after changing environment variables

### Issue: Images generate but don't save to Supabase

**Solution**:
- Verify the `generated-images` bucket exists in Supabase Storage
- Check that storage policies were created (run the SQL script again)
- Look at the browser console for specific error messages

### Issue: "Invalid API key" from OpenAI

**Solution**:
- Verify your OpenAI API key is correct
- Make sure the key starts with `sk-`
- Check that your OpenAI account has available credits
- Restart the dev server after adding the key

### Issue: Can't sign up or login

**Solution**:
- Check Supabase Auth settings (Authentication → Providers)
- Ensure Email provider is enabled
- For development, disable "Confirm email" requirement
- Check browser console for specific errors

### Issue: Gallery page shows "Failed to load images"

**Solution**:
- Verify the `images` table exists in Supabase
- Check that RLS policies were created
- Make sure you're logged in
- Try generating an image first

## Testing Prompts

Here are some good prompts to test with (optimized for 3D model generation):

1. "a vintage wooden chair with carved armrests and detailed textures"
2. "a modern ceramic coffee mug with geometric patterns"
3. "a fantasy potion bottle with glowing liquid inside"
4. "a steampunk pocket watch with exposed gears and brass finish"
5. "a decorative treasure chest with metal hinges and lock"

Note: "image for 3d model generation, white background," is automatically added to all prompts.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `OPENAI_API_KEY` | Yes | OpenAI API key for DALL-E |

## Next Steps

Once everything is working:

1. **Customize the UI**: Modify components in `components/` and pages in `app/`
2. **Add Features**: 
   - Image editing options
   - Different AI models
   - Image variations
   - Sharing functionality
3. **Deploy**: Follow the README for deployment instructions
4. **Set up production auth**: Enable email confirmation for production

## Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check the terminal where `npm run dev` is running
3. Review the Supabase logs in the dashboard
4. Verify all environment variables are set correctly
5. Make sure all dependencies are installed

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- In production, enable email confirmation
- Consider rate limiting for the API endpoint
- Monitor your OpenAI API usage and costs

## Cost Considerations

- **Supabase**: Free tier includes 500MB storage and 2GB bandwidth
- **OpenAI DALL-E 3**: ~$0.04 per image (1024x1024, standard quality)
- **Vercel**: Free tier for hobby projects

Monitor your usage to avoid unexpected costs!

---

Happy generating! 🎨✨
