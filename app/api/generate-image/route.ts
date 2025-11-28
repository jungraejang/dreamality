import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Replicate from 'replicate'
import { HfInference } from '@huggingface/inference'

export async function POST(request: Request) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || '',
  })
  
  const hf = new HfInference(process.env.HF_TOKEN)
  
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      prompt, 
      pose = 'neutral standing pose',
      view = 'front view',
      background = 'plain white background',
      lighting = 'evenly lit',
      nsfw = false
    } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    // Build comprehensive prompt with user-specified parameters
    const optimizedPrompt = `Full-body, head-to-toe render of ${prompt}, ${pose}, centered composition, ${background}, no shadows, no props unless specified. Clean silhouette for 3D model reference. High-detail, ${view}, ${lighting}, realistic proportions, uncluttered, optimized for 3D model generation.`

    console.log('🎨 Image Generation Request:')
    console.log('📝 User Prompt:', prompt)
    console.log('🧍 Pose:', pose)
    console.log('👁️  View:', view)
    console.log('🖼️  Background:', background)
    console.log('💡 Lighting:', lighting)
    console.log('🔞 NSFW:', nsfw)
    console.log('✨ Full Optimized Prompt:', optimizedPrompt)

    let buffer: Buffer

    if (nsfw) {
      // Use Hugging Face NSFW model
      console.log('🔞 Using NSFW model (Hugging Face Inference Endpoint)...')
      
      if (!process.env.HF_ENDPOINT_URL || !process.env.HF_TOKEN) {
        console.error('❌ Hugging Face credentials not configured')
        return NextResponse.json({ error: 'NSFW model not configured' }, { status: 500 })
      }

      const response = await fetch(process.env.HF_ENDPOINT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: optimizedPrompt,
          parameters: {
            num_inference_steps: 30,
            guidance_scale: 7.5,
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HF API error:', errorText)
        return NextResponse.json({ error: 'Failed to generate NSFW image' }, { status: 500 })
      }

      const contentType = response.headers.get('content-type')
      console.log('📦 HF Response content-type:', contentType)

      // Check if response is JSON (base64 encoded) or binary
      if (contentType?.includes('application/json')) {
        const jsonData = await response.json()
        console.log('📦 HF returned JSON, checking for base64...')
        
        // Handle base64 encoded image
        if (typeof jsonData === 'string' && jsonData.startsWith('iVBOR')) {
          // Direct base64 string
          buffer = Buffer.from(jsonData, 'base64')
        } else if (jsonData.image && typeof jsonData.image === 'string') {
          // Base64 in image field
          buffer = Buffer.from(jsonData.image, 'base64')
        } else if (Array.isArray(jsonData) && jsonData[0]) {
          // Array of base64 strings
          buffer = Buffer.from(jsonData[0], 'base64')
        } else {
          console.error('❌ Unexpected JSON format:', jsonData)
          return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 })
        }
      } else {
        // Binary image data
        const imageBlob = await response.blob()
        const arrayBuffer = await imageBlob.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      }
      
      console.log('✅ NSFW image generated, size:', buffer.length, 'bytes')
    } else {
      // Use Replicate Flux 2.0 Pro (safe)
      console.log('🚀 Using Flux 2.0 Pro (Replicate)...')
      
      if (!process.env.REPLICATE_API_TOKEN) {
        console.error('❌ REPLICATE_API_TOKEN is not configured')
        return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 })
      }

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

      console.log('📦 Replicate output type:', typeof output)

      // Replicate returns the image data as a stream of Uint8Arrays
      const chunks: Uint8Array[] = []
      
      if (output && typeof output === 'object' && Symbol.asyncIterator in output) {
        console.log('📥 Collecting image data stream...')
        for await (const chunk of output as AsyncIterable<Uint8Array>) {
          chunks.push(chunk)
        }
        console.log('📦 Collected', chunks.length, 'chunks')
      } else {
        console.error('❌ Unexpected output format from Replicate')
        return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 })
      }

      // Combine all chunks into a single buffer
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      buffer = Buffer.concat(chunks, totalLength)
      
      console.log('✅ Flux 2.0 generated image, size:', buffer.length, 'bytes')
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}.png`
    console.log('⬆️  Uploading to Supabase:', fileName, 'Size:', buffer.length, 'bytes')
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json({
        error: 'Image generated but storage failed',
      }, { status: 500 })
    }

    console.log('✅ Upload successful:', uploadData)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('generated-images').getPublicUrl(fileName)

    console.log('🔗 Public URL:', publicUrl)

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
      console.error('❌ Database error:', dbError)
    } else {
      console.log('✅ Image saved to database, ID:', imageData?.id)
    }

    console.log('🎉 Returning response with imageUrl:', publicUrl)

    return NextResponse.json({
      imageUrl: publicUrl,
      imageId: imageData?.id,
      prompt,
    })
  } catch (error) {
    console.error('❌ Error generating image:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}

