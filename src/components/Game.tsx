'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import Target from './Target'
import * as THREE from 'three'
import { useState, useEffect, useCallback } from 'react'

interface TargetData {
  id: number;
  position: THREE.Vector3;
}

interface SceneProps {
  targets: TargetData[];
  onTargetHit: (targetId: number | null, hit: boolean) => void;
  timeScale: number;
}

function Scene({ targets, onTargetHit, timeScale }: SceneProps) {
  const { scene, camera } = useThree()

  const handleClick = () => {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(0, 0) // Center of the screen
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children)
    const target = intersects.find(i => i.object.name === 'target')
    if (target) {
      onTargetHit(target.object.userData.id, true)
    } else {
      onTargetHit(null, false)
    }
  }

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {targets.map(target => (
        <Target key={target.id} position={target.position} name="target" userData={{ id: target.id }} timeScale={timeScale} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <PointerLockControls />
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[100, 100]} />
      </mesh>
      <EffectComposer>
        <Vignette eskil={false} offset={0.1} darkness={timeScale < 1 ? 1.1 : 0} />
      </EffectComposer>
    </>
  )
}

const generateTargets = (wave: number): TargetData[] => {
  const newTargets: TargetData[] = []
  for (let i = 0; i < wave * 2; i++) {
    newTargets.push({
      id: Math.random(),
      position: new THREE.Vector3(
        Math.random() * 20 - 10,
        0,
        Math.random() * 20 - 10
      ),
    })
  }
  return newTargets
}

export default function Game() {
  const [targets, setTargets] = useState<TargetData[]>([])
  const [score, setScore] = useState(0)
  const [wave, setWave] = useState(1)
  const [combo, setCombo] = useState(0)
  const [lastHitTime, setLastHitTime] = useState(0)
  const [bulletTime, setBulletTime] = useState(false)

  const handleTargetHit = useCallback((targetId: number | null, hit: boolean) => {
    if (hit) {
      setTargets(targets => targets.filter(t => t.id !== targetId))
      setScore(score => score + 10 * (combo + 1))
      setCombo(combo => combo + 1)
      setLastHitTime(Date.now())
    } else {
      setCombo(0)
    }
  }, [combo])

  useEffect(() => {
    setTargets(generateTargets(wave))
  }, [wave])

  useEffect(() => {
    if (targets.length === 0 && wave > 0) {
      setWave(wave => wave + 1)
    }
  }, [targets.length, wave])

  useEffect(() => {
    if (combo > 0 && Date.now() - lastHitTime > 2000) {
      setCombo(0)
    }
  }, [combo, lastHitTime])

  useEffect(() => {
    if (combo > 0 && combo % 10 === 0) {
      setBulletTime(true)
      setTimeout(() => {
        setBulletTime(false)
      }, 2000)
    }
  }, [combo])

  return (
    <div className="w-full h-screen" onClick={() => document.body.requestPointerLock()}>
      <Canvas>
        <Scene targets={targets} onTargetHit={handleTargetHit} timeScale={bulletTime ? 0.2 : 1} />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '4px',
        height: '4px',
        backgroundColor: 'white',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)'
      }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontSize: '24px'
      }}>
        Score: {score}
      </div>
      <div style={{
        position: 'absolute',
        top: '50px',
        left: '20px',
        color: 'white',
        fontSize: '24px'
      }}>
        Wave: {wave}
      </div>
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        color: 'white',
        fontSize: '24px'
      }}>
        Combo: {combo}
      </div>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '20px',
        backgroundColor: 'gray',
        borderRadius: '10px'
      }}>
        <div style={{
          width: `${(combo % 10) * 20}px`,
          height: '100%',
          backgroundColor: 'orange',
          borderRadius: '10px'
        }} />
      </div>
    </div>
  )
}
