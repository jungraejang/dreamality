'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AnimatedButton } from '@/components/animated-button'
import { User } from '@supabase/supabase-js'

export function UserNav({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <AnimatedButton variant="ghost" onClick={() => router.push('/login')}>
          Login
        </AnimatedButton>
        <AnimatedButton onClick={() => router.push('/signup')}>
          Sign Up
        </AnimatedButton>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{user.email}</span>
      <AnimatedButton variant="outline" onClick={handleSignOut}>
        Sign Out
      </AnimatedButton>
    </div>
  )
}

