<template>
  <v-dialog
  v-model="isOpen"
  activator="parent"
  >
    <v-card>
      <v-card-title>トラックの種類を選択</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-btn size="x-large" @click.stop="select('audio')">
              <v-icon>mdi-microphone</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn size="x-large" @click.stop="select('video')">
              <v-icon>mdi-video</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn size="x-large" @click.stop="select('midi')">
              <v-icon>mdi-piano</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn
        variant="plain"
        size="small"
        @click.stop="isOpen=false"
        >cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrackType } from '../type.d'

const emits = defineEmits<{ (e: 'select', track_type: TrackType): void }>()
const isOpen = ref(false)

function select(track_type: TrackType) {
  emits('select', track_type)
  isOpen.value = false
}
</script>
