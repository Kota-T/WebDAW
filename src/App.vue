<template>
  <v-app style="height: 100vh;">
    <side-menu v-model="drawer"/>
    <v-app-bar>
      <editable-text v-model="project.name"/>
      <v-spacer/>
      <v-btn
      icon="mdi-metronome"
      :color="project.metronome ? 'primary' : 'grey'"
      @click.stop="project.metronome = !project.metronome"
      />
      <count/>
      <v-btn
      v-if="project.state === undefined"
      icon="mdi-play"
      @click.stop="project.play"
      />
      <v-btn
      v-else-if="project.state === 'playing'"
      icon="mdi-pause"
      @click.stop="project.pause"
      />
      <resizer/>
      <v-spacer/>
      <v-app-bar-nav-icon
      variant="text"
      @click.stop="drawer=true"
      />
    </v-app-bar>
    <v-navigation-drawer permanent class="overflow-y-auto">
      <v-btn
      block
      flat
      :rounded="0"
      height="30px"
      >
        <v-icon>mdi-plus</v-icon>
        <track-type-dialog @select="addTrack($event, project.tracks)"/>
      </v-btn>
      <label-layer v-model="scrollTop">
        <draggable
        :list="project.tracks"
        :item-key="trackData => trackData.id"
        >
          <template #item="{ element }">
            <component
            :is="TrackLabelComponents[element.type]"
            :trackData="element"
            />
          </template>
        </draggable>
      </label-layer>
    </v-navigation-drawer>
    <v-main>
      <pointer-layer>
        <pointer/>
        <ruler-layer v-model="scrollTop">
          <ruler/>
          <canvas-container
          v-for="trackData in project.tracks"
          :key="trackData.id"
          :canvases="trackData.canvases"
          />
        </ruler-layer>
      </pointer-layer>
    </v-main>
    <message ref="message"/>
  </v-app>
</template>

<script setup lang="ts">
import CanvasContainer from './components/CanvasContainer.vue'
import SideMenu from './components/SideMenu.vue'
import Count from './components/Count.vue'
import Resizer from './components/Resizer.vue'
import LabelLayer from './components/LabelLayer.vue'
import PointerLayer from './components/PointerLayer.vue'
import Pointer from "./components/Pointer.vue"
import RulerLayer from './components/RulerLayer.vue'
import Ruler from "./components/Ruler.vue"
import TrackTypeDialog from './components/Dialog/TrackTypeDialog.vue'
import Message from './components/Message.vue'
import draggable from 'vuedraggable'
import { onMounted, provide, ref, watch } from 'vue'
import { POINTER_MARGIN } from './config'
import { useProject } from './project'

import { addTrack, TrackLabelComponents } from './track'

const drawer = ref(false)
const scrollTop = ref(0)

const project = useProject()

const message = ref()
function showMessage(text: string, color: string) {
  message.value.show(text, color)
}
provide('showMessage', showMessage)

watch(() => project.current_x, newVal => {
  if(project.state === 'recording' && newVal >= project.width - POINTER_MARGIN)
    project.scroll_width += project.min_width
})
</script>
