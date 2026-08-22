import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getReducedMotion, isMobile } from '@/utils/device'

function Particles({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = (Math.random() - 0.5) * 24
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4
    }
    return arr
  }, [count])

  const reduced = getReducedMotion()

  useFrame((state, delta) => {
    const pts = points.current
    if (!pts || reduced) return
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.2 + i) * delta * 0.05
      arr[i * 3] += Math.cos(t * 0.15 + i) * delta * 0.04
    }
    pos.needsUpdate = true
    pts.rotation.y += delta * 0.008
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#00d46a" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function ConnectionLines({ count }: { count: number }) {
  const lines = useRef<THREE.LineSegments>(null)
  const data = useMemo(() => {
    const pos = new Float32Array(count * 6)
    for (let i = 0; i < count; i++) {
      const x1 = (Math.random() - 0.5) * 30
      const y1 = (Math.random() - 0.5) * 18
      const z1 = (Math.random() - 0.5) * 14 - 4
      const x2 = x1 + (Math.random() - 0.5) * 4
      const y2 = y1 + (Math.random() - 0.5) * 4
      const z2 = z1 + (Math.random() - 0.5) * 4
      pos[i * 6] = x1
      pos[i * 6 + 1] = y1
      pos[i * 6 + 2] = z1
      pos[i * 6 + 3] = x2
      pos[i * 6 + 4] = y2
      pos[i * 6 + 5] = z2
    }
    return pos
  }, [count])

  const reduced = getReducedMotion()
  useFrame((state) => {
    const l = lines.current
    if (!l || reduced) return
    l.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
  })

  return (
    <lineSegments ref={lines}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#00a854" transparent opacity={0.06} />
    </lineSegments>
  )
}

function AmbientLights() {
  const { pointer } = useThree()
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = group.current
    if (!g) return
    g.position.x += (pointer.x * 1.5 - g.position.x) * 0.04
    g.position.y += (pointer.y * 0.8 - g.position.y) * 0.04
  })

  return (
    <group ref={group}>
      <pointLight position={[3, 4, 5]} intensity={30} color="#00d46a" distance={20} />
      <pointLight position={[-6, -3, 2]} intensity={16} color="#0aa06a" distance={18} />
      <ambientLight intensity={0.4} />
    </group>
  )
}

function ScrollReactive({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    const g = group.current
    if (!g) return
    const targetZ = 0 + (window.scrollY / window.innerHeight) * 4
    g.position.z += (targetZ - g.position.z) * 0.05
  })
  return <group ref={group}>{children}</group>
}

export function FreshEnergyField({ enabled = true }: { enabled?: boolean }) {
  const count = useMemo(() => (isMobile() ? 260 : 700), [])
  const lineCount = useMemo(() => (isMobile() ? 50 : 130), [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ opacity: enabled ? 1 : 0.25 }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0d1712_0%,#070b0a_55%,#050807_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(0,212,106,0.07),transparent_60%)]" />
      <Canvas
        dpr={isMobile() ? [1, 1.2] : [1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        camera={{ position: [0, 0, 10], fov: 55 }}
        style={{ position: 'absolute', inset: 0 }}
        frameloop="always"
      >
        <AmbientLights />
        <ScrollReactive>
          <Particles count={count} />
          <ConnectionLines count={lineCount} />
        </ScrollReactive>
      </Canvas>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-midnight to-transparent" />
    </div>
  )
}