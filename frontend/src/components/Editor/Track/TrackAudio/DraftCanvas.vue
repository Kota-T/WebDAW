<template>
  <canvas class="draft-canvas" :style="styles" width="1000" height="120" v-show="isShow" ref="canvas"></canvas>
</template>

<style>
.draft-canvas{
  position: absolute;
  z-index: 1;
}
</style>

<script>
export default {
  name: 'DraftCanvas',
  props: ['audioCtx', 'sourceNode'],
  data(){
    return {
      styles: {
        left: "0px"
      },
      isShow: false
    }
  },
  created(){
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 1024;
    this.sourceNode.connect(this.analyserNode);
    this.dataArray = new Uint8Array(this.analyserNode.fftSize);
    this.drawPoint = 0;
  },
  unmounted(){
    this.sourceNode.disconnect(this.analyserNode);
  },
  mounted(){
    this.ctx = this.canvas.getContext('2d');
    this.initCtxStyle();
  },
  computed: {
    canvas(){
      return this.$refs.canvas;
    },
    slice_width(){
      return this.$store.getters.animation_width / this.dataArray.length;
    }
  },
  methods: {
    initCtxStyle(){
      this.ctx.fillStyle = "#78328c";
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#000";
    },

    show(startPoint){
      this.styles.left = startPoint + "px";
      this.canvas.width = 1000;
      this.initCtxStyle();
      this.drawPoint = 0;
      this.isShow = true;
    },

    hide(){
      this.isShow = false;
    },

    draw(){
      if(this.drawPoint >= this.canvas.width){
        this.resize();
      }

      this.analyserNode.getByteTimeDomainData(this.dataArray);

      this.ctx.fillRect(
        this.drawPoint,
        0,
        this.$store.getters.animation_width,
        this.canvas.height
      );

      this.ctx.beginPath();
      for (let i = 0; i < this.dataArray.length; i++) {
        let y = this.dataArray[i] / 256  * this.canvas.height;

        if (i === 0) {
          this.ctx.moveTo(this.drawPoint, y);
        } else {
          this.ctx.lineTo(this.drawPoint, y);
        }
        this.drawPoint += this.slice_width;
      }
      this.ctx.stroke();
    },

    resize(){
      const cvs = document.createElement('canvas');
      const ctx = cvs.getContext('2d');
      cvs.width  = this.canvas.width;
      cvs.height = this.canvas.height;
      ctx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);

      this.canvas.width += 1000;
      this.initCtxStyle();
      this.ctx.drawImage(cvs, 0, 0, cvs.width, cvs.height);
    }
  }
}
</script>
