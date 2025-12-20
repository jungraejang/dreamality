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
        stl_url: model.stl_url,
        obj_url: model.obj_url,
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

      // Download and store 3D files in Supabase Storage
      const downloadAndUpload = async (
        url: string | undefined,
        extension: string,
        contentType: string
      ): Promise<string | undefined> => {
        if (!url) return undefined
        
        try {
          console.log(`🔽 Downloading ${extension.toUpperCase()} from Meshy:`, url)
          const response = await fetch(url)
          
          if (response.ok) {
            const blob = await response.blob()
            const buffer = Buffer.from(await blob.arrayBuffer())
            console.log(`📦 ${extension.toUpperCase()} file size:`, buffer.length, 'bytes')

            const fileName = `${user.id}/${model.meshy_task_id}.${extension}`
            console.log(`⬆️  Uploading ${extension.toUpperCase()} to Supabase:`, fileName)
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('generated-images')
              .upload(fileName, buffer, {
                contentType,
                upsert: true,
              })

            if (!uploadError && uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('generated-images')
                .getPublicUrl(fileName)
              console.log(`✅ ${extension.toUpperCase()} saved to Supabase:`, publicUrl)
              return publicUrl
            } else {
              console.error(`❌ Failed to upload ${extension.toUpperCase()} to Supabase:`, uploadError)
            }
          } else {
            console.error(`❌ Failed to download ${extension.toUpperCase()} from Meshy, status:`, response.status)
          }
        } catch (error) {
          console.error(`❌ Error downloading/uploading ${extension.toUpperCase()}:`, error)
        }
        return undefined
      }

      // Download all available formats
      const [glbUrl, stlUrl, objUrl] = await Promise.all([
        downloadAndUpload(meshyData.model_urls?.glb, 'glb', 'model/gltf-binary'),
        downloadAndUpload(meshyData.model_urls?.stl, 'stl', 'model/stl'),
        downloadAndUpload(meshyData.model_urls?.obj, 'obj', 'model/obj'),
      ])

      if (glbUrl) updateData.glb_url = glbUrl
      if (stlUrl) updateData.stl_url = stlUrl
      if (objUrl) updateData.obj_url = objUrl
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
      stl_url: updateData.stl_url,
      obj_url: updateData.obj_url,
      error_message: updateData.error_message,
      progress: meshyData.progress || 0,
    })
  } catch (error) {
    console.error('Error checking 3D status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    )
  }
}

