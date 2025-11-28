'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedButton } from '@/components/animated-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'

interface Model3D {
  id: string
  glb_url: string
  image?: {
    prompt: string
    image_url: string
  }
}

interface ModelSelectorProps {
  models: Model3D[]
  selectedModels: Set<string>
  onToggleModel: (modelId: string) => void
}

export function ModelSelector({ models, selectedModels, onToggleModel }: ModelSelectorProps) {
  if (models.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No 3D Models</CardTitle>
          <CardDescription>
            Generate some 3D models first to use them in the sandbox!
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your 3D Models</CardTitle>
        <CardDescription>
          Select models to place in the sandbox environment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {models.map((model) => {
            const isSelected = selectedModels.has(model.id)
            return (
              <div
                key={model.id}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer hover:border-primary ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => onToggleModel(model.id)}
              >
                {/* Thumbnail */}
                {model.image?.image_url && (
                  <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={model.image.image_url}
                      alt={model.image.prompt || 'Model'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {model.image?.prompt || 'Unnamed Model'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isSelected ? 'In sandbox' : 'Click to add'}
                  </p>
                </div>

                {/* Checkbox/Icon */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="p-1 rounded-full bg-primary text-primary-foreground">
                      <Minus className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full border">
                      <Plus className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

