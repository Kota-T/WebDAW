<template>
  <draft-canvas :initCtxStyle="initCtxStyle" :draw="draw"/>
</template>

<script setup lang="ts">
import DraftCanvas from './DraftCanvas.vue'
import { TrackData } from '../type.d'
import { sourceNode } from '../audio'
import { useProject } from '../project'
import { RecorderNode } from '../recorder-node'
import { writeWav } from '../wav'
import { computed, onBeforeUnmount, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{ trackData: TrackData }>()

const project = useProject()

const analyserNode = new AnalyserNode(sourceNode.context);
analyserNode.fftSize = 1024;
sourceNode.connect(analyserNode);
const dataArray = new Float32Array(analyserNode.fftSize);

const recorderNode = new RecorderNode(sourceNode.context);
sourceNode.connect(recorderNode)

let start_time = project.current_time

onBeforeUnmount(() => {
  sourceNode.disconnect(analyserNode)
  sourceNode.disconnect(recorderNode)
  const data = recorderNode.getData()
  const sampleRate = sourceNode.context.sampleRate
  const url = writeWav(data, sampleRate)
  props.trackData.canvases.push({
    id: uuidv4(),
    type: 'audio',
    url,
    start_time,
    duration: data.length / 2 / sampleRate,
    trim_start: 0,
    trim_end: 0
  })
  console.log("before unmount")
})

function initCtxStyle(ctx: CanvasRenderingContext2D){
  ctx.fillStyle = "#78328c";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000";
}

const slice_width = computed(() => project.animation_width / dataArray.length)

function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, drawPoint: number){
  analyserNode.getFloatTimeDomainData(dataArray)

  ctx.fillRect(
    drawPoint,
    0,
    project.animation_width,
    canvas.height
  )

  ctx.beginPath();
  for (let i = 0; i < dataArray.length; i++) {
    let y = (dataArray[i] + 1) * canvas.height / 2

    if (i === 0) {
      ctx.moveTo(drawPoint, y)
    } else {
      ctx.lineTo(drawPoint, y)
    }
    drawPoint += slice_width.value
  }
  ctx.stroke()

  return drawPoint
}
</script>
