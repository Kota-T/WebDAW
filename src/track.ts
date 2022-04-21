import { defineStore } from 'pinia'
import { MediaType, TrackData } from './type.d'
import * as repository from './track_repository'

export function addTrack(track_type: MediaType, tracks: TrackData[]) {
  tracks.push(repository.create(track_type))
}

import AudioTrackLabel from './components/AudioTrackLabel.vue'
import { shallowReadonly } from 'vue'

export const TrackLabelComponents = shallowReadonly({
  audio: AudioTrackLabel
})
