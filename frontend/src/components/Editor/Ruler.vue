<template>
  <canvas id="ruler" height="30" ref="canvas"></canvas>
</template>

<style>
#ruler{
  display: block;
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>

<script>
export default {
  name: 'Ruler',
  mounted(){
    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = '10px';
    this.draw();
  },
  computed: {
    rhythm(){return this.$store.state.rhythm;},
    beat_interval(){return this.$store.state.beat_interval;},
    number_of_bars(){return this.$store.state.number_of_bars;},
    canvas(){return this.$refs.canvas;}
  },
  watch: {
    rhythm(){this.draw();},
    beat_interval(){this.draw();},
    number_of_bars(){this.draw();}
  },
  methods: {
    draw(){
      this.canvas.width = this.$store.getters.ruler_width;
      this.ctx.fillStyle = "#323232";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.strokeStyle = this.ctx.fillStyle = "#f0f0f0";
      const num = this.rhythm[0];
      const scale_interval = this.$store.getters.scale_interval;
      for(let i = 0; i < this.canvas.width / scale_interval; i++){
        const x = i * scale_interval;
        this.ctx.beginPath();
        if(i%num === 0){
          this.ctx.fillText(`${Math.floor(i/num)}`, x, 12);
          this.ctx.moveTo(x, 15);
        }else{
          this.ctx.moveTo(x, 25);
        }
        this.ctx.lineTo(x, 30);
        this.ctx.stroke();
      }
    }
  }
}
</script>
