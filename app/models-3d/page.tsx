import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedButton } from '@/components/animated-button'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { ModelsGrid } from './page-client'

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
              <AnimatedButton variant="outline">
                <ImageIcon className="mr-2 h-4 w-4" />
                Image Gallery
              </AnimatedButton>
            </Link>
            <Link href="/">
              <AnimatedButton variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </AnimatedButton>
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
                <AnimatedButton>Go to Gallery</AnimatedButton>
              </Link>
            </CardContent>
          </Card>
        )}

        {models && models.length > 0 && <ModelsGrid models={models} />}
      </div>
    </div>
  )
}

