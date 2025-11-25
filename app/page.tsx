import { createClient } from '@/lib/supabase/server'
import { LandingHero } from '@/components/landing-hero'
import { ImageGenerator } from './page-client'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <LandingHero />
  }

  return <ImageGenerator />
}
