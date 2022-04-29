<template>
  <canvas width="2" :style="style" ref="canvas"/>
</template>

<style scoped>
canvas {
  position: absolute;
  z-index: 3;
}
</style>

<script setup lang="ts">
import { POINTER_MARGIN } from '../config'
import { computed, onMounted, ref } from 'vue'
import { useProject } from '../project'

const project = useProject()

const style = computed(() => ({
  left: project.current_x + POINTER_MARGIN + 'px'
}))

const canvas = ref<InstanceType<HTMLCanvasElement>>()
let ctx: CanvasRenderingContext2D

onMounted(()=>{
  ctx = canvas.value.getContext('2d')
  draw()
  window.addEventListener('resize', draw)
})

function draw() {
  canvas.value.height = canvas.value.parentElement.offsetHeight
  ctx.fillStyle = "#f0f0f0"
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
}
</script>
