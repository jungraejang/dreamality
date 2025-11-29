'use client'

import { Suspense, useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid, useGLTF, TransformControls } from '@react-three/drei'
import { XR, createXRStore, useXRInputSourceState, useXR, XROrigin } from '@react-three/xr'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Create XR store for VR session management
const xrStore = createXRStore()

export interface SandboxSceneHandle {
  takeScreenshot: () => void
  enterVR: () => void
}

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
          object={targetObject as unknown as THREE.Object3D}
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

// VR Locomotion - allows user to move using controller thumbstick
function VRLocomotion({ originRef }: { originRef: React.RefObject<THREE.Group> }) {
  const leftController = useXRInputSourceState('controller', 'left')
  const rightController = useXRInputSourceState('controller', 'right')
  const { camera } = useThree()
  
  useFrame((_, delta) => {
    if (!originRef.current) return
    
    let moveX = 0
    let moveZ = 0
    let rotateY = 0
    
    // Left thumbstick for movement (xr-standard-thumbstick)
    if (leftController?.gamepad) {
      const thumbstick = leftController.gamepad['xr-standard-thumbstick']
      if (thumbstick) {
        moveX = thumbstick.xAxis || 0
        moveZ = thumbstick.yAxis || 0
      }
    }
    
    // Right thumbstick for rotation
    if (rightController?.gamepad) {
      const thumbstick = rightController.gamepad['xr-standard-thumbstick']
      if (thumbstick) {
        rotateY = thumbstick.xAxis || 0
      }
    }
    
    // Apply deadzone
    const deadzone = 0.15
    if (Math.abs(moveX) < deadzone) moveX = 0
    if (Math.abs(moveZ) < deadzone) moveZ = 0
    if (Math.abs(rotateY) < deadzone) rotateY = 0
    
    // Movement speed
    const moveSpeed = 5 * delta
    const rotateSpeed = 1.5 * delta
    
    // Get camera direction for movement
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0
    cameraDirection.normalize()
    
    // Get right direction
    const rightDirection = new THREE.Vector3()
    rightDirection.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection).normalize()
    
    // Apply movement
    if (moveX !== 0 || moveZ !== 0) {
      originRef.current.position.add(
        rightDirection.clone().multiplyScalar(-moveX * moveSpeed)
      )
      originRef.current.position.add(
        cameraDirection.clone().multiplyScalar(-moveZ * moveSpeed)
      )
    }
    
    // Apply rotation
    if (rotateY !== 0) {
      originRef.current.rotation.y -= rotateY * rotateSpeed
    }
  })
  
  return null
}

// VR Exit Button - floating button user can click to exit VR
function VRExitButton() {
  const { session } = useXR()
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()
  const buttonRef = useRef<THREE.Group>(null)
  
  // Position button in front of user
  useFrame(() => {
    if (!buttonRef.current || !session) return
    
    // Get camera position and direction
    const cameraPos = camera.position.clone()
    const cameraDir = new THREE.Vector3()
    camera.getWorldDirection(cameraDir)
    
    // Position button 2 meters in front and slightly down
    const buttonPos = cameraPos.clone().add(cameraDir.multiplyScalar(2))
    buttonPos.y = cameraPos.y - 0.3
    
    buttonRef.current.position.copy(buttonPos)
    buttonRef.current.lookAt(cameraPos)
  })
  
  const handleExitVR = () => {
    if (session) {
      session.end()
    }
  }
  
  if (!session) return null
  
  return (
    <group ref={buttonRef}>
      {/* Exit button background */}
      <mesh
        onClick={handleExitVR}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[0.4, 0.15]} />
        <meshBasicMaterial 
          color={hovered ? '#ef4444' : '#dc2626'} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
      {/* Exit text */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.05}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        EXIT VR
      </Text>
      {/* Border */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[0.42, 0.17]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  )
}

// Component to capture screenshot from inside the Canvas
function ScreenshotCapture({ onCapture }: { onCapture: (fn: () => void) => void }) {
  const { gl, scene, camera } = useThree()
  
  useEffect(() => {
    const captureScreenshot = () => {
      // Render the scene
      gl.render(scene, camera)
      
      // Get the canvas data as a data URL
      const dataUrl = gl.domElement.toDataURL('image/png')
      
      // Create a download link
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `sandbox-screenshot-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    onCapture(captureScreenshot)
  }, [gl, scene, camera, onCapture])
  
  return null
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

// VR Content wrapper with locomotion
function VRContent({ props, originRef }: { props: SandboxSceneProps, originRef: React.RefObject<THREE.Group> }) {
  const { session } = useXR()
  
  if (!session) return null
  
  return (
    <>
      <VRLocomotion originRef={originRef} />
      <VRExitButton />
    </>
  )
}

export const SandboxScene = forwardRef<SandboxSceneHandle, SandboxSceneProps>(
  function SandboxScene(props, ref) {
    const screenshotFnRef = useRef<(() => void) | null>(null)
    const xrOriginRef = useRef<THREE.Group>(null!)
    
    useImperativeHandle(ref, () => ({
      takeScreenshot: () => {
        if (screenshotFnRef.current) {
          screenshotFnRef.current()
        }
      },
      enterVR: () => {
        xrStore.enterVR()
      }
    }))
    
    const handleCaptureReady = useCallback((fn: () => void) => {
      screenshotFnRef.current = fn
    }, [])
    
    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden border bg-linear-to-b from-sky-100 to-sky-200 dark:from-slate-300 dark:to-slate-400">
        <Canvas
          camera={{ position: [10, 10, 10], fov: 50 }}
          shadows
          gl={{ preserveDrawingBuffer: true }}
        >
          <XR store={xrStore}>
            <Suspense fallback={null}>
              {/* XR Origin for VR positioning and locomotion */}
              <XROrigin ref={xrOriginRef} position={[0, 0, 5]} />
              
              <SceneContent {...props} />
              <ScreenshotCapture onCapture={handleCaptureReady} />
              
              {/* VR-specific components */}
              <VRContent props={props} originRef={xrOriginRef} />
            </Suspense>
          </XR>
        </Canvas>
      </div>
    )
  }
)

// Export VR store for external use
export { xrStore }

