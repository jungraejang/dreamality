'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { AnimatedButton } from '@/components/animated-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Move, RotateCw, Trash2, Maximize2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { SandboxScene } from '@/components/sandbox/sandbox-scene'
import { ModelSelector } from '@/components/sandbox/model-selector'
import { FadeIn } from '@/components/animations/fade-in'

interface Model3D {
  id: string
  glb_url: string
  image?: {
    prompt: string
    image_url: string
  }
}

interface PlacedModel {
  id: string
  modelId: string
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

interface SandboxClientProps {
  models: Model3D[]
}

export function SandboxClient({ models }: SandboxClientProps) {
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())
  const [placedModels, setPlacedModels] = useState<PlacedModel[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate')
  const [uniformScale, setUniformScale] = useState(true)
  const instanceCounterRef = useRef(0)

  const handleToggleModel = useCallback((modelId: string) => {
    const model = models.find((m) => m.id === modelId)
    if (!model) return

    // Check if already selected to avoid double-add from Strict Mode
    setSelectedModels((prev) => {
      if (prev.has(modelId)) {
        // Remove model
        const newSet = new Set(prev)
        newSet.delete(modelId)
        setPlacedModels((prevPlaced) =>
          prevPlaced.filter((pm) => pm.modelId !== modelId)
        )
        return newSet
      } else {
        // Add model - check if already in placedModels to prevent duplicates
        setPlacedModels((prevPlaced) => {
          // Check if this model is already placed
          if (prevPlaced.some((pm) => pm.modelId === modelId)) {
            return prevPlaced // Don't add duplicate
          }
          // Place at random position on ground
          const x = (Math.random() - 0.5) * 10
          const z = (Math.random() - 0.5) * 10
          const newInstanceId = `placed-${instanceCounterRef.current++}`
          return [
            ...prevPlaced,
            {
              id: newInstanceId,
              modelId: modelId,
              url: model.glb_url,
              position: [x, 0, z],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
            },
          ]
        })
        const newSet = new Set(prev)
        newSet.add(modelId)
        return newSet
      }
    })
  }, [models])

  const handleResetSandbox = () => {
    setSelectedModels(new Set())
    setPlacedModels([])
  }

  const handleModelSelect = useCallback((instanceId: string | null) => {
    setSelectedModelId(instanceId)
  }, [])

  const handleModelTransform = useCallback((
    instanceId: string, 
    position: [number, number, number], 
    rotation: [number, number, number],
    scale: [number, number, number]
  ) => {
    setPlacedModels((prev) =>
      prev.map((pm) =>
        pm.id === instanceId ? { ...pm, position, rotation, scale } : pm
      )
    )
  }, [])

  // Get selected model's current scale
  const selectedModel = placedModels.find((pm) => pm.id === selectedModelId)
  
  const handleScaleChange = useCallback((axis: 'x' | 'y' | 'z' | 'uniform', value: number) => {
    if (!selectedModelId) return
    
    setPlacedModels((prev) =>
      prev.map((pm) => {
        if (pm.id !== selectedModelId) return pm
        
        let newScale: [number, number, number]
        if (axis === 'uniform') {
          newScale = [value, value, value]
        } else {
          newScale = [...pm.scale] as [number, number, number]
          const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
          newScale[axisIndex] = value
        }
        return { ...pm, scale: newScale }
      })
    )
  }, [selectedModelId])

  const handleDeleteSelected = useCallback(() => {
    if (!selectedModelId) return
    
    setPlacedModels((prev) => {
      const placedModel = prev.find((pm) => pm.id === selectedModelId)
      if (!placedModel) return prev
      
      const filtered = prev.filter((pm) => pm.id !== selectedModelId)
      
      // Check if there are still instances of this model
      const stillHasInstances = filtered.some(
        (pm) => pm.modelId === placedModel.modelId
      )
      
      if (!stillHasInstances) {
        setSelectedModels((prevSelected) => {
          const newSet = new Set(prevSelected)
          newSet.delete(placedModel.modelId)
          return newSet
        })
      }
      
      return filtered
    })
    setSelectedModelId(null)
  }, [selectedModelId])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">3D Sandbox</h1>
              <p className="text-muted-foreground mt-2">
                Place and arrange your 3D models in a virtual environment
              </p>
            </div>
            <div className="flex gap-2">
              <AnimatedButton
                variant="outline"
                onClick={handleResetSandbox}
                disabled={placedModels.length === 0}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </AnimatedButton>
              <Link href="/">
                <AnimatedButton variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="flex gap-4 text-sm">
            <div className="px-4 py-2 bg-primary/10 rounded-lg">
              <span className="font-semibold">{placedModels.length}</span> models in sandbox
            </div>
            <div className="px-4 py-2 bg-secondary/10 rounded-lg">
              <span className="font-semibold">{models.length}</span> models available
            </div>
          </div>
        </FadeIn>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Sandbox - Takes 2 columns */}
          <FadeIn delay={0.2} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sandbox Environment</CardTitle>
                <CardDescription>
                  Click models in the scene to remove them. Use mouse to orbit, zoom, and pan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Transform Toolbar */}
                <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-lg">
                  <span className="text-sm font-medium mr-2">Tools:</span>
                  <AnimatedButton
                    size="sm"
                    variant={transformMode === 'translate' ? 'default' : 'outline'}
                    onClick={() => setTransformMode('translate')}
                  >
                    <Move className="h-4 w-4 mr-1" />
                    Move
                  </AnimatedButton>
                  <AnimatedButton
                    size="sm"
                    variant={transformMode === 'rotate' ? 'default' : 'outline'}
                    onClick={() => setTransformMode('rotate')}
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    Rotate
                  </AnimatedButton>
                  <AnimatedButton
                    size="sm"
                    variant={transformMode === 'scale' ? 'default' : 'outline'}
                    onClick={() => setTransformMode('scale')}
                  >
                    <Maximize2 className="h-4 w-4 mr-1" />
                    Scale
                  </AnimatedButton>
                  <div className="flex-1" />
                  {selectedModelId && (
                    <AnimatedButton
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </AnimatedButton>
                  )}
                </div>

                {/* Scale Controls - fixed height to prevent layout shift */}
                <div className={`p-3 bg-muted/50 rounded-lg h-[140px] transition-opacity ${selectedModelId && selectedModel ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Scale Controls</span>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="uniform-scale"
                        checked={uniformScale}
                        onCheckedChange={(checked) => setUniformScale(checked as boolean)}
                        disabled={!selectedModelId}
                      />
                      <Label htmlFor="uniform-scale" className="text-xs">
                        Uniform
                      </Label>
                    </div>
                  </div>
                  
                  {!selectedModelId ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      Select a model to adjust scale
                    </p>
                  ) : selectedModel && uniformScale ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Size</Label>
                        <span className="text-xs text-muted-foreground">
                          {selectedModel.scale[0].toFixed(2)}x
                        </span>
                      </div>
                      <Slider
                        value={[selectedModel.scale[0]]}
                        min={0.1}
                        max={5}
                        step={0.1}
                        onValueChange={([v]) => handleScaleChange('uniform', v)}
                      />
                    </div>
                  ) : selectedModel ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-red-500 w-4">X</Label>
                        <Slider
                          value={[selectedModel.scale[0]]}
                          min={0.1}
                          max={5}
                          step={0.1}
                          onValueChange={([v]) => handleScaleChange('x', v)}
                          className="flex-1 [&_[role=slider]]:bg-red-500"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {selectedModel.scale[0].toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-green-500 w-4">Y</Label>
                        <Slider
                          value={[selectedModel.scale[1]]}
                          min={0.1}
                          max={5}
                          step={0.1}
                          onValueChange={([v]) => handleScaleChange('y', v)}
                          className="flex-1 [&_[role=slider]]:bg-green-500"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {selectedModel.scale[1].toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-blue-500 w-4">Z</Label>
                        <Slider
                          value={[selectedModel.scale[2]]}
                          min={0.1}
                          max={5}
                          step={0.1}
                          onValueChange={([v]) => handleScaleChange('z', v)}
                          className="flex-1 [&_[role=slider]]:bg-blue-500"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {selectedModel.scale[2].toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <SandboxScene
                  placedModels={placedModels}
                  selectedModelId={selectedModelId}
                  transformMode={transformMode}
                  onModelSelect={handleModelSelect}
                  onModelTransform={handleModelTransform}
                />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>🖱️ <strong>Left Click + Drag:</strong> Rotate camera (when no model selected)</p>
                  <p>🖱️ <strong>Right Click + Drag:</strong> Pan camera</p>
                  <p>🖱️ <strong>Scroll:</strong> Zoom in/out</p>
                  <p>👆 <strong>Click Model:</strong> Select model</p>
                  <p>🔧 <strong>Drag Gizmo:</strong> Move or rotate selected model</p>
                  <p>⬜ <strong>Click Ground:</strong> Deselect model</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Model Selector - Takes 1 column */}
          <FadeIn delay={0.3}>
            <ModelSelector
              models={models}
              selectedModels={selectedModels}
              onToggleModel={handleToggleModel}
            />
          </FadeIn>
        </div>
      </div>
    </div>
  )
}

