<template>
  <canvas id="pointer" :style="styles" width="2" ref="canvas"></canvas>
</template>

<style>
#pointer{
  position: absolute;
  z-index: 3;
}
</style>

<script>
export default {
  name: 'Pointer',
  data(){
    return {
      styles: {
        top: "0px",
        left: "0px"
      }
    }
  },
  mounted(){
    this.ctx = this.canvas.getContext('2d');
    this.canvas.height = window.innerHeight - 80;
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },
  computed: {
    beat_interval(){return this.$store.state.beat_interval;},
    animation_width(){
      const state = this.$store.state;
      return state.bpm / 60 * this.beat_interval / state.animation_fps;
    },
    canvas(){
      return this.$refs.canvas;
    },
    x: {
      get: function(){return this.styles.left.slice(0, -2) - 0;},
      set: function(_x){
        this.styles.left = _x + "px"
      }
    },
    y: {
      get: function(){return this.styles.top.slice(0, -2) - 0;},
      set: function(_y){
        this.styles.top = _y + "px"
      }
    }
  },
  watch: {
    beat_interval(newVal, oldVal){
      this.x *= newVal / oldVal;
    }
  },
  methods: {
    start(){
      let loop = ()=>{
        this.move();
        this.animationId = requestAnimationFrame(loop);
      }
      this.animationId = requestAnimationFrame(loop);
    },

    stop(){
      cancelAnimationFrame(this.animationId);
    },

    prepareRecording(){
      const rhythm = this.$store.state.rhythm;
      const scale_interval = this.beat_interval * 4 / rhythm[1];
      this.x = (Math.floor(this.x / scale_interval) - rhythm[0]) * scale_interval;
    },

    move(){
      this.$emit('move', this.x);
      this.x += this.animation_width;
    }
  }
}
</script>
