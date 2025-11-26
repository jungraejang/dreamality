'use client'

import { ImageCard } from '@/components/gallery/image-card'
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/animations/fade-in'

interface GeneratedImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
}

export function GalleryGrid({ images }: { images: GeneratedImage[] }) {
  return (
    <FadeInStagger>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <FadeInItem key={image.id}>
            <ImageCard image={image} />
          </FadeInItem>
        ))}
      </div>
    </FadeInStagger>
  )
}

