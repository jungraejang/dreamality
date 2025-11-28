import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SandboxClient } from './page-client'
import { SandboxSession } from '@/types/database.types'

export default async function SandboxPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's completed 3D models
  const { data: models, error: modelsError } = await supabase
    .from('models_3d')
    .select(`
      *,
      image:images(prompt, image_url)
    `)
    .eq('user_id', user.id)
    .eq('status', 'SUCCEEDED')
    .not('glb_url', 'is', null)
    .order('created_at', { ascending: false })

  // Fetch user's saved sandbox sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('sandbox_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <SandboxClient 
      models={models || []} 
      initialSessions={(sessions as SandboxSession[]) || []} 
    />
  )
}

