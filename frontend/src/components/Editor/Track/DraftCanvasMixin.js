import { h } from 'vue';

const DraftCanvasMixin = {
  render(){
    return h('canvas', {
      class: 'draft-canvas',
      width: 1000,
      height: 120,
      style: this.styles,
      ref: 'canvas',
    }, [])
  },
  data(){
    return {
      styles: {
        display: "none",
        left: "0px"
      }
    }
  },
  created(){
    this.drawPoint = 0;
  },
  mounted(){
    this.ctx = this.canvas.getContext('2d');
    this.initCtxStyle();
  },
  computed: {
    canvas(){
      return this.$refs.canvas;
    }
  },
  methods: {
    show(startPoint){
      this.styles.left = startPoint + "px";
      this.canvas.width = 1000;
      this.initCtxStyle();
      this.drawPoint = 0;
      delete this.styles.display;
    },

    hide(){
      this.styles.display = "none";
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

export default DraftCanvasMixin;
