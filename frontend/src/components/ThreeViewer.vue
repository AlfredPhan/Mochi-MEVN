<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

onMounted(() => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.getElementById('three-container').appendChild(renderer.domElement)

  // Ánh sáng
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
  scene.add(light)

  // Load model GLB
  const loader = new GLTFLoader()
  loader.load('/models/mochi_dessert_3d_scan.glb', (gltf) => {
    scene.add(gltf.scene)
    camera.position.set(0, 1.5, 3)

    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()
  })
})
</script>

<template>
  <div id="three-container" style="width:100%; height:500px;"></div>
</template>
