<template>
  <teleport to="#label-layer">
    <audio-track-label/>
  </teleport>
  <teleport to="#ruler-layer">
    <canvas-container/>
  </teleport>
</template>

<style></style>

<script setup lang="ts">
import AudioTrackLabel from './AudioTrackLabel.vue'
import CanvasContainer from './CanvasContainer.vue'
import { audioCtx, sourceNode } from '../audio'
import { provide, watch } from 'vue'
import { TrackData } from '../type.d'

const props = defineProps<{ trackData: TrackData }>()

provide('trackData', props.trackData)

const gainNode = new GainNode(audioCtx)
const pannerNode = new StereoPannerNode(audioCtx)
const muteNode = new GainNode(audioCtx)
const soloNode = new GainNode(audioCtx)
sourceNode
  .connect(gainNode)
  .connect(pannerNode)
  .connect(muteNode)
  .connect(soloNode)
  .connect(audioCtx.destination)

watch(() => props.trackData.gain, newVal => gainNode.gain.value = newVal)
watch(() => props.trackData.pan, newVal => pannerNode.pan.value = newVal)
watch(() => props.trackData.mute, newVal => muteNode.gain.value = newVal ? 0 : 1)
watch(() => props.trackData.mic, newVal => {
  if(newVal)
    sourceNode.connect(gainNode)
  else
    sourceNode.disconnect(gainNode)
})
</script>
