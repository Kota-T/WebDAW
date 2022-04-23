<template>
  <v-btn
  block
  flat
  :rounded="0"
  height="30px"
  position="sticky"
  top
  style="z-index: 1;"
  >
    <v-icon>mdi-plus</v-icon>
    <track-type-dialog @submit="addTrack($event, project.tracks)"/>
  </v-btn>
</template>

<script setup lang="ts">
import TrackTypeDialog from './Dialog/TrackTypeDialog.vue'
import { useProject } from '../project'
import { addTrack } from '../track'
const project = useProject()
</script>
