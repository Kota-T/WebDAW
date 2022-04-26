<template>
  <v-app-bar>
    <editable-text v-model="project.name"/>
    <v-spacer/>
    <v-btn-group variant="outlined" divided>
      <v-btn
      icon="mdi-metronome"
      :color="project.metronome ? 'primary' : 'grey'"
      size="large"
      @click="project.metronome = !project.metronome"
      />
      <v-btn>
        <count/>
      </v-btn>
      <v-btn>
        <bpm/>
      </v-btn>
      <record-btn/>
      <play-btn/>
      <v-btn>
        <rhythm/>
      </v-btn>
      <v-btn>
        <resizer/>
      </v-btn>
    </v-btn-group>
    <v-spacer/>
    <v-app-bar-nav-icon
    variant="text"
    @click="emits('open-side-menu')"
    />
  </v-app-bar>
</template>

<script setup lang="ts">
import Bpm from './Bpm.vue'
import Count from './Count.vue'
import RecordBtn from './RecordBtn.vue'
import PlayBtn from './PlayBtn.vue'
import Rhythm from './Rhythm.vue'
import Resizer from './Resizer.vue'
import { useProject } from '../project'
const emits = defineEmits<{ (e: 'open-side-menu'): void }>()
const project = useProject()
</script>
