'use client'

import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
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
  transformMode: 'translate' | 'rotate' | 'scale'
}

function Model({ url, position, rotation, scale, isSelected, onSelect, onTransformEnd, transformMode }: ModelProps) {
  const { scene } = useGLTF(url, true)
  const groupRef = useRef<THREE.Group>(null!)
  const transformRef = useRef<any>(null)
  const [localTransformMode, setLocalTransformMode] = useState(transformMode)
  const [yOffset, setYOffset] = useState(0)
  
  // Clone the scene and calculate bounding box to place model on ground
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    
    // Calculate bounding box to find the bottom of the model
    const box = new THREE.Box3().setFromObject(clone)
    const minY = box.min.y
    
    // Offset to place model's bottom at y=0
    setYOffset(-minY)
    
    return clone
  }, [scene])

  // Update transform mode when prop changes
  useEffect(() => {
    setLocalTransformMode(transformMode)
  }, [transformMode])

  // Handle transform end
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
      </group>
      {isSelected && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
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
}

function SceneContent({ 
  placedModels, 
  selectedModelId, 
  transformMode,
  onModelSelect, 
  onModelTransform 
}: SandboxSceneProps) {
  const { gl } = useThree()

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
        />
      ))}

      {/* Camera Controls - disabled when transforming */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
        enabled={!selectedModelId}
      />
    </>
  )
}

export function SandboxScene(props: SandboxSceneProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border bg-gradient-to-b from-sky-100 to-sky-200 dark:from-slate-300 dark:to-slate-400">
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

