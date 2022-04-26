<template>
  <v-btn
  v-if="project.state === undefined"
  icon="mdi-play"
  size="x-large"
  @click="project.play"
  />
  <v-btn
  v-else-if="project.state === 'playing'"
  icon="mdi-pause"
  size="x-large"
  @click="project.pause"
  />
  <v-btn
  v-else
  icon="mdi-play"
  color="grey"
  size="x-large"
  />
</template>

<script setup lang="ts">
import { useProject } from '../project'
const project = useProject()
</script>
