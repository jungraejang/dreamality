'use client'

import { useState } from 'react'
import { AnimatedButton } from '@/components/animated-button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Plus,
  Clock,
  Layers
} from 'lucide-react'
import { SandboxSession } from '@/types/database.types'
import { formatDistanceToNow } from 'date-fns'

interface PlacedModelForSession {
  id: string
  modelId: string
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

interface SessionManagerProps {
  sessions: SandboxSession[]
  currentSessionId: string | null
  hasUnsavedChanges: boolean
  placedModelsCount: number
  onSave: (name: string, description: string) => Promise<void>
  onSaveAs: (name: string, description: string) => Promise<void>
  onLoad: (session: SandboxSession) => void
  onDelete: (sessionId: string) => Promise<void>
  onNew: () => void
  onRefresh: () => Promise<void>
}

export function SessionManager({
  sessions,
  currentSessionId,
  hasUnsavedChanges,
  placedModelsCount,
  onSave,
  onSaveAs,
  onLoad,
  onDelete,
  onNew,
  onRefresh
}: SessionManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveMode, setSaveMode] = useState<'save' | 'saveAs'>('save')
  
  const [sessionName, setSessionName] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')

  const currentSession = sessions.find(s => s.id === currentSessionId)

  const handleOpenSaveDialog = (mode: 'save' | 'saveAs') => {
    setSaveMode(mode)
    if (mode === 'save' && currentSession) {
      setSessionName(currentSession.name)
      setSessionDescription(currentSession.description || '')
    } else {
      setSessionName('')
      setSessionDescription('')
    }
    setShowSaveDialog(true)
  }

  const handleSave = async () => {
    if (!sessionName.trim()) return
    
    setIsSaving(true)
    try {
      if (saveMode === 'save' && currentSessionId) {
        await onSave(sessionName, sessionDescription)
      } else {
        await onSaveAs(sessionName, sessionDescription)
      }
      setShowSaveDialog(false)
      setSessionName('')
      setSessionDescription('')
    } catch (error) {
      console.error('Failed to save session:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoad = async (session: SandboxSession) => {
    setIsLoading(true)
    try {
      onLoad(session)
      setShowLoadDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessionToDelete(sessionId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(sessionToDelete)
      setShowDeleteConfirm(false)
      setSessionToDelete(null)
      await onRefresh()
    } catch (error) {
      console.error('Failed to delete session:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenLoadDialog = async () => {
    await onRefresh()
    setShowLoadDialog(true)
  }

  return (
    <>
      {/* Session Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <AnimatedButton
          size="sm"
          variant="outline"
          onClick={onNew}
          title="New Session"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </AnimatedButton>
        
        <AnimatedButton
          size="sm"
          variant="outline"
          onClick={handleOpenLoadDialog}
          title="Load Session"
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          Load
        </AnimatedButton>
        
        <AnimatedButton
          size="sm"
          variant={hasUnsavedChanges ? 'default' : 'outline'}
          onClick={() => handleOpenSaveDialog(currentSessionId ? 'save' : 'saveAs')}
          disabled={placedModelsCount === 0}
          title={currentSessionId ? 'Save Session' : 'Save As New Session'}
        >
          <Save className="h-4 w-4 mr-1" />
          {currentSessionId ? 'Save' : 'Save As'}
        </AnimatedButton>
        
        {currentSessionId && (
          <AnimatedButton
            size="sm"
            variant="outline"
            onClick={() => handleOpenSaveDialog('saveAs')}
            disabled={placedModelsCount === 0}
            title="Save As New Session"
          >
            Save As...
          </AnimatedButton>
        )}

        {currentSession && (
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm">
            <span className="font-medium">{currentSession.name}</span>
            {hasUnsavedChanges && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">•</span>
            )}
          </div>
        )}
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {saveMode === 'save' && currentSessionId ? 'Save Session' : 'Save As New Session'}
            </DialogTitle>
            <DialogDescription>
              Save your current sandbox arrangement for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="session-name">Session Name</Label>
              <Input
                id="session-name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="My awesome scene"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="session-description">Description (optional)</Label>
              <Textarea
                id="session-description"
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                placeholder="A description of this scene..."
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This session contains {placedModelsCount} model{placedModelsCount !== 1 ? 's' : ''}.
            </div>
          </div>
          <DialogFooter>
            <AnimatedButton
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              onClick={handleSave}
              disabled={!sessionName.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Load Session</DialogTitle>
            <DialogDescription>
              Select a saved session to load.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved sessions yet.</p>
                <p className="text-sm">Save your first session to see it here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleLoad(session)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      session.id === currentSessionId ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{session.name}</h4>
                        {session.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {session.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {session.models?.length || 0} models
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <AnimatedButton
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(session.id, e)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <AnimatedButton
              variant="outline"
              onClick={() => setShowLoadDialog(false)}
            >
              Cancel
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <AnimatedButton
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

