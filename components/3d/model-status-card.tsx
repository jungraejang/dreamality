'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { ModelViewer } from './model-viewer'
import Image from 'next/image'

interface Model3D {
  id: string
  image_id: string
  status: string
  model_url: string | null
  thumbnail_url: string | null
  glb_url: string | null
  fbx_url: string | null
  usdz_url: string | null
  error_message: string | null
  created_at: string
  image?: {
    prompt: string
    image_url: string
  }
}

interface ModelStatusCardProps {
  model: Model3D
}

export function ModelStatusCard({ model: initialModel }: ModelStatusCardProps) {
  const [model, setModel] = useState(initialModel)
  const [checking, setChecking] = useState(false)
  const [showViewer, setShowViewer] = useState(false)

  useEffect(() => {
    // Auto-check status if pending or in progress
    if (model.status === 'PENDING' || model.status === 'IN_PROGRESS') {
      const interval = setInterval(() => {
        checkStatus()
      }, 10000) // Check every 10 seconds

      return () => clearInterval(interval)
    }
  }, [model.status])

  const checkStatus = async () => {
    if (checking) return
    setChecking(true)

    try {
      const response = await fetch('/api/check-3d-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId: model.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setModel((prev) => ({
          ...prev,
          status: data.status,
          model_url: data.model_url || prev.model_url,
          thumbnail_url: data.thumbnail_url || prev.thumbnail_url,
          glb_url: data.glb_url || prev.glb_url,
          fbx_url: data.fbx_url || prev.fbx_url,
          usdz_url: data.usdz_url || prev.usdz_url,
          error_message: data.error_message || prev.error_message,
        }))
      }
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setChecking(false)
    }
  }

  const getStatusBadge = () => {
    switch (model.status) {
      case 'SUCCEEDED':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      case 'IN_PROGRESS':
        return (
          <Badge variant="secondary">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">3D Model</CardTitle>
            {model.image?.prompt && (
              <CardDescription className="line-clamp-2">
                {model.image.prompt}
              </CardDescription>
            )}
          </div>
          {getStatusBadge()}
        </div>
        <p className="text-xs text-muted-foreground">
          Created {new Date(model.created_at).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Image */}
        {model.image?.image_url && (
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
            <Image
              src={model.image.image_url}
              alt="Source image"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* 3D Model Viewer */}
        {model.status === 'SUCCEEDED' && model.glb_url && showViewer && (
          <div className="space-y-2">
            <ModelViewer modelUrl={model.glb_url} />
            <p className="text-xs text-muted-foreground text-center">
              💡 If viewer doesn't load, use the download buttons below
            </p>
          </div>
        )}

        {/* Error Message */}
        {model.status === 'FAILED' && model.error_message && (
          <p className="text-sm text-destructive">{model.error_message}</p>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {model.status === 'SUCCEEDED' && model.glb_url && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => window.open(model.glb_url!, '_blank')}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download GLB
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowViewer(!showViewer)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showViewer ? 'Hide' : 'Preview'}
                </Button>
              </div>
              {(model.fbx_url || model.usdz_url) && (
                <div className="flex gap-2">
                  {model.fbx_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(model.fbx_url!, '_blank')}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      FBX
                    </Button>
                  )}
                  {model.usdz_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(model.usdz_url!, '_blank')}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      USDZ
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {(model.status === 'PENDING' || model.status === 'IN_PROGRESS') && (
            <Button
              size="sm"
              variant="outline"
              onClick={checkStatus}
              disabled={checking}
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Status'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

