<template>
  <v-app style="height: 100vh;">
    <side-menu v-model="side_menu"/>
    <toolbar @open-side-menu="side_menu=true"/>
    <v-navigation-drawer permanent>
      <label-layer v-model="scrollTop">
        <add-track-btn/>
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
import SideMenu from './components/SideMenu.vue'
import Toolbar from './components/Toolbar.vue'
import AddTrackBtn from './components/AddTrackBtn.vue'
import LabelLayer from './components/LabelLayer.vue'
import PointerLayer from './components/PointerLayer.vue'
import Pointer from "./components/Pointer.vue"
import RulerLayer from './components/RulerLayer.vue'
import Ruler from "./components/Ruler.vue"
import TrackTypeDialog from './components/Dialog/TrackTypeDialog.vue'
import CanvasContainer from './components/CanvasContainer.vue'
import Message from './components/Message.vue'
import draggable from 'vuedraggable'
import { onMounted, provide, ref, watch } from 'vue'
import { POINTER_MARGIN } from './config'
import { useProject } from './project'

import { addTrack, TrackLabelComponents } from './track'

const side_menu = ref(false)
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
