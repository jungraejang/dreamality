import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { ModelStatusCard } from '@/components/3d/model-status-card'
import { Model3D } from '@/types/database.types'

interface Model3DWithImage extends Omit<Model3D, 'image'> {
  image?: {
    prompt: string
    image_url: string
  }
}

export default async function Models3DPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch 3D models with their source images
  const { data: models, error } = await supabase
    .from('models_3d')
    .select(`
      *,
      image:images(prompt, image_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Your 3D Models</h1>
            <p className="text-muted-foreground mt-2">
              AI-generated 3D models from your images
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/gallery">
              <Button variant="outline">
                <ImageIcon className="mr-2 h-4 w-4" />
                Image Gallery
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
              <p className="text-destructive">Failed to load models: {error.message}</p>
            </CardContent>
          </Card>
        )}

        {!error && (!models || models.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>No 3D models yet</CardTitle>
              <CardDescription>
                Generate 3D models from your images in the gallery!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/gallery">
                <Button>Go to Gallery</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {models && models.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model: Model3DWithImage) => (
              <ModelStatusCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

