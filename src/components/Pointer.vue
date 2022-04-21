<template>
  <canvas :style="style" width="2" ref="canvas"/>
</template>

<style>
canvas {
  position: absolute;
  z-index: 3;
}
</style>

<script setup lang="ts">
import { POINTER_MARGIN } from '../config'
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useProject } from '../project'

const project = useProject()

const style = reactive({ left: POINTER_MARGIN + "px" })

const layerX = computed({
  get: () => style.left.slice(0, -2) - 0,
  set: _layerX => style.left = _layerX + "px"
})
const x = computed({
  get: () => layerX.value - POINTER_MARGIN,
  set: _x => layerX.value = _x + POINTER_MARGIN
})

x.value = project.current_x

watch(() => project.current_x, newVal => x.value = newVal)

const canvas = ref<InstanceType<HTMLCanvasElement>>()
let ctx: CanvasRenderingContext2D

onMounted(()=>{
  canvas.value.height = canvas.value.parentElement.offsetHeight;
  ctx = canvas.value.getContext('2d');
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
})

function prepareRecording(){
  const rhythm = project.rhythm;
  const scale_width = project.scale_width;
  if(x.value >= 0){
    x.value = (Math.floor(x.value / scale_width) - rhythm[0]) * scale_width;
  }else{
    x.value = -rhythm[0] * scale_width;
  }
}

defineExpose({ layerX, x })
</script>
