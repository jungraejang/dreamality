'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles, Box } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating3D, setGenerating3D] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedImage(null)
    setImageId(null)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setGeneratedImage(data.imageUrl)
      setImageId(data.imageId) // Store the image ID for 3D generation
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate3D = async () => {
    if (!imageId || !generatedImage) return

    setGenerating3D(true)

    try {
      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          imageUrl: generatedImage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start 3D generation')
      }

      // Redirect to 3D models page
      router.push('/models-3d')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setGenerating3D(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Generate AI Images
          </h1>
          <p className="text-muted-foreground">
            Transform your ideas into stunning visuals with AI
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Image</CardTitle>
            <CardDescription>
              Describe the object you want to create. Images are optimized for 3D model generation with white backgrounds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Image Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="a vintage wooden chair, detailed textures..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Describe a single object with details. White background will be added automatically.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
              <CardDescription>Your AI-generated masterpiece - Ready for 3D conversion!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={generatedImage}
                  alt={prompt}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              
              {/* Primary Action: Generate 3D */}
              <Button
                onClick={handleGenerate3D}
                disabled={generating3D || !imageId}
                className="w-full"
                size="lg"
              >
                {generating3D ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting 3D Generation...
                  </>
                ) : (
                  <>
                    <Box className="mr-2 h-5 w-5" />
                    Generate 3D Model (2-3 min)
                  </>
                )}
              </Button>

              {/* Secondary Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(generatedImage, '_blank')}
                >
                  Open Full Size
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = generatedImage
                    link.download = 'generated-image.png'
                    link.click()
                  }}
                >
                  Download
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                💡 Click "Generate 3D Model" to convert this image into a 3D model using Meshy AI
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link href="/gallery" className="text-sm text-muted-foreground hover:text-primary">
            View your image gallery →
          </Link>
        </div>
      </div>
    </div>
  )
}

