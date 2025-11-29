'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { AnimatedButton } from '@/components/animated-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { Box, Download, Eye, Loader2, Trash2 } from 'lucide-react'

interface ImageCardProps {
  image: {
    id: string
    prompt: string
    image_url: string
    created_at: string
  }
}

export function ImageCard({ image }: ImageCardProps) {
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate3D = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: image.id,
          imageUrl: image.image_url,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start 3D generation')
      }

      // Redirect to 3D models page
      window.location.href = '/models-3d'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId: image.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete image')
      }

      setDeleted(true)
      setShowDeleteModal(false)
      setTimeout(() => window.location.reload(), 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (deleted) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square w-full bg-muted">
        <Image
          src={image.image_url}
          alt={image.prompt}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <CardHeader>
        <CardDescription className="line-clamp-2">
          {image.prompt}
        </CardDescription>
        <p className="text-xs text-muted-foreground">
          {new Date(image.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => window.open(image.image_url, '_blank')}
          >
            <Eye className="h-4 w-4" />
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => {
              const link = document.createElement('a')
              link.href = image.image_url
              link.download = `image-${image.id}.png`
              link.click()
            }}
          >
            <Download className="h-4 w-4" />
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting || generating}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </AnimatedButton>
          <AnimatedButton
            size="sm"
            className="flex-1 min-w-[120px]"
            onClick={handleGenerate3D}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Box className="mr-2 h-4 w-4" />
                Generate 3D
              </>
            )}
          </AnimatedButton>
        </div>
      </CardContent>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Image?"
        description="Are you sure you want to delete this image? This will also delete any 3D models generated from it. This action cannot be undone."
        isDeleting={deleting}
      />
    </Card>
  )
}

