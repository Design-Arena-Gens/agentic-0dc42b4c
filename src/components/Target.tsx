'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Target(props: any) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state, delta) => {
    if (ref.current) {
      const timeScale = props.timeScale || 1
      ref.current.rotation.x += 0.01 * timeScale
      ref.current.rotation.y += 0.01 * timeScale
    }
  })

  return (
    <mesh {...props} ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}
