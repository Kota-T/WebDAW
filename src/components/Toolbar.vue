<template>
  <v-app-bar>
    <editable-text v-model="project.name"/>
    <v-spacer/>
    <v-btn
    icon="mdi-metronome"
    :color="project.metronome ? 'primary' : 'grey'"
    @click="project.metronome = !project.metronome"
    />
    <count/>
    <v-btn
    v-if="project.state === undefined"
    icon="mdi-play"
    @click="project.play"
    />
    <v-btn
    v-else-if="project.state === 'playing'"
    icon="mdi-pause"
    @click="project.pause"
    />
    <resizer/>
    <v-spacer/>
    <v-app-bar-nav-icon
    variant="text"
    @click="emits('open-side-menu')"
    />
  </v-app-bar>
</template>

<script setup lang="ts">
import Count from './Count.vue'
import Resizer from './Resizer.vue'
import { useProject } from '../project'
const emits = defineEmits<{ (e: 'open-side-menu'): void }>()
const project = useProject()
</script>
