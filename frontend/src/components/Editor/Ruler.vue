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
    bpm(){return this.$store.state.bpm;},
    beat_width(){return this.$store.state.beat_width;},
    project_duration(){return this.$store.state.project_duration;},
    canvas(){return this.$refs.canvas;}
  },
  watch: {
    rhythm(){this.draw();},
    bpm(){this.draw();},
    beat_width(){this.draw();},
    project_duration(){this.draw();}
  },
  methods: {
    draw(){
      this.canvas.width = this.$store.getters.ruler_width;
      this.ctx.fillStyle = "#323232";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.strokeStyle = this.ctx.fillStyle = "#f0f0f0";
      const num = this.rhythm[0];
      const scale_width = this.$store.getters.scale_width;
      for(let i = 0; i < this.canvas.width / scale_width; i++){
        const x = i * scale_width;
        this.ctx.beginPath();
        if(i % num === 0){
          this.ctx.fillText(`${i / num + 1}`, x, 12);
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
