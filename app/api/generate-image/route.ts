import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  })
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    // Add comprehensive prompt structure for optimal 3D model generation
    const optimizedPrompt = `Full-body, head-to-toe render of ${prompt}, neutral standing pose, centered composition, plain white background, no shadows, no props unless specified. Clean silhouette for 3D model reference. High-detail, front view, evenly lit, realistic proportions, uncluttered, optimized for 3D model generation.`

    // Generate image using OpenAI DALL-E
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: optimizedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    // Fetch the image data
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Return the temporary URL even if upload fails
      return NextResponse.json({
        imageUrl,
        message: 'Image generated but storage failed',
      })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('generated-images').getPublicUrl(fileName)

    // Save metadata to database
    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        prompt: prompt,
        image_url: publicUrl,
        storage_path: fileName,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.json({
      imageUrl: publicUrl,
      imageId: imageData?.id,
      prompt,
    })
  } catch (error: any) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}

