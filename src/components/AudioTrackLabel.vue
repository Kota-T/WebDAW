<template>
  <v-card
  density="compact"
  :height="TRACK_HEIGHT"
  :color="trackData.selected ? '#eee' : undefined"
  @click="select"
  >
    <v-card-title>
      <editable-text v-model="trackData.name"/>
    </v-card-title>
    <v-card-text class="py-2">
      <v-row align="center" no-gutters>
        <v-col class="flex-grow-0">
          <v-btn-toggle
          v-model="slider_toggle"
          mandatory
          density="compact"
          >
            <v-btn value="v" size="x-small">音量</v-btn>
            <v-btn value="p" size="x-small">パン</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col>
          <v-slider
          v-if="slider_toggle==='v'"
          v-model="trackData.gain"
          min="0"
          max="1"
          hide-details
          />
          <v-slider
          v-else-if="slider_toggle==='p'"
          v-model="trackData.pan"
          min="-1"
          max="1"
          hide-details
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <v-btn @click="trackData.mic=!trackData.mic">
        <v-icon>{{ trackData.mic ? 'mdi-microphone-variant' : 'mdi-microphone-variant-off' }}</v-icon>
      </v-btn>
      <v-btn @click="trackData.mute=!trackData.mute">
        <v-icon>{{ trackData.mute ? 'mdi-volume-mute' : 'mdi-volume-high' }}</v-icon>
      </v-btn>
      <v-btn @click="trackData.solo=!trackData.solo">S</v-btn>
    </v-card-actions>
    <context-menu :menuItems="menuItems"/>
  </v-card>
</template>

<script setup lang="ts">
import { TRACK_HEIGHT } from '../config'
import { useProject } from '../project'
import { TrackData } from '../type.d'
import { ref } from 'vue'

const { trackData } = defineProps<{ trackData: TrackData }>()

const slider_toggle = ref('v')

const menuItems = [
  {
    text: "削除",
    action: () => console.log('トラックを削除')
  }
]

const project = useProject()

function select(e) {
  if(!e.shiftKey)
    project.tracks.forEach(trackData => trackData.selected = false)
  trackData.selected = true
}
</script>
