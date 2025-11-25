import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Box } from 'lucide-react'
import { ImageCard } from '@/components/gallery/image-card'

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Your Gallery</h1>
            <p className="text-muted-foreground mt-2">
              All your AI-generated images in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/models-3d">
              <Button variant="outline">
                <Box className="mr-2 h-4 w-4" />
                3D Models
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
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
                <Button>Generate Your First Image</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {images && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image: GeneratedImage) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

