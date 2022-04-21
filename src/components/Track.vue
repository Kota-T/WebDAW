<template>
  <audio-track
  v-if="trackData.type==='audio'"
  :trackData="trackData"
  />
</template>

<script setup lang="ts">
import AudioTrack from './AudioTrack.vue'
import { TrackData } from '../type/d'
defineProps<{ trackData: TrackData }>()
</script>
