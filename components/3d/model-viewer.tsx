'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, Environment } from '@react-three/drei'

interface ModelProps {
  url: string
}

function Model({ url }: ModelProps) {
  // Use the URL directly - useGLTF handles the loading
  const { scene } = useGLTF(url, true) // true enables CORS
  const modelRef = useRef<any>(null)

  // Auto-rotate disabled - user can manually rotate with mouse

  return (
    <Center>
      <primitive ref={modelRef} object={scene} scale={1} />
    </Center>
  )
}

interface ModelViewerProps {
  modelUrl: string
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  )
}

function ErrorFallback({ error, modelUrl }: { error: Error; modelUrl: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-white text-center p-4">
        <p className="mb-4">Unable to load 3D viewer</p>
        <p className="text-sm text-gray-400 mb-4">CORS or network issue</p>
        <a
          href={modelUrl}
          download
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Download Model Instead
        </a>
      </div>
    </div>
  )
}

export function ModelViewer({ modelUrl }: ModelViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  if (error) {
    const errorObj = new Error(error)
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
        <ErrorFallback error={errorObj} modelUrl={modelUrl} />
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/80">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading 3D model...</p>
          </div>
        </div>
      )}
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        onCreated={() => setLoading(false)}
      >
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <Model url={modelUrl} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  )
}

