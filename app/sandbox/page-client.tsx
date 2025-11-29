'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { AnimatedButton } from '@/components/animated-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Move, RotateCw, Trash2, Maximize2, Camera } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { SandboxScene, SandboxSceneHandle } from '@/components/sandbox/sandbox-scene'
import { ModelSelector } from '@/components/sandbox/model-selector'
import { SessionManager } from '@/components/sandbox/session-manager'
import { FadeIn } from '@/components/animations/fade-in'
import { SandboxSession, PlacedModel as PlacedModelType } from '@/types/database.types'

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
  initialSessions: SandboxSession[]
}

export function SandboxClient({ models, initialSessions }: SandboxClientProps) {
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())
  const [placedModels, setPlacedModels] = useState<PlacedModel[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate')
  const [uniformScale, setUniformScale] = useState(true)
  const instanceCounterRef = useRef(0)
  const sandboxSceneRef = useRef<SandboxSceneHandle>(null)

  const handleScreenshot = useCallback(() => {
    sandboxSceneRef.current?.takeScreenshot()
  }, [])
  
  // Session management state
  const [sessions, setSessions] = useState<SandboxSession[]>(initialSessions)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [lastSavedState, setLastSavedState] = useState<string>('')
  
  // Track if there are unsaved changes
  const currentState = JSON.stringify(placedModels)
  const hasUnsavedChanges = currentState !== lastSavedState && placedModels.length > 0

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
    setCurrentSessionId(null)
    setLastSavedState('')
  }

  // Session management functions
  const refreshSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sandbox-sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to refresh sessions:', error)
    }
  }, [])

  const handleSaveAsSession = useCallback(async (name: string, description: string) => {
    // Convert placedModels to session format
    const sessionModels: PlacedModelType[] = placedModels.map(pm => ({
      id: pm.id,
      modelId: pm.modelId,
      glbUrl: pm.url,
      name: models.find(m => m.id === pm.modelId)?.image?.prompt || 'Untitled Model',
      position: pm.position,
      rotation: pm.rotation,
      scale: pm.scale
    }))

    const response = await fetch('/api/sandbox-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, models: sessionModels })
    })

    if (!response.ok) {
      throw new Error('Failed to create session')
    }

    const data = await response.json()
    setCurrentSessionId(data.session.id)
    setLastSavedState(JSON.stringify(placedModels))
    await refreshSessions()
  }, [placedModels, models, refreshSessions])

  const handleSaveSession = useCallback(async (name: string, description: string) => {
    if (!currentSessionId) {
      // Create new session
      return handleSaveAsSession(name, description)
    }

    // Convert placedModels to session format
    const sessionModels: PlacedModelType[] = placedModels.map(pm => ({
      id: pm.id,
      modelId: pm.modelId,
      glbUrl: pm.url,
      name: models.find(m => m.id === pm.modelId)?.image?.prompt || 'Untitled Model',
      position: pm.position,
      rotation: pm.rotation,
      scale: pm.scale
    }))

    const response = await fetch(`/api/sandbox-sessions/${currentSessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, models: sessionModels })
    })

    if (!response.ok) {
      throw new Error('Failed to save session')
    }

    setLastSavedState(JSON.stringify(placedModels))
    await refreshSessions()
  }, [currentSessionId, placedModels, models, refreshSessions, handleSaveAsSession])

  const handleLoadSession = useCallback((session: SandboxSession) => {
    // Convert session models to placedModels format
    const loadedModels: PlacedModel[] = (session.models || []).map((sm) => ({
      id: `loaded-${instanceCounterRef.current++}`,
      modelId: sm.modelId,
      url: sm.glbUrl,
      position: sm.position,
      rotation: sm.rotation,
      scale: sm.scale
    }))

    // Update selected models set
    const modelIds = new Set(loadedModels.map(pm => pm.modelId))
    setSelectedModels(modelIds)
    setPlacedModels(loadedModels)
    setCurrentSessionId(session.id)
    setLastSavedState(JSON.stringify(loadedModels))
    setSelectedModelId(null)
  }, [])

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    const response = await fetch(`/api/sandbox-sessions/${sessionId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete session')
    }

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
      setLastSavedState('')
    }
  }, [currentSessionId])

  const handleNewSession = useCallback(() => {
    setSelectedModels(new Set())
    setPlacedModels([])
    setCurrentSessionId(null)
    setLastSavedState('')
    setSelectedModelId(null)
  }, [])

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

  const handleModelDrag = useCallback((
    instanceId: string,
    position: [number, number, number]
  ) => {
    setPlacedModels((prev) =>
      prev.map((pm) =>
        pm.id === instanceId ? { ...pm, position } : pm
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

  const handlePositionChange = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedModelId) return
    
    setPlacedModels((prev) =>
      prev.map((pm) => {
        if (pm.id !== selectedModelId) return pm
        const newPosition = [...pm.position] as [number, number, number]
        const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
        newPosition[axisIndex] = value
        return { ...pm, position: newPosition }
      })
    )
  }, [selectedModelId])

  const handleRotationChange = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedModelId) return
    
    setPlacedModels((prev) =>
      prev.map((pm) => {
        if (pm.id !== selectedModelId) return pm
        const newRotation = [...pm.rotation] as [number, number, number]
        const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
        newRotation[axisIndex] = value * (Math.PI / 180) // Convert degrees to radians
        return { ...pm, rotation: newRotation }
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

        {/* Session Manager */}
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader className="py-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Session</CardTitle>
                  <CardDescription className="text-sm">
                    Save and load your sandbox arrangements
                  </CardDescription>
                </div>
                <SessionManager
                  sessions={sessions}
                  currentSessionId={currentSessionId}
                  hasUnsavedChanges={hasUnsavedChanges}
                  placedModelsCount={placedModels.length}
                  onSave={handleSaveSession}
                  onSaveAs={handleSaveAsSession}
                  onLoad={handleLoadSession}
                  onDelete={handleDeleteSession}
                  onNew={handleNewSession}
                  onRefresh={refreshSessions}
                />
              </div>
            </CardHeader>
          </Card>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.15}>
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
                {/* 3D Viewer with Overlay Controls */}
                <div className="relative">
                  <SandboxScene
                    ref={sandboxSceneRef}
                    placedModels={placedModels}
                    selectedModelId={selectedModelId}
                    transformMode={transformMode}
                    onModelSelect={handleModelSelect}
                    onModelTransform={handleModelTransform}
                    onModelDrag={handleModelDrag}
                  />
                  
                  {/* Transform Controls Overlay - Top Right */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    {/* Tool Buttons */}
                    <div className="flex flex-col gap-1 p-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                      <AnimatedButton
                        size="sm"
                        variant={transformMode === 'translate' ? 'default' : 'outline'}
                        onClick={() => setTransformMode('translate')}
                        className="w-full justify-start"
                      >
                        <Move className="h-4 w-4 mr-2" />
                        Move
                      </AnimatedButton>
                      <AnimatedButton
                        size="sm"
                        variant={transformMode === 'rotate' ? 'default' : 'outline'}
                        onClick={() => setTransformMode('rotate')}
                        className="w-full justify-start"
                      >
                        <RotateCw className="h-4 w-4 mr-2" />
                        Rotate
                      </AnimatedButton>
                      <AnimatedButton
                        size="sm"
                        variant={transformMode === 'scale' ? 'default' : 'outline'}
                        onClick={() => setTransformMode('scale')}
                        className="w-full justify-start"
                      >
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Scale
                      </AnimatedButton>
                      <div className="border-t my-1" />
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={handleScreenshot}
                        className="w-full justify-start"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Screenshot
                      </AnimatedButton>
                      {selectedModelId && (
                        <>
                          <div className="border-t my-1" />
                          <AnimatedButton
                            size="sm"
                            variant="destructive"
                            onClick={handleDeleteSelected}
                            className="w-full justify-start"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </AnimatedButton>
                        </>
                      )}
                    </div>

                    {/* Transform Values Panel - Only show when model selected */}
                    {selectedModelId && selectedModel && (
                      <div className="p-3 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 w-48">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">
                            {transformMode === 'translate' ? 'Position' : transformMode === 'rotate' ? 'Rotation' : 'Scale'}
                          </span>
                          {transformMode === 'scale' && (
                            <div className="flex items-center gap-1">
                              <Checkbox
                                id="uniform-scale"
                                checked={uniformScale}
                                onCheckedChange={(checked) => setUniformScale(checked as boolean)}
                                className="h-3 w-3"
                              />
                              <Label htmlFor="uniform-scale" className="text-[10px]">
                                Uniform
                              </Label>
                            </div>
                          )}
                        </div>
                        
                        {transformMode === 'translate' && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-red-500 w-3">X</Label>
                              <Slider
                                value={[selectedModel.position[0]]}
                                min={-10}
                                max={10}
                                step={0.1}
                                onValueChange={([v]) => handlePositionChange('x', v)}
                                className="flex-1 [&_[role=slider]]:bg-red-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {selectedModel.position[0].toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-green-500 w-3">Y</Label>
                              <Slider
                                value={[selectedModel.position[1]]}
                                min={0}
                                max={5}
                                step={0.1}
                                onValueChange={([v]) => handlePositionChange('y', v)}
                                className="flex-1 [&_[role=slider]]:bg-green-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {selectedModel.position[1].toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-blue-500 w-3">Z</Label>
                              <Slider
                                value={[selectedModel.position[2]]}
                                min={-10}
                                max={10}
                                step={0.1}
                                onValueChange={([v]) => handlePositionChange('z', v)}
                                className="flex-1 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {selectedModel.position[2].toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}

                        {transformMode === 'rotate' && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-red-500 w-3">X</Label>
                              <Slider
                                value={[selectedModel.rotation[0] * (180 / Math.PI)]}
                                min={-180}
                                max={180}
                                step={1}
                                onValueChange={([v]) => handleRotationChange('x', v)}
                                className="flex-1 [&_[role=slider]]:bg-red-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {(selectedModel.rotation[0] * (180 / Math.PI)).toFixed(0)}°
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-green-500 w-3">Y</Label>
                              <Slider
                                value={[selectedModel.rotation[1] * (180 / Math.PI)]}
                                min={-180}
                                max={180}
                                step={1}
                                onValueChange={([v]) => handleRotationChange('y', v)}
                                className="flex-1 [&_[role=slider]]:bg-green-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {(selectedModel.rotation[1] * (180 / Math.PI)).toFixed(0)}°
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-blue-500 w-3">Z</Label>
                              <Slider
                                value={[selectedModel.rotation[2] * (180 / Math.PI)]}
                                min={-180}
                                max={180}
                                step={1}
                                onValueChange={([v]) => handleRotationChange('z', v)}
                                className="flex-1 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {(selectedModel.rotation[2] * (180 / Math.PI)).toFixed(0)}°
                              </span>
                            </div>
                          </div>
                        )}

                        {transformMode === 'scale' && uniformScale && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px]">Size</Label>
                              <Input
                                type="number"
                                value={selectedModel.scale[0]}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  if (!isNaN(val) && val > 0) {
                                    handleScaleChange('uniform', val)
                                  }
                                }}
                                step={0.01}
                                min={0.01}
                                className="w-16 h-5 text-[10px] px-1 text-right"
                              />
                            </div>
                            <Slider
                              value={[selectedModel.scale[0]]}
                              min={0.1}
                              max={5}
                              step={0.1}
                              onValueChange={([v]) => handleScaleChange('uniform', v)}
                              className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                            />
                          </div>
                        )}

                        {transformMode === 'scale' && !uniformScale && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-red-500 w-3">X</Label>
                              <Slider
                                value={[selectedModel.scale[0]]}
                                min={0.1}
                                max={5}
                                step={0.1}
                                onValueChange={([v]) => handleScaleChange('x', v)}
                                className="flex-1 [&_[role=slider]]:bg-red-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <Input
                                type="number"
                                value={selectedModel.scale[0]}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  if (!isNaN(val) && val > 0) {
                                    handleScaleChange('x', val)
                                  }
                                }}
                                step={0.01}
                                min={0.01}
                                className="w-12 h-5 text-[10px] px-1 text-right"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-green-500 w-3">Y</Label>
                              <Slider
                                value={[selectedModel.scale[1]]}
                                min={0.1}
                                max={5}
                                step={0.1}
                                onValueChange={([v]) => handleScaleChange('y', v)}
                                className="flex-1 [&_[role=slider]]:bg-green-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <Input
                                type="number"
                                value={selectedModel.scale[1]}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  if (!isNaN(val) && val > 0) {
                                    handleScaleChange('y', val)
                                  }
                                }}
                                step={0.01}
                                min={0.01}
                                className="w-12 h-5 text-[10px] px-1 text-right"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-blue-500 w-3">Z</Label>
                              <Slider
                                value={[selectedModel.scale[2]]}
                                min={0.1}
                                max={5}
                                step={0.1}
                                onValueChange={([v]) => handleScaleChange('z', v)}
                                className="flex-1 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                              />
                              <Input
                                type="number"
                                value={selectedModel.scale[2]}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  if (!isNaN(val) && val > 0) {
                                    handleScaleChange('z', val)
                                  }
                                }}
                                step={0.01}
                                min={0.01}
                                className="w-12 h-5 text-[10px] px-1 text-right"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>🖱️ <strong>Left Click + Drag:</strong> Rotate camera (when no model selected)</p>
                  <p>🖱️ <strong>Right Click + Drag:</strong> Pan camera</p>
                  <p>🖱️ <strong>Scroll:</strong> Zoom in/out</p>
                  <p>👆 <strong>Click Model:</strong> Select model</p>
                  <p>✋ <strong>Drag Model (Move mode):</strong> Move model on XZ plane</p>
                  <p>🔧 <strong>Drag Gizmo (Rotate/Scale):</strong> Transform selected model</p>
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

