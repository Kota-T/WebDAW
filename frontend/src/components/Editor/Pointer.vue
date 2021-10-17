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
    beat_width(){return this.$store.state.beat_width;},
    canvas(){
      return this.$refs.canvas;
    },
    layerX: {
      get(){return this.styles.left.slice(0, -2) - 0;},
      set(_layerX){this.styles.left = _layerX + "px";}
    },
    x: {
      get(){return this.layerX - this.margin;},
      set(_x){this.layerX = _x + this.margin;}
    },
    time(){
      return this.x / this.$store.getters.second_width;
    }
  },
  watch: {
    beat_width(newVal, oldVal){
      this.x *= newVal / oldVal;
    },
    x(newVal){
      this.$store.commit('pointer_x', newVal);
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
      const scale_width = this.$store.getters.scale_width;
      if(this.x >= 0){
        this.x = (Math.floor(this.x / scale_width) - rhythm[0]) * scale_width;
      }else{
        this.x = -rhythm[0] * scale_width;
      }
    },

    move(){
      this.$emit('move', { layerX: this.layerX, x: this.x });
      this.x += this.$store.getters.animation_width;
    }
  }
}
</script>
