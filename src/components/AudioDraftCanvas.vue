<template>
  <draft-canvas :initCtxStyle="initCtxStyle" :draw="draw"/>
</template>

<script setup lang="ts">
import DraftCanvas from './DraftCanvas.vue'
import { sourceNode } from '../audio'
import { useProject } from '../project'
import { Unmounted } from 'vue'

const project = useProject()

const analyserNode = new AnalyserNode(sourceNode.context);
analyserNode.fftSize = 1024;
sourceNode.connect(analyserNode);
const dataArray = new Float32Array(analyserNode.fftSize);

onUnmounted(() => {
  sourceNode.disconnect(analyserNode)
})

function initCtxStyle(ctx: CanvasRenderingContext2D){
  ctx.fillStyle = "#78328c";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000";
}

const slice_width = computed(() => project.animation_width / dataArray.length)

function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, drawPoint: { value: number }){
  analyserNode.getFloatTimeDomainData(dataArray);

  ctx.fillRect(
    drawPoint.value,
    0,
    project.animation_width,
    canvas.height
  );

  ctx.beginPath();
  for (let i = 0; i < dataArray.length; i++) {
    let y = (dataArray[i] + 1) * canvas.height / 2;

    if (i === 0) {
      ctx.moveTo(drawPoint.value, y);
    } else {
      ctx.lineTo(drawPoint.value, y);
    }
    drawPoint.value += slice_width.value;
  }
  ctx.stroke();
}
</script>
