<template>
  <audio-track-label
  v-if="trackData.type==='audio'"
  :trackData="trackData"
  />
</template>

<script setup lang="ts">
import AudioTrackLabel from './AudioTrackLabel.vue'
import { TrackData } from '../type.d'
defineProps<{ trackData: TrackData }>()
</script>
