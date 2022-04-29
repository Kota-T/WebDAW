<template>
  <canvas height="30" ref="canvas"/>
</template>

<style scoped>
canvas {
  display: block;
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>

<script setup lang="ts">
import { InstanceType, onMounted, ref, watch } from 'vue'
import { useProject } from '../project'

const canvas = ref<InstanceType<HTMLCanvasElement>>()
let ctx: CanvasRenderingContext2D

onMounted(()=>{
  ctx = canvas.value.getContext('2d')
  ctx.font = '10px'
  draw()
})

const project = useProject()

watch([
  () => project.rhythm,
  () => project.scale_width,
  () => project.width
], draw)

function draw(){
  canvas.value.width = project.width;
  ctx.fillStyle = "#323232";
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);

  ctx.strokeStyle = ctx.fillStyle = "#f0f0f0";
  const num = project.rhythm[0];
  const num_of_scales = project.width / project.scale_width;
  for(let i = 0; i < num_of_scales; i++){
    const x = i * project.scale_width;
    ctx.beginPath();
    if(i % num === 0){
      ctx.fillText(`${i / num + 1}`, x, 12);
      ctx.moveTo(x, 15);
    }else{
      ctx.moveTo(x, 25);
    }
    ctx.lineTo(x, 30);
    ctx.stroke();
  }
}
</script>
