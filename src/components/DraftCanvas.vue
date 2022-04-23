<template>
  <canvas width="1000" height="150" ref="canvas"/>
</template>

<script setup lang="ts">
import { sourceNode } from '../audio'
import { InstanceType, onMounted, ref } from 'vue'

const props = defineProps<{
  initCtxStyle: (ctx: CanvasRenderingContext2D) => void,
  draw: (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    drawPoint: { value: number }
  ) => void
}>()

const canvas = ref<InstanceType<HTMLCanvasElement>>()
let ctx: CanvasRenderingContext2D

onMounted(() => {
  ctx = canvas.value.getContext('2d')
})

const drawPoint = { value: 0 }

function draw(){
  if(drawPoint.value >= canvas.value.width)
    resize()
  props.draw(canvas.value, ctx, drawPoint)
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
