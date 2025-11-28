# Replicate Flux 2.0 Setup Guide

## Overview

Your app now uses **Replicate's Flux 2.0 Pro** instead of OpenAI DALL-E for image generation!

## Get Your Replicate API Token

1. Go to [replicate.com](https://replicate.com)
2. Sign up or log in
3. Navigate to **Account Settings** → **API Tokens**
4. Click **Create Token**
5. Copy your token (starts with `r8_`)

## Add to Environment Variables

Update your `.env.local`:

```env
# Replicate (for AI image generation)
REPLICATE_API_TOKEN=r8_your_token_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Meshy (for 3D model generation)
MESHY_API_KEY=your_meshy_api_key
```

**Important**: Remove the old `OPENAI_API_KEY` if you had it.

## Flux 2.0 Pro Features

### Advantages over DALL-E 3

- ✅ **Higher Quality** - Better image fidelity
- ✅ **More Control** - Better prompt following
- ✅ **Faster** - Usually 5-10 seconds
- ✅ **Better Details** - Especially for complex scenes
- ✅ **More Flexible** - Better at understanding nuanced prompts

### Model Specifications

- **Model**: `black-forest-labs/flux-2-pro`
- **Resolution**: 1024x1024 (configurable)
- **Format**: PNG
- **Quality**: 90%

## Pricing

Replicate charges per second of compute time:

- **Flux 2.0 Pro**: ~$0.04-0.06 per image (similar to DALL-E 3)
- **Billing**: Pay-as-you-go
- **Credits**: Add credits to your Replicate account

## How It Works

### API Call

```typescript
const output = await replicate.run(
  "black-forest-labs/flux-2-pro",
  {
    input: {
      prompt: optimizedPrompt,
      width: 1024,
      height: 1024,
      output_format: "png",
      output_quality: 90,
    }
  }
)
```

### Response

Replicate returns an array of URLs:
```typescript
output = ["https://replicate.delivery/...image.png"]
```

## Testing

1. Add your Replicate API token to `.env.local`
2. Restart your dev server
3. Generate an image
4. Check terminal logs for:
   ```
   ✅ Flux 2.0 generated image: https://replicate.delivery/...
   ```

## Example Prompts

Flux 2.0 Pro excels at:

**Characters:**
- "a medieval knight in full armor, detailed metal textures"
- "a cyberpunk hacker with neon accessories and holographic displays"
- "a fantasy wizard with flowing robes and magical staff"

**Objects:**
- "a vintage wooden chair with intricate carved details"
- "a futuristic sci-fi weapon with glowing energy core"
- "a steampunk pocket watch with exposed brass gears"

**Complex Scenes:**
- "a dragon with iridescent scales and detailed wing membranes"
- "a mechanical robot with weathered metal and rust details"

## Advantages for 3D Models

Flux 2.0 Pro is excellent for 3D model generation because:

1. **Better Edge Definition** - Cleaner silhouettes
2. **Consistent Lighting** - Easier for 3D conversion
3. **Detail Preservation** - Better textures for Meshy
4. **Prompt Adherence** - More accurate to your specifications

## Troubleshooting

### "Unauthorized" Error

**Solution:**
- Check your `REPLICATE_API_TOKEN` is correct
- Make sure it starts with `r8_`
- Restart dev server after adding token

### "Insufficient Credits"

**Solution:**
- Add credits to your Replicate account
- Go to replicate.com → Billing
- Add payment method and credits

### Slow Generation

**Solution:**
- Flux 2.0 Pro typically takes 5-15 seconds
- Check Replicate status page if unusually slow
- This is normal for high-quality generation

## Monitoring Usage

### Check Replicate Dashboard

1. Go to [replicate.com](https://replicate.com)
2. Navigate to **Usage** or **Billing**
3. See your API usage and costs
4. Set up billing alerts

### Estimate Costs

```
Images per month: 100
Cost per image: ~$0.05
Monthly cost: ~$5.00
```

## Migration from OpenAI

### What Changed

- ✅ Replaced OpenAI SDK with Replicate SDK
- ✅ Updated API endpoint
- ✅ Same image resolution (1024x1024)
- ✅ Same storage workflow
- ✅ Same user experience

### What Stayed the Same

- ✅ All UI components
- ✅ Supabase storage
- ✅ Image gallery
- ✅ 3D model generation
- ✅ User authentication

## Advanced Configuration

### Change Image Size

Edit `app/api/generate-image/route.ts`:

```typescript
input: {
  prompt: optimizedPrompt,
  width: 1024,    // Change to 512, 768, 1024, 1536, etc.
  height: 1024,   // Change to match aspect ratio
  output_format: "png",
  output_quality: 90,
}
```

### Adjust Quality

```typescript
output_quality: 90,  // 1-100, higher = better quality but larger file
```

### Add Seed for Reproducibility

```typescript
input: {
  prompt: optimizedPrompt,
  seed: 12345,  // Same seed = same image
  // ... other params
}
```

## Resources

- [Replicate Docs](https://replicate.com/docs)
- [Flux 2.0 Pro Model Page](https://replicate.com/black-forest-labs/flux-2-pro)
- [Replicate Node.js SDK](https://github.com/replicate/replicate-javascript)
- [Pricing](https://replicate.com/pricing)

## Support

For issues:
- **Replicate API**: support@replicate.com
- **Model Issues**: Check Replicate model page
- **Billing**: Replicate billing dashboard

---

**Enjoy better image generation with Flux 2.0 Pro!** 🎨✨

