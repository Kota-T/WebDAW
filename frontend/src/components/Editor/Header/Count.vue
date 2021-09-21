<template>
  <svg id="metronome" @click="isMuted=!isMuted;">
    <use
    href="../../../assets/metronome.svg#metronome"
    :fill="isMuted ? 'red' : 'white'"
    :stroke="isMuted ? 'red' : 'white'"
    />
  </svg>
  <div id="count">{{ number }}</div>
</template>

<style>
#metronome{
  width: 30px;
  height: 30px;
}
#metronome:hover{
  cursor: pointer;
}
#count{
  background-color: white;
  font-size: 30px;
  font-family: sans-serif;
  padding: 0 5px;
}
</style>

<script>
import { loadAudioBuffer } from '../../../webaudio/webaudio.js';

export default {
  name: 'Count',
  props: ['audioCtx'],
  data(){
    return {
      isMuted: false,
      number: 1
    }
  },
  async mounted(){
    this.audioBuffer = await loadAudioBuffer(this.audioCtx, "/metronome.wav");
  },
  computed: {
    rhythm(){
      return this.$store.state.rhythm;
    },
    count_time(){
      return 60 / this.$store.state.bpm * 4 / this.rhythm[1];
    }
  },
  methods: {
    start(when=0){
      setTimeout(()=>{
        when !== 0 ? this.count() : this.playMetronome();
        this.countId = setInterval(()=>{
          this.count();
        }, this.count_time * 1000);
      }, when * 1000);
    },

    stop(){
      clearInterval(this.countId);
      this.pauseMetronome();
    },

    count(){
      if(this.number == this.rhythm[0]){
        this.number = 1;
      }else{
        this.number++;
      }

      this.playMetronome();
    },

    playMetronome(){
      if(this.isMuted){return;}
      this.source = this.audioCtx.createBufferSource();
      this.source.buffer = this.audioBuffer;
      this.source.connect(this.audioCtx.destination);
      this.source.start();
    },

    pauseMetronome(){
      if(!this.source) return;
      this.source.stop();
      this.source.disconnect();
    },

    setNumberFromPointerX(x){
      const getters = this.$store.getters;
      this.number = Math.floor(x % getters.bar_width / getters.scale_interval) + 1;
      if(this.number <= 0){
        this.number += this.rhythm[0];
      }
    }
  }
}
</script>
