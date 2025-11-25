# 3D Model Generation Integration

Dreamality is optimized for generating images that can be converted into 3D models using the Meshy API.

## How It Works

### Automatic Prompt Enhancement

Every user prompt is automatically enhanced with:
```
"image for 3d model generation, white background, {user_prompt}"
```

This ensures:
- ✅ Clean white background for easy object isolation
- ✅ Optimized composition for 3D conversion
- ✅ Better results with Meshy API

### Example Transformations

**User enters:**
```
"a vintage wooden chair with carved details"
```

**Actual prompt sent to DALL-E 3:**
```
"image for 3d model generation, white background, a vintage wooden chair with carved details"
```

## Best Practices for Prompts

### ✅ Good Prompts (Single Objects)

1. **Furniture**
   - "a modern office chair with mesh back and armrests"
   - "a rustic wooden dining table with turned legs"
   - "a vintage bookshelf with glass doors"

2. **Decorative Items**
   - "a ceramic vase with blue and white patterns"
   - "a brass table lamp with fabric shade"
   - "a decorative wall clock with Roman numerals"

3. **Fantasy/Game Assets**
   - "a medieval sword with leather-wrapped handle"
   - "a fantasy potion bottle with glowing liquid"
   - "a treasure chest with metal reinforcements"

4. **Everyday Objects**
   - "a modern coffee maker with stainless steel finish"
   - "a vintage typewriter with round keys"
   - "a leather backpack with multiple pockets"

### ❌ Avoid These

1. **Multiple Objects**
   - ❌ "a chair and table in a room"
   - ✅ "a wooden chair" (separate request for table)

2. **Complex Scenes**
   - ❌ "a cozy living room with furniture"
   - ✅ "a modern sofa with cushions"

3. **Background Details**
   - ❌ "a vase on a table in a garden"
   - ✅ "a decorative ceramic vase"

4. **People or Animals**
   - ❌ "a person sitting on a chair"
   - ✅ "an ergonomic office chair"

## Workflow: Dreamality → Meshy API

### Step 1: Generate Image in Dreamality
```
User prompt: "a steampunk pocket watch with brass gears"
↓
Enhanced: "image for 3d model generation, white background, 
           a steampunk pocket watch with brass gears"
↓
DALL-E 3 generates image with white background
↓
Saved to Supabase Storage
```

### Step 2: Download from Gallery
- Go to `/gallery`
- Find your image
- Click "Download"
- Save to your computer

### Step 3: Use with Meshy API
```javascript
// Example Meshy API integration
const formData = new FormData();
formData.append('image', imageFile);
formData.append('mode', 'preview'); // or 'refine'

const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${MESHY_API_KEY}`
  },
  body: formData
});

const result = await response.json();
// result.model_url contains your 3D model
```

## Technical Details

### Image Specifications

Generated images are:
- **Format**: PNG
- **Size**: 1024x1024 pixels
- **Background**: White (#FFFFFF)
- **Quality**: Standard (DALL-E 3)
- **Model**: dall-e-3

### Storage Structure

Images are stored in Supabase:
```
generated-images/
└── {user_id}/
    └── {timestamp}.png
```

### Database Schema

Each image record includes:
```sql
{
  id: UUID,
  user_id: UUID,
  prompt: TEXT,              -- Original user prompt
  image_url: TEXT,           -- Public URL
  storage_path: TEXT,        -- Storage location
  created_at: TIMESTAMP
}
```

## Future Enhancements

Potential features to add:

### 1. Direct Meshy Integration
```typescript
// Add to API route
const meshyResponse = await fetch('https://api.meshy.ai/v1/image-to-3d', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.MESHY_API_KEY}`
  },
  body: formData
});
```

### 2. 3D Model Gallery
- Store generated 3D models
- Preview in browser using Three.js
- Download in various formats (GLB, FBX, OBJ)

### 3. Batch Processing
- Generate multiple angles of same object
- Automatically create 3D model
- Queue system for processing

### 4. Advanced Options
- Different background colors
- Multiple image sizes
- Quality settings (standard vs HD)

## Meshy API Resources

- **Documentation**: https://docs.meshy.ai
- **API Reference**: https://docs.meshy.ai/api-reference
- **Pricing**: Check Meshy.ai for current rates
- **Models Supported**: GLB, FBX, OBJ, USDZ

## Tips for Best Results

### Lighting & Detail
- Mention "well-lit" or "studio lighting" for better 3D conversion
- Add "detailed textures" for more realistic models
- Specify materials: "wooden", "metallic", "ceramic", etc.

### Angles & Perspective
- "front view" or "isometric view" can help
- Avoid extreme angles or perspectives
- Center the object in frame

### Style Consistency
- Use consistent style across related objects
- Specify art style: "realistic", "stylized", "low-poly"
- Mention texture detail level

## Example Workflow

```bash
# 1. User generates image
User: "a medieval helmet with visor"
System: Generates with white background

# 2. Image saved to Supabase
URL: https://xxx.supabase.co/storage/v1/object/public/generated-images/user123/1234567890.png

# 3. Download and use with Meshy
curl -X POST https://api.meshy.ai/v1/image-to-3d \
  -H "Authorization: Bearer YOUR_MESHY_KEY" \
  -F "image=@helmet.png" \
  -F "mode=preview"

# 4. Get 3D model
Response: { "model_url": "https://...", "task_id": "..." }
```

## Cost Considerations

### Dreamality (per image)
- OpenAI DALL-E 3: ~$0.04 per image
- Supabase Storage: Included in free tier (500MB)

### Meshy API (approximate)
- Image-to-3D Preview: ~$0.10 per model
- Image-to-3D Refine: ~$0.50 per model
- Check Meshy.ai for current pricing

## Troubleshooting

### White Background Not Clean
- Try adding "isolated object" to your prompt
- Use "product photography style"
- Mention "clean white studio background"

### Object Too Small/Large
- Specify size in prompt: "close-up view"
- Mention "fills the frame"
- Use "product shot" for proper framing

### Multiple Objects Generated
- Be very specific: "a single chair"
- Use "one" or "single" in prompt
- Simplify the description

## Support

For issues with:
- **Image Generation**: Check Dreamality documentation
- **3D Conversion**: Refer to Meshy API docs
- **Integration**: See this guide

---

Happy 3D modeling! 🎨 → 🎲

