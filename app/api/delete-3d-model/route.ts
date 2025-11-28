import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
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

    // Get the model to verify ownership
    const { data: model, error: fetchError } = await supabase
      .from('models_3d')
      .select('*')
      .eq('id', modelId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // Delete GLB file from storage if it's stored in Supabase
    if (model.glb_url && model.glb_url.includes('supabase')) {
      const fileName = `${user.id}/${model.meshy_task_id}.glb`
      const { error: storageError } = await supabase.storage
        .from('generated-images')
        .remove([fileName])

      if (storageError) {
        console.error('Storage delete error:', storageError)
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('models_3d')
      .delete()
      .eq('id', modelId)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 })
    }

    console.log('✅ 3D model deleted:', modelId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting 3D model:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete model' },
      { status: 500 }
    )
  }
}

