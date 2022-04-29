<template>
  <canvas
  width="1000"
  :height="TRACK_HEIGHT"
  :style="{ left: project.current_x + 'px' }"
  ref="canvas"
  />
</template>

<style scoped>
canvas {
  position: absolute;
}
</style>

<script setup lang="ts">
import { TRACK_HEIGHT } from '../config'
import { useProject } from '../project'
import { InstanceType, onBeforeMount, onMounted, onBeforeUnmount, ref } from 'vue'

type DraftCanvasProps = {
  initCtxStyle: (ctx: CanvasRenderingContext2D) => void,
  draw: (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    drawPoint: number
  ) => void
}

const props = defineProps<DraftCanvasProps>()

const canvas = ref<InstanceType<HTMLCanvasElement>>()
let ctx: CanvasRenderingContext2D

let drawId: number

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  props.initCtxStyle(ctx)
  drawId = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(drawId)
})

const project = useProject()

let drawPoint = 0

function draw(){
  if(drawPoint >= canvas.value.width)
    resize()
  drawPoint = props.draw(canvas.value, ctx, drawPoint)
  drawId = requestAnimationFrame(draw)
}

function resize(){
  const copyCvs = document.createElement('canvas');
  const copyCtx = copyCvs.getContext('2d');
  copyCvs.width  = canvas.value.width;
  copyCvs.height = canvas.value.height;
  copyCtx.drawImage(canvas.value, 0, 0, canvas.value.width, canvas.value.height);

  canvas.value.width += 1000;
  props.initCtxStyle(ctx);
  ctx.drawImage(copyCvs, 0, 0, copyCvs.width, copyCvs.height);
}
</script>
