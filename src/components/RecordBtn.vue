<template>
  <v-btn
  v-if="project.state === undefined"
  icon="mdi-circle"
  color="red"
  size="x-large"
  @click="project.prepare"
  />
  <v-btn
  v-else-if="['preparing', 'recording'].includes(project.state)"
  icon="mdi-radiobox-marked"
  color="red"
  size="x-large"
  @click="project.pause"
  />
  <v-btn
  v-else
  icon="mdi-circle"
  color="grey"
  size="x-large"
  />
</template>

<script setup lang="ts">
import { useProject } from '../project'
const project = useProject()
</script>
