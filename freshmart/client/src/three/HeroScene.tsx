import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'
import { getReducedMotion, isMobile } from '@/utils/device'
import { useNavigate } from 'react-router-dom'

function Apple({ position, color = '#e23b3b' }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Group>(null)
  const reduced = getReducedMotion()
  useFrame((state) => {
    if (reduced) return
    ref.current!.rotation.y = state.clock.elapsedTime * 0.4
  })
  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.9}>
      <group ref={ref} position={position}>
        <mesh castShadow>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.03, 0.05, 0.25, 6]} />
          <meshStandardMaterial color="#5b3a1e" />
        </mesh>
        <mesh position={[0.05, 0.38, 0]} rotation={[0, 0, 0.9]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#3fae5a" />
        </mesh>
      </group>
    </Float>
  )
}

function Orange({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.44, 24, 24]} />
          <meshStandardMaterial color="#ff8c1a" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.44, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#3fae5a" />
        </mesh>
      </group>
    </Float>
  )
}

function Carrot({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const reduced = getReducedMotion()
  useFrame((state) => {
    if (reduced) return
    ref.current!.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.15
  })
  return (
    <Float speed={1.3} floatIntensity={0.8}>
      <group ref={ref} position={position} rotation={[0, 0, -0.7]}>
        <mesh>
          <coneGeometry args={[0.16, 1.0, 12]} />
          <meshStandardMaterial color="#ff7f2a" roughness={0.4} />
        </mesh>
        <group position={[0, 0.55, 0]} rotation={[0, 0, 0.7]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[(i - 1) * 0.14, 0.18, 0]} rotation={[0.4, i, 0.5]}>
              <coneGeometry args={[0.06, 0.35, 6]} />
              <meshStandardMaterial color="#3fae5a" />
            </mesh>
          ))}
        </group>
      </group>
    </Float>
  )
}

function Bread({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.7}>
      <group position={position} rotation={[0.2, 0.4, 0.1]}>
        <mesh>
          <boxGeometry args={[0.8, 0.45, 0.35]} />
          <meshStandardMaterial color="#d9a05b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.12, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.74, 0.02, 0.02]} />
          <meshStandardMaterial color="#f5d9a8" />
        </mesh>
      </group>
    </Float>
  )
}

function MilkCarton({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const reduced = getReducedMotion()
  useFrame((state) => {
    if (reduced) return
    ref.current!.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
  })
  return (
    <Float speed={1.5} floatIntensity={0.9}>
      <group ref={ref} position={position} rotation={[0.15, -0.5, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.9, 0.36]} />
          <meshStandardMaterial color="#f3f6f4" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <coneGeometry args={[0.16, 0.22, 4]} />
          <meshStandardMaterial color="#c9d4ce" />
        </mesh>
        <mesh position={[0, 0.1, 0.185]}>
          <planeGeometry args={[0.4, 0.35]} />
          <meshStandardMaterial color="#00d46a" />
        </mesh>
      </group>
    </Float>
  )
}

function Basket() {
  const group = useRef<THREE.Group>(null)
  const reduced = getReducedMotion()

  useFrame((state) => {
    if (reduced) return
    const g = group.current!
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.15
    g.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06
  })

  return (
    <group ref={group} position={[0, -0.6, 0]}>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2
        const r = 1.1
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.1, Math.sin(a) * r]} rotation={[Math.PI / 2, 0, a]}>
            <torusGeometry args={[0.045, 0.012, 8, 16]} />
            <meshStandardMaterial color="#8a6b46" roughness={0.8} />
          </mesh>
        )
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 1.1, 0.28 + Math.random() * 0.1, Math.sin(a) * 1.1]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color="#7a5c3c" roughness={0.8} />
          </mesh>
        )
      })}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.12, 32]} />
        <meshStandardMaterial color="#5f4528" roughness={0.9} />
      </mesh>
    </group>
  )
}

function LeafParticles() {
  const count = isMobile() ? 12 : 24
  const leaves = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
        ] as [number, number, number],
        speed: 0.3 + Math.random() * 0.5,
      })),
    [count],
  )
  const reduced = getReducedMotion()

  useFrame((state) => {
    if (reduced) return
    leaves.forEach((l, i) => {
      const t = state.clock.elapsedTime * l.speed + i
      const el = (refs.current[i] as THREE.Group | undefined)
      if (!el) return
      el.position.y = l.position[1] + Math.sin(t) * 0.5
      el.position.x = l.position[0] + Math.cos(t * 0.7) * 0.4
      el.rotation.z = t
    })
  })

  const refs = useRef<Array<THREE.Group | null>>([])

  return (
    <group>
      {leaves.map((l, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)} position={l.position} scale={0.7}>
          <mesh>
            <coneGeometry args={[0.08, 0.3, 6]} />
            <meshStandardMaterial color={i % 2 ? '#3fae5a' : '#52f7ae'} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function CameraRig() {
  const { pointer, camera } = useThree()
  const reduced = getReducedMotion()
  useFrame(() => {
    if (reduced) return
    camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.05
    camera.position.y += (pointer.y * 0.8 - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })
  return null
}

interface HeroProduct {
  id: string
  name: string
  price: number
  image: string
}

export function HeroScene({ products }: { products: HeroProduct[] }) {
  const navigate = useNavigate()
  const reduced = getReducedMotion()
  const enabled = !reduced

  return (
    <div className="relative h-[340px] w-full sm:h-[420px] lg:h-[520px]" aria-hidden>
      <Canvas
        dpr={isMobile() ? [1, 1.2] : [1, 1.6]}
        gl={{ antialias: !isMobile(), alpha: true }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} color="#ffffff" castShadow />
        <pointLight position={[-4, 2, 4]} intensity={1.2} color="#00d46a" />
        <Suspense fallback={null}>
          {enabled && (
            <>
              <Basket />
              <Apple position={[1.3, 0.4, 0.4]} />
              <Orange position={[-1.5, 0.2, 0.3]} />
              <Carrot position={[-0.5, 1.4, -0.6]} />
              <Bread position={[1.6, 1.1, -0.7]} />
              <MilkCarton position={[-1.7, 1.0, -0.8]} />
              <LeafParticles />
            </>
          )}
          <ContactShadows position={[0, -1.9, 0]} opacity={0.35} scale={9} blur={2.5} far={3} color="#000000" />
        </Suspense>
        <CameraRig />
      </Canvas>

      {products[0] && (
        <button
          onClick={() => navigate(`/product/${products[0].id}`)}
          className="absolute left-[8%] top-[22%] hidden rounded-xl border border-leaf-500/30 bg-midnight/80 px-3 py-2 text-left backdrop-blur transition-all hover:border-leaf-500/60 hover:shadow-glow sm:block"
          aria-label={`View ${products[0].name}`}
        >
          <p className="text-xs font-bold text-white">{products[0].name}</p>
          <p className="text-xs font-semibold text-leaf-500">₹{products[0].price}/kg</p>
        </button>
      )}
    </div>
  )
}