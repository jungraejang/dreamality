'use client'

import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid, useGLTF, TransformControls } from '@react-three/drei'
import * as THREE from 'three'

interface PlacedModel {
  id: string
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

interface ModelProps {
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  isSelected: boolean
  onSelect: () => void
  onTransformEnd: (position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void
  onDrag: (position: [number, number, number]) => void
  transformMode: 'translate' | 'rotate' | 'scale'
  setIsDragging: (dragging: boolean) => void
}

function Model({ url, position, rotation, scale, isSelected, onSelect, onTransformEnd, onDrag, transformMode, setIsDragging }: ModelProps) {
  const { scene } = useGLTF(url, true)
  const groupRef = useRef<THREE.Group>(null!)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<any>(null)
  const [localTransformMode, setLocalTransformMode] = useState(transformMode)
  const [targetObject, setTargetObject] = useState<THREE.Group | null>(null)
  const [isDraggingLocal, setIsDraggingLocal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { camera, raycaster, gl } = useThree()
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  
  // Handle cursor style changes via useEffect to avoid modifying gl directly
  useEffect(() => {
    if (isDraggingLocal) {
      document.body.style.cursor = 'grabbing'
    } else if (isHovered && isSelected && transformMode === 'translate') {
      document.body.style.cursor = 'grab'
    } else {
      document.body.style.cursor = 'auto'
    }
    
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [isDraggingLocal, isHovered, isSelected, transformMode])
  
  // Clone the scene and calculate bounding box to place model on ground
  const { clonedScene, yOffset } = useMemo(() => {
    const clone = scene.clone(true)
    
    // Calculate bounding box to find the bottom of the model
    const box = new THREE.Box3().setFromObject(clone)
    const minY = box.min.y
    
    // Offset to place model's bottom at y=0
    return { clonedScene: clone, yOffset: -minY }
  }, [scene])

  // Update transform mode when prop changes
  useEffect(() => {
    setLocalTransformMode(transformMode)
  }, [transformMode])

  // Set target object after mount and when selection changes
  useEffect(() => {
    if (groupRef.current) {
      setTargetObject(groupRef.current)
    }
  }, [isSelected])

  // Handle transform end for TransformControls (rotate/scale)
  useEffect(() => {
    const controls = transformRef.current
    if (!controls) return

    const handleChange = () => {
      if (groupRef.current) {
        const pos = groupRef.current.position
        const rot = groupRef.current.rotation
        const scl = groupRef.current.scale
        onTransformEnd(
          [pos.x, pos.y, pos.z],
          [rot.x, rot.y, rot.z],
          [scl.x, scl.y, scl.z]
        )
      }
    }

    controls.addEventListener('dragging-changed', (event: { value: boolean }) => {
      if (!event.value) {
        handleChange()
      }
    })

    return () => {
      controls.dispose()
    }
  }, [onTransformEnd, isSelected])

  // Handle pointer drag for translate mode
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isSelected || transformMode !== 'translate') return
    e.stopPropagation()
    setIsDraggingLocal(true)
    setIsDragging(true)
  }, [isSelected, transformMode, setIsDragging])

  const handlePointerUp = useCallback(() => {
    if (isDraggingLocal) {
      setIsDraggingLocal(false)
      setIsDragging(false)
      // Report final position
      if (groupRef.current) {
        const pos = groupRef.current.position
        onTransformEnd(
          [pos.x, pos.y, pos.z],
          rotation,
          scale
        )
      }
    }
  }, [isDraggingLocal, setIsDragging, onTransformEnd, rotation, scale])

  // Global pointer move for dragging
  useEffect(() => {
    if (!isDraggingLocal || !isSelected || transformMode !== 'translate') return

    const handlePointerMove = (e: PointerEvent) => {
      // Convert mouse position to normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )

      // Cast ray and find intersection with ground plane
      raycaster.setFromCamera(mouse, camera)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(groundPlane, intersection)

      if (intersection) {
        // Update position - only X and Z, keep Y at 0
        const newPosition: [number, number, number] = [intersection.x, 0, intersection.z]
        onDrag(newPosition)
        
        // Update local group position for immediate visual feedback
        if (groupRef.current) {
          groupRef.current.position.set(intersection.x, 0, intersection.z)
        }
      }
    }

    const handlePointerUpGlobal = () => {
      handlePointerUp()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUpGlobal)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUpGlobal)
    }
  }, [isDraggingLocal, isSelected, transformMode, camera, raycaster, gl, groundPlane, onDrag, handlePointerUp])

  return (
    <>
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        {/* Offset the model so its bottom sits on the ground */}
        <group position={[0, yOffset, 0]}>
          <primitive object={clonedScene} scale={1} />
        </group>
        {/* Selection indicator at ground level */}
        {isSelected && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color="#f95738" transparent opacity={0.5} />
          </mesh>
        )}
        {/* Drag indicator for translate mode */}
        {isSelected && transformMode === 'translate' && (
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 32]} />
            <meshBasicMaterial color="#083d77" transparent opacity={0.7} />
          </mesh>
        )}
      </group>
      {/* Only show TransformControls for rotate and scale modes */}
      {isSelected && targetObject && transformMode !== 'translate' && (
        <TransformControls
          ref={transformRef}
          object={targetObject}
          mode={localTransformMode}
          size={0.75}
          showX={true}
          showY={true}
          showZ={true}
        />
      )}
    </>
  )
}

interface SandboxSceneProps {
  placedModels: PlacedModel[]
  selectedModelId: string | null
  transformMode: 'translate' | 'rotate' | 'scale'
  onModelSelect: (id: string | null) => void
  onModelTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void
  onModelDrag: (id: string, position: [number, number, number]) => void
}

function SceneContent({ 
  placedModels, 
  selectedModelId, 
  transformMode,
  onModelSelect, 
  onModelTransform,
  onModelDrag
}: SandboxSceneProps) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <>
      {/* Sky background */}
      <color attach="background" args={['#e0f2fe']} />
      
      {/* Lighting - brighter for better visibility */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.6} />
      <hemisphereLight args={['#87ceeb', '#f0f0f0', 0.5]} />

      {/* Ground Grid - darker contrasting colors */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#475569"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#1e293b"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
        position={[0, 0.01, 0]}
      />
      
      {/* Ground plane - transparent with subtle color */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#a5d8ff" 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* Ground Plane - click to deselect */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onClick={() => onModelSelect(null)}
      >
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {/* Placed Models */}
      {placedModels.map((model) => (
        <Model
          key={model.id}
          url={model.url}
          position={model.position}
          rotation={model.rotation}
          scale={model.scale}
          isSelected={selectedModelId === model.id}
          transformMode={transformMode}
          onSelect={() => onModelSelect(model.id)}
          onTransformEnd={(pos, rot, scl) => onModelTransform(model.id, pos, rot, scl)}
          onDrag={(pos) => onModelDrag(model.id, pos)}
          setIsDragging={setIsDragging}
        />
      ))}

      {/* Camera Controls - disabled when transforming or dragging */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
        enabled={!selectedModelId || (!isDragging && transformMode !== 'translate')}
      />
    </>
  )
}

export function SandboxScene(props: SandboxSceneProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border bg-linear-to-b from-sky-100 to-sky-200 dark:from-slate-300 dark:to-slate-400">
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  )
}

