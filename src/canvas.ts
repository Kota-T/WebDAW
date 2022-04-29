import AudioCanvas from './components/AudioCanvas.vue'
import AudioDraftCanvas from './components/AudioDraftCanvas.vue'
import { shallowReadonly } from 'vue'

export const CanvasComponents = shallowReadonly({
  audio: AudioCanvas
})

export const DraftCanvasComponents = shallowReadonly({
  audio: AudioDraftCanvas
})
