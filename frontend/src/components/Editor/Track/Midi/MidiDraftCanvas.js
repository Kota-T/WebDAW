import DraftCanvasMixin from '../DraftCanvasMixin.js';

export default {
  name: 'MidiDraftCanvas',
  mixins: [DraftCanvasMixin],
  methods: {
    initCtxStyle(){
      this.ctx.fillStyle = "#8c7832";
    },

    draw(){
      if(this.drawPoint >= this.canvas.width){
        this.resize();
      }
      const animation_width = this.$store.getters.animation_width;
      this.ctx.fillRect(this.drawPoint, 0, animation_width, this.canvas.height);
      this.drawPoint += animation_width;
    }
  }
}
