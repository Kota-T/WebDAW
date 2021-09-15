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
  props: {
    margin: Number
  },
  data(){
    return {
      styles: {
        left: this.margin + "px"
      }
    }
  },
  mounted(){
    this.canvas.height = window.innerHeight - 80;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },
  computed: {
    beat_interval(){return this.$store.state.beat_interval;},
    canvas(){
      return this.$refs.canvas;
    },
    x: {
      get: function(){return this.styles.left.slice(0, -2) - this.margin;},
      set: function(_x){
        this.styles.left = _x + this.margin + "px";
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
      const scale_interval = this.$store.getters.scale_interval;
      this.x = (Math.floor(this.x / scale_interval) - rhythm[0]) * scale_interval;
    },

    move(){
      this.$emit('move', this.x);
      this.x += this.$store.getters.animation_width;
    }
  }
}
</script>
