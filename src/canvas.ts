import AudioCanvas from './components/AudioCanvas.vue'
import { shallowReadonly } from 'vue'

export const CanvasComponents = shallowReadonly({
  audio: AudioCanvas
})
