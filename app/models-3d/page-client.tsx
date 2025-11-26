'use client'

import { ModelStatusCard } from '@/components/3d/model-status-card'
import { FadeInStagger, FadeInItem } from '@/components/animations/fade-in'
import { Model3D } from '@/types/database.types'

interface Model3DWithImage extends Omit<Model3D, 'image'> {
  image?: {
    prompt: string
    image_url: string
  }
}

export function ModelsGrid({ models }: { models: Model3DWithImage[] }) {
  return (
    <FadeInStagger>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <FadeInItem key={model.id}>
            <ModelStatusCard model={model} />
          </FadeInItem>
        ))}
      </div>
    </FadeInStagger>
  )
}

