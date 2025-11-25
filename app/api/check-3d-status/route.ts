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

    const { modelId } = await request.json()

    if (!modelId) {
      return NextResponse.json({ error: 'Missing modelId' }, { status: 400 })
    }

    // Get the model from database
    const { data: model, error: modelError } = await supabase
      .from('models_3d')
      .select('*')
      .eq('id', modelId)
      .eq('user_id', user.id)
      .single()

    if (modelError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    console.log('📋 Current model status:', model.status)
    console.log('🔗 Current GLB URL:', model.glb_url)

    // If already completed or failed, return cached status
    if (model.status === 'SUCCEEDED' || model.status === 'FAILED') {
      return NextResponse.json({
        status: model.status,
        model_url: model.model_url,
        thumbnail_url: model.thumbnail_url,
        glb_url: model.glb_url,
        fbx_url: model.fbx_url,
        usdz_url: model.usdz_url,
        error_message: model.error_message,
      })
    }

    // Check status with Meshy API
    const meshyResponse = await fetch(
      `https://api.meshy.ai/openapi/v1/image-to-3d/${model.meshy_task_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
        },
      }
    )

    if (!meshyResponse.ok) {
      const errorData = await meshyResponse.json()
      console.error('Meshy API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to check status', details: errorData },
        { status: meshyResponse.status }
      )
    }

    const meshyData = await meshyResponse.json()
    const status = meshyData.status // PENDING, IN_PROGRESS, SUCCEEDED, FAILED

    // Update database with new status
    const updateData: any = {
      status: status,
    }

    if (status === 'SUCCEEDED') {
      updateData.model_url = meshyData.model_url
      updateData.thumbnail_url = meshyData.thumbnail_url
      updateData.glb_url = meshyData.model_urls?.glb
      updateData.fbx_url = meshyData.model_urls?.fbx
      updateData.usdz_url = meshyData.model_urls?.usdz
      updateData.obj_url = meshyData.model_urls?.obj
      updateData.stl_url = meshyData.model_urls?.stl
      updateData.completed_at = new Date().toISOString()

      // Download and store GLB file in Supabase Storage
      try {
        if (meshyData.model_urls?.glb) {
          console.log('🔽 Downloading GLB from Meshy:', meshyData.model_urls.glb)
          
          const glbResponse = await fetch(meshyData.model_urls.glb)
          console.log('📥 GLB download response status:', glbResponse.status)
          
          if (glbResponse.ok) {
            const glbBlob = await glbResponse.blob()
            const glbBuffer = Buffer.from(await glbBlob.arrayBuffer())
            console.log('📦 GLB file size:', glbBuffer.length, 'bytes')

            // Upload to Supabase Storage
            const fileName = `${user.id}/${model.meshy_task_id}.glb`
            console.log('⬆️  Uploading to Supabase:', fileName)
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('generated-images')
              .upload(fileName, glbBuffer, {
                contentType: 'model/gltf-binary',
                upsert: true,
              })

            if (!uploadError && uploadData) {
              // Get permanent public URL
              const {
                data: { publicUrl },
              } = supabase.storage.from('generated-images').getPublicUrl(fileName)

              // Update with Supabase URL instead of Meshy URL
              updateData.glb_url = publicUrl
              console.log('✅ GLB saved to Supabase:', publicUrl)
              console.log('🎉 Now using YOUR storage URL instead of Meshy!')
            } else {
              console.error('❌ Failed to upload GLB to Supabase:', uploadError)
              console.log('⚠️  Falling back to Meshy URL')
            }
          } else {
            console.error('❌ Failed to download GLB from Meshy, status:', glbResponse.status)
          }
        }
      } catch (error) {
        console.error('❌ Error downloading/uploading GLB:', error)
        // Continue with Meshy URL if storage fails
      }
    } else if (status === 'FAILED') {
      updateData.error_message = meshyData.error || 'Unknown error'
      updateData.completed_at = new Date().toISOString()
    }

    console.log('💾 Updating database with:', updateData)
    
    const { error: updateError } = await supabase
      .from('models_3d')
      .update(updateData)
      .eq('id', modelId)

    if (updateError) {
      console.error('❌ Database update error:', updateError)
    } else {
      console.log('✅ Database updated successfully')
      console.log('🔗 New GLB URL in database:', updateData.glb_url)
    }

    return NextResponse.json({
      status: status,
      model_url: updateData.model_url,
      thumbnail_url: updateData.thumbnail_url,
      glb_url: updateData.glb_url,
      fbx_url: updateData.fbx_url,
      usdz_url: updateData.usdz_url,
      error_message: updateData.error_message,
      progress: meshyData.progress || 0,
    })
  } catch (error: any) {
    console.error('Error checking 3D status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    )
  }
}

