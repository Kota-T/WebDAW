import { defineStore } from 'pinia'
import { MediaType, TrackData } from './type.d'
import { createTrack as createAudioTrack } from './audio'

export function addTrack(track_type: MediaType, tracks: TrackData[]) {
  tracks.forEach(trackData => trackData.selected = false)
  tracks.push(createTrack(track_type))
}

function createTrack(track_type: TrackData) {
  switch(track_type) {
    case 'audio':
      return createAudioTrack()
  }
}

import AudioTrackLabel from './components/AudioTrackLabel.vue'
import { shallowReadonly } from 'vue'

export const TrackLabelComponents = shallowReadonly({
  audio: AudioTrackLabel
})
