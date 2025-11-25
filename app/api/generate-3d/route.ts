import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageId, imageUrl } = await request.json()

    if (!imageId || !imageUrl) {
      return NextResponse.json({ error: 'Missing imageId or imageUrl' }, { status: 400 })
    }

    // Check if Meshy API key is configured
    if (!process.env.MESHY_API_KEY) {
      console.error('MESHY_API_KEY is not configured')
      return NextResponse.json({ error: 'Meshy API key not configured' }, { status: 500 })
    }

    // Verify the image belongs to the user
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single()

    if (imageError || !image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Call Meshy API to start 3D generation
    // Using the correct Meshy API v1 endpoint
    console.log('Calling Meshy API with image URL:', imageUrl)
    
    const meshyResponse = await fetch('https://api.meshy.ai/openapi/v1/image-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        enable_pbr: true,
      }),
    })

    console.log('Meshy API response status:', meshyResponse.status)

    if (!meshyResponse.ok) {
      const errorData = await meshyResponse.json()
      console.error('Meshy API error:', errorData)
      console.error('Response status:', meshyResponse.status)
      console.error('Response headers:', Object.fromEntries(meshyResponse.headers.entries()))
      return NextResponse.json(
        { error: 'Failed to start 3D generation', details: errorData },
        { status: meshyResponse.status }
      )
    }

    const meshyData = await meshyResponse.json()
    const taskId = meshyData.result

    // Save the task to database
    const { data: model3d, error: dbError } = await supabase
      .from('models_3d')
      .insert({
        user_id: user.id,
        image_id: imageId,
        meshy_task_id: taskId,
        status: 'PENDING',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save task' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      taskId,
      modelId: model3d.id,
      message: '3D generation started. This will take 2-3 minutes.',
    })
  } catch (error: any) {
    console.error('Error generating 3D model:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate 3D model' },
      { status: 500 }
    )
  }
}

