<template>
  <canvas id="ruler" height="30" ref="canvas"></canvas>
</template>

<style>
#ruler{
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  left: 0;
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
      const [num, den] = this.rhythm;
      const scale_interval = this.beat_interval * 4 / den;
      this.canvas.width = scale_interval * num * this.number_of_bars;
      this.ctx.fillStyle = "#323232";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.strokeStyle = this.ctx.fillStyle = "#f0f0f0";
      for(let i = 0; i < this.canvas.width / scale_interval; i++){
        let x = i * scale_interval;
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
