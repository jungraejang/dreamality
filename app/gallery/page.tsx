import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedButton } from '@/components/animated-button'
import { ArrowLeft } from 'lucide-react'
import { GalleryGrid } from './page-client'

interface GeneratedImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
}

export default async function GalleryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: images, error } = await supabase
    .from('images')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Your Images</h1>
            <p className="text-muted-foreground mt-2">
              All your AI-generated images in one place
            </p>
          </div>
          <Link href="/">
            <AnimatedButton variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </AnimatedButton>
          </Link>
        </div>

        {error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load images: {error.message}</p>
            </CardContent>
          </Card>
        )}

        {!error && (!images || images.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>No images yet</CardTitle>
              <CardDescription>
                Start generating images to see them here!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <AnimatedButton>Generate Your First Image</AnimatedButton>
              </Link>
            </CardContent>
          </Card>
        )}

        {images && images.length > 0 && <GalleryGrid images={images} />}
      </div>
    </div>
  )
}

