<template>
  <div style="font-size: 1.5rem;">{{ project.beat_count }}</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useProject } from '../project'
//import { loadAudioBuffer, Player } from '../../../audio';

//const props = defineProps<{ audioCtx: AudioContext }>()

//const isMuted = ref(false)

const project = useProject()

watch(() => project.beat_count, newVal => {
  //playMetronome()
})

/*let audioBuffer: AudioBuffer
let player: Player

onMounted(async ()=>{
  audioBuffer = await loadAudioBuffer(props.audioCtx, "/metronome.wav");
  player = new Player(audioBuffer, props.audioCtx.destination);
})

function playMetronome(){
  if(!isMuted.value)
    player.play();
}*/
</script>
