# 🎨 Get Started with Dreamality

Welcome! Your AI image generation app is ready to go. Follow these steps to get it running.

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. In SQL Editor, paste contents of `supabase-setup.sql` and run it
3. Get your credentials from Settings → API

### 3. Get OpenAI API Key
1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Make sure you have credits in your account

### 4. Configure Environment
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 5. Run the App
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🚀

## 📚 Documentation

Your project includes comprehensive documentation:

- **`README.md`** - Full project documentation
- **`QUICKSTART.md`** - 5-minute setup guide
- **`SETUP_GUIDE.md`** - Detailed setup with troubleshooting
- **`PROJECT_SUMMARY.md`** - Architecture and technical details
- **`DEPLOYMENT_CHECKLIST.md`** - Pre-deployment checklist
- **`FILES_OVERVIEW.md`** - Complete file structure guide

## ✨ Features

✅ **AI Image Generation** - DALL-E 3 powered  
✅ **User Authentication** - Secure login/signup  
✅ **Image Storage** - Automatic save to Supabase  
✅ **Personal Gallery** - View all your creations  
✅ **Modern UI** - Beautiful, responsive design  
✅ **Type-Safe** - Full TypeScript support  

## 🎯 First Steps

1. **Sign Up** - Create your account at `/signup`
2. **Generate** - Try this prompt: "A serene mountain landscape at sunset"
3. **View Gallery** - Check out your saved images at `/gallery`

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 + React + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth + Database + Storage)
- **AI**: OpenAI DALL-E 3

## 📁 Project Structure

```
dreamality/
├── app/                    # Next.js pages and API routes
│   ├── api/generate-image/ # Image generation endpoint
│   ├── gallery/            # Image gallery
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── components/             # React components
│   ├── auth/               # Auth-related components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities and helpers
│   └── supabase/           # Supabase clients
└── supabase-setup.sql      # Database setup script
```

## 🔧 Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

## 💡 Example Prompts

Try these to test your app (full-body, neutral pose, white background added automatically):

**Characters:**
- "a medieval knight in full armor"
- "a futuristic robot with sleek metallic design"
- "a fantasy elf warrior with bow and quiver"
- "a steampunk inventor with goggles and coat"

**Objects:**
- "a vintage wooden chair with carved details"
- "a modern ceramic vase with geometric patterns"
- "a fantasy sword with ornate handle and glowing runes"
- "a retro arcade machine with colorful buttons"

**Creatures:**
- "a dragon with detailed scales and wings"
- "a mechanical spider with brass legs"

## 🚀 Deploy to Production

When ready to deploy:

1. Review `DEPLOYMENT_CHECKLIST.md`
2. Push code to GitHub
3. Import to [Vercel](https://vercel.com)
4. Add environment variables
5. Deploy!

## 💰 Cost Estimates

- **Supabase**: Free tier (500MB storage, 2GB bandwidth)
- **Vercel**: Free tier for hobby projects
- **OpenAI**: ~$0.04 per image (DALL-E 3, 1024x1024)

Set up billing alerts to monitor costs!

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check environment variables in `.env.local`
- Make sure you're logged in
- Restart dev server after changing env vars

### Images Not Saving
- Verify `generated-images` bucket exists in Supabase
- Check storage policies were created
- Review browser console for errors

### OpenAI Errors
- Verify API key is correct
- Check account has credits
- Ensure key starts with `sk-`

## 📖 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

## 🆘 Need Help?

1. Check the documentation files
2. Review error messages in console
3. Check Supabase dashboard logs
4. Verify all environment variables are set

## 🎉 You're All Set!

Your AI image generation app is ready to use. Start creating amazing images with AI!

---

**Happy Generating!** 🎨✨

Built with Next.js, Supabase, and OpenAI

