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
import { Loader } from '../../../webaudio/webaudio.js';

export default {
  name: 'Count',
  props: ['audioCtx'],
  data(){
    return {
      isMuted: false,
      number: 1
    }
  },
  mounted(){
    this.bufferContainer = { buffer: null };

    this.loader = new Loader(this.audioCtx, "/metronome.wav", this.bufferContainer);

    (async () => await this.loader.load())();
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
      this.source.buffer = this.bufferContainer.buffer;
      this.source.connect(this.audioCtx.destination);
      this.source.start();
    },

    setNumberFromPointerX(x){
      const scale_interval = this.$store.state.beat_interval * 4 / this.rhythm[1];
      this.number = Math.ceil(x % (scale_interval * this.rhythm[0]) / scale_interval);
      if(this.number < 0){
        this.number += this.rhythm[0];
      }
    }
  }
}
</script>
