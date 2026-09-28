import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { PartId } from './data'

const MODEL_PATH = '/models/crazyflie-2.0-official.glb'

const partColors: Record<PartId, number> = {
  frame: 0xeb7c6b,
  motors: 0x6e9fba,
  propellers: 0xd2a34f,
  controller: 0x8d6bcc,
  battery: 0xc77992,
  deck: 0x769d74,
}

type Props = {
  selected: PartId
  autoRotate: boolean
  resetSignal: number
  onSelect: (part: PartId) => void
}

type ViewerState = {
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  markers: THREE.Group | null
}

const markerDefinitions: Record<PartId, Array<{ position: [number, number, number]; radius: number }>> = {
  frame: [{ position: [0, 0.001, 0], radius: 0.029 }],
  motors: [
    { position: [0.0328, -0.001, 0.0328], radius: 0.007 },
    { position: [-0.0328, -0.001, 0.0328], radius: 0.007 },
    { position: [-0.0328, -0.001, -0.0328], radius: 0.007 },
    { position: [0.0328, -0.001, -0.0328], radius: 0.007 },
  ],
  propellers: [
    { position: [0.0328, 0.014, 0.0328], radius: 0.0165 },
    { position: [-0.0328, 0.014, 0.0328], radius: 0.0165 },
    { position: [-0.0328, 0.014, -0.0328], radius: 0.0165 },
    { position: [0.0328, 0.014, -0.0328], radius: 0.0165 },
  ],
  controller: [{ position: [0, 0.004, 0], radius: 0.011 }],
  battery: [{ position: [0, -0.011, 0], radius: 0.014 }],
  deck: [{ position: [0, 0.012, 0], radius: 0.014 }],
}

function createMarkers() {
  const root = new THREE.Group()
  root.name = 'Teaching highlights'

  for (const [part, definitions] of Object.entries(markerDefinitions) as [PartId, (typeof markerDefinitions)[PartId]][]) {
    const group = new THREE.Group()
    group.name = `Highlight ${part}`
    group.userData.part = part
    group.visible = false

    for (const definition of definitions) {
      const geometry = new THREE.TorusGeometry(definition.radius, 0.0007, 8, 48)
      const material = new THREE.MeshBasicMaterial({
        color: partColors[part],
        transparent: true,
        opacity: 0.82,
        depthTest: false,
        toneMapped: false,
      })
      const marker = new THREE.Mesh(geometry, material)
      marker.position.set(...definition.position)
      marker.rotation.x = Math.PI / 2
      marker.renderOrder = 20
      group.add(marker)
    }
    root.add(group)
  }
  return root
}

function classifyPart(point: THREE.Vector3): PartId {
  const radius = Math.hypot(point.x, point.z)
  if (radius > 0.041) return 'propellers'
  if (radius > 0.021) return point.y > 0.006 ? 'propellers' : 'motors'
  if (point.y < -0.0055) return 'battery'
  if (point.y > 0.009) return 'deck'
  if (radius > 0.015) return 'frame'
  return 'controller'
}

function setSelectedMarker(markers: THREE.Group | null, selected: PartId) {
  markers?.children.forEach((group) => {
    group.visible = group.userData.part === selected
  })
}

export function OfficialCrazyflieViewer({ selected, autoRotate, resetSignal, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<ViewerState | null>(null)
  const selectedRef = useRef(selected)
  const onSelectRef = useRef(onSelect)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [progress, setProgress] = useState(0)
  selectedRef.current = selected
  onSelectRef.current = onSelect

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let asset: THREE.Group | null = null
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(4.6, 3.25, 4.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.domElement.setAttribute('aria-label', 'Bitcraze 官方 Crazyflie 2.0 Rev B 三维模型')
    host.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = false
    controls.autoRotateSpeed = 0.9
    controls.minDistance = 3.2
    controls.maxDistance = 8.5
    controls.maxPolarAngle = Math.PI * 0.78
    stateRef.current = { camera, controls, markers: null }

    scene.add(new THREE.HemisphereLight(0xfffbf3, 0x8d7665, 2.4))
    const key = new THREE.DirectionalLight(0xffffff, 3.3)
    key.position.set(4, 6, 3)
    key.castShadow = true
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffd8c2, 1.15)
    fill.position.set(-4, 2, -3)
    scene.add(fill)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.7, 64),
      new THREE.MeshStandardMaterial({ color: 0xf1e5d8, roughness: 1, transparent: true, opacity: 0.52 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.57
    floor.receiveShadow = true
    scene.add(floor)
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.7, 2.72, 96),
      new THREE.MeshBasicMaterial({ color: 0xd3aa91, transparent: true, opacity: 0.48, side: THREE.DoubleSide }),
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = -0.555
    scene.add(ring)

    new GLTFLoader().load(
      MODEL_PATH,
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose()
              const materials = Array.isArray(object.material) ? object.material : [object.material]
              materials.forEach((material) => material.dispose())
            }
          })
          return
        }

        asset = gltf.scene
        asset.name = 'Bitcraze official Crazyflie 2.0 Rev B'
        const bounds = new THREE.Box3().setFromObject(asset)
        const center = bounds.getCenter(new THREE.Vector3())
        const size = bounds.getSize(new THREE.Vector3())
        const modelRoot = new THREE.Group()
        modelRoot.name = 'Official Crazyflie model root'
        asset.position.copy(center).multiplyScalar(-1)
        asset.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            object.receiveShadow = true
          }
        })
        modelRoot.add(asset)
        const markers = createMarkers()
        modelRoot.add(markers)
        modelRoot.scale.setScalar(3.22 / Math.max(size.x, size.z))
        modelRoot.position.y = 0.02
        modelRoot.rotation.y = -0.12
        scene.add(modelRoot)
        stateRef.current = { camera, controls, markers }
        setSelectedMarker(markers, selectedRef.current)
        setProgress(100)
        setStatus('ready')
      },
      (event) => {
        if (event.total > 0) setProgress(Math.round((event.loaded / event.total) * 100))
      },
      (error) => {
        console.error('Unable to load official Crazyflie model', error)
        if (!disposed) setStatus('error')
      },
    )

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const handleClick = (event: PointerEvent) => {
      if (!asset) return
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObject(asset, true)[0]
      if (!hit) return
      const localPoint = asset.worldToLocal(hit.point.clone())
      onSelectRef.current(classifyPart(localPoint))
    }
    renderer.domElement.addEventListener('pointerdown', handleClick)

    const resize = new ResizeObserver(() => {
      const width = host.clientWidth
      const height = host.clientHeight
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    })
    resize.observe(host)

    let frameId = 0
    const render = (time: number) => {
      const markers = stateRef.current?.markers
      markers?.children.forEach((group) => {
        if (group.visible) group.scale.setScalar(1 + Math.sin(time * 0.004) * 0.07)
      })
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(render)
    }
    frameId = requestAnimationFrame(render)

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      resize.disconnect()
      renderer.domElement.removeEventListener('pointerdown', handleClick)
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
      stateRef.current = null
    }
  }, [])

  useEffect(() => {
    setSelectedMarker(stateRef.current?.markers ?? null, selected)
  }, [selected])

  useEffect(() => {
    if (stateRef.current) stateRef.current.controls.autoRotate = autoRotate
  }, [autoRotate])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    state.camera.position.set(4.6, 3.25, 4.8)
    state.controls.target.set(0, 0, 0)
    state.controls.update()
  }, [resetSignal])

  return (
    <div className="viewer-canvas" ref={hostRef} aria-label="Bitcraze 官方 Crazyflie 2.0 Rev B 三维模型">
      {status !== 'ready' && (
        <div className={`official-model-status ${status}`} role="status">
          <strong>{status === 'error' ? '官方模型加载失败' : '正在装配 Crazyflie 2'}</strong>
          <span>{status === 'error' ? '请刷新页面后重试' : `${progress}%`}</span>
        </div>
      )}
    </div>
  )
}
