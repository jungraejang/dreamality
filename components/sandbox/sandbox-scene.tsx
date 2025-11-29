'use client'

import { Suspense, useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useThree, ThreeEvent, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, useGLTF, TransformControls, Text } from '@react-three/drei'
import { XR, createXRStore, useXR, XROrigin } from '@react-three/xr'
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

// Component to capture screenshot from inside the Canvas
function ScreenshotCapture({ onCapture }: { onCapture: (fn: () => void) => void }) {
  const { gl, scene, camera } = useThree()
  
  useEffect(() => {
    const captureScreenshot = () => {
      gl.render(scene, camera)
      const dataUrl = gl.domElement.toDataURL('image/png')
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

function ExitButton() {
  const { session } = useXR()
  const { camera } = useThree()
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame(() => {
    if (!ref.current) return
    const p = camera.position
    const q = camera.quaternion
    // Place 1.5m in front, 0.3m down relative to camera look direction
    const forward = new THREE.Vector3(0, 0, -1.5).applyQuaternion(q)
    ref.current.position.copy(p).add(forward).add(new THREE.Vector3(0, -0.3, 0))
    ref.current.lookAt(p)
  })

  if (!session) return null

  return (
    <group ref={ref}>
      <mesh 
        onClick={() => session.end()}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[0.4, 0.15]} />
        <meshBasicMaterial color={hovered ? "#dc2626" : "#991b1b"} opacity={0.8} transparent />
        <Text position={[0, 0, 0.01]} fontSize={0.05} color="white" anchorX="center" anchorY="middle">
          EXIT VR
        </Text>
      </mesh>
    </group>
  )
}

function VRManager() {
  const { session } = useXR()
  const originRef = useRef<THREE.Group>(null)
  const markerRef = useRef<THREE.Group>(null)
  const rayRef = useRef<THREE.Line>(null)
  const { gl, camera } = useThree()
  
  // Use a Three.js Line object wrapped in primitive to avoid SVG conflict
  const rayLine = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1)])
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
    const line = new THREE.Line(geometry, material)
    line.visible = false
    line.frustumCulled = false
    return line
  }, [])
  
  // State for snap turn (to prevent continuous spinning)
  const snapState = useRef<{ [key: string]: boolean }>({})
  // Track teleport state
  const teleportState = useRef<{ active: boolean, valid: boolean, position: THREE.Vector3 }>({ 
    active: false, 
    valid: false, 
    position: new THREE.Vector3() 
  })
  
  useFrame((state, delta, frame) => {
    if (!session || !originRef.current) return
    
    const snapAngle = Math.PI / 4 // 45 degrees
    
    // Reset visibility
    if (markerRef.current) markerRef.current.visible = false
    if (rayRef.current) rayRef.current.visible = false
    
    let isAnyTriggerPressed = false
    
    for (const source of session.inputSources) {
      if (!source.gamepad) continue
      
      const axes = source.gamepad.axes
      const buttons = source.gamepad.buttons
      const hand = source.handedness
      
      // --- 1. Snap Turn (Joystick Left/Right) ---
      let stickX = 0
      // Check axes 2 (Standard) or 0 (Fallback)
      if (axes.length >= 4 && Math.abs(axes[2]) > 0.1) stickX = axes[2]
      else if (axes.length >= 2 && Math.abs(axes[0]) > 0.1) stickX = axes[0]
      
      const threshold = 0.5
      const isStickActive = Math.abs(stickX) > threshold
      const wasStickActive = snapState.current[hand] || false
      
      if (isStickActive && !wasStickActive) {
        // Turn 45 degrees
        const direction = stickX > 0 ? -1 : 1 // Right = -45deg (Clockwise)
        originRef.current.rotation.y += direction * snapAngle
      }
      snapState.current[hand] = isStickActive
      
      // --- 2. Teleportation (Trigger) ---
      const trigger = buttons[0]
      if (trigger && trigger.pressed) {
        isAnyTriggerPressed = true
        
        // Get controller pose to cast ray
        const referenceSpace = gl.xr.getReferenceSpace()
        
        if (frame && referenceSpace && source.targetRaySpace) {
          const pose = frame.getPose(source.targetRaySpace, referenceSpace)
          if (pose && originRef.current) {
            originRef.current.updateMatrixWorld() // Ensure matrix is up to date
            
            const position = new THREE.Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z)
            position.applyMatrix4(originRef.current.matrixWorld) // Convert to World Space
            
            const orientation = new THREE.Quaternion(pose.transform.orientation.x, pose.transform.orientation.y, pose.transform.orientation.z, pose.transform.orientation.w)
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(orientation)
            direction.transformDirection(originRef.current.matrixWorld) // Convert to World Direction
            
            // Raycast to ground (y=0)
            // Ray: P + t*D. Find t where y=0 => t = -Py / Dy
            let t = 0
            const target = new THREE.Vector3()
            let isValid = false
            
            if (direction.y < 0) { // Pointing down
               t = -position.y / direction.y
               if (t > 0 && t < 50) { // Max distance 50m
                 target.copy(position).add(direction.clone().multiplyScalar(t))
                 isValid = true
               }
            }
            
            if (!isValid) {
               // Extend ray forward 10m if invalid
               target.copy(position).add(direction.clone().multiplyScalar(10))
            }
            
            // Update Visual Ray
            if (rayRef.current) {
              rayRef.current.visible = true
              const positions = new Float32Array([
                position.x, position.y, position.z,
                target.x, target.y, target.z
              ])
              rayRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
              // Color: Green if valid, Red if invalid
              ;(rayRef.current.material as THREE.LineBasicMaterial).color.set(isValid ? 0x00ff00 : 0xff0000)
            }
            
            // Update Marker
            if (isValid && markerRef.current) {
              markerRef.current.visible = true
              markerRef.current.position.copy(target)
              
              teleportState.current.active = true
              teleportState.current.valid = true
              teleportState.current.position.copy(target)
            } else {
              teleportState.current.valid = false
            }
          }
        }
      }
    }
    
    // --- Execute Teleport on Release ---
    if (!isAnyTriggerPressed && teleportState.current.active) {
      if (teleportState.current.valid && originRef.current) {
        // Move origin to target position
        // We only change X and Z, keeping Y (height) as is (usually 0 for origin)
        originRef.current.position.set(
          teleportState.current.position.x,
          originRef.current.position.y, // Keep current height offset if any
          teleportState.current.position.z
        )
      }
      teleportState.current.active = false
      teleportState.current.valid = false
    }
  })

  if (!session) return null

  return (
    <>
      <XROrigin ref={originRef} position={[0, 0, 5]} />
      <ExitButton />
      
      {/* Visual Ray - using primitive to avoid SVG conflict */}
      <primitive object={rayLine} ref={rayRef} />
      
      {/* Teleport Marker */}
      <group ref={markerRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 10, 8]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
        </mesh>
      </group>
    </>
  )
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
  const { session } = useXR()

  return (
    <>
      <VRManager />

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

      {/* Camera Controls - disabled when transforming or dragging, OR in VR */}
      {!session && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
          enabled={!selectedModelId || (!isDragging && transformMode !== 'translate')}
        />
      )}
    </>
  )
}

export const SandboxScene = forwardRef<SandboxSceneHandle, SandboxSceneProps>(
  function SandboxScene(props, ref) {
    const screenshotFnRef = useRef<(() => void) | null>(null)
    
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
              <SceneContent {...props} />
              <ScreenshotCapture onCapture={handleCaptureReady} />
            </Suspense>
          </XR>
        </Canvas>
      </div>
    )
  }
)

// Export VR store for external use
export { xrStore }

