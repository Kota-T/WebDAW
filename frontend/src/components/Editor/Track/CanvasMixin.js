import { h, resolveComponent } from 'vue';

const CanvasMixin = {
  render(){
    return [
      h('canvas', {
        class: 'data-canvas',
        tabindex: -1,
        width: this._width,
        height: 120,
        style: this.styles,
        onKeydown: $event=>{
          $event.stopPropagation();
          if($event.key === "Backspace")
            this.$emit('canvas-remove');
        },
        onContextmenu: $event=>this.$refs.menu.show($event),
        onTouchstart: $event=>this.$refs.menu.show($event),
        ref: 'canvas'
      },[]),
      h(
        resolveComponent('ContextMenu'),
        { ref: 'menu' },
        {
          default: ()=>[
            h('li', { onClick: $event=>{
              $event.stopPropagation();
              this.split();
            } }, ["分割"]),
            h('li', { onClick: $event=>{
              $event.stopPropagation();
              this.downloadFile();
            } }, ["ダウンロード"]),
            h('li', { onClick: $event=>{
              $event.stopPropagation();
              this.$emit('canvas-remove');
            } }, ['削除'])
          ]
        }
      )
    ]
  },
  props: {
    canvasData: {
      type: Object,
      required: true
    }
  },
  inject: ['socket', 'trackId'],
  emits: ['track-select', 'canvas-split', 'canvas-remove'],
  data(){
    return {
      styles: {
        left: "0px"
      },
      _width: 0,
      isSelected: false,
    }
  },
  async created(){
    this.id = this.canvasData.id;
    this.initDiminished(this.canvasData.diminished);
    if(this.socket.connected && this.canvasData.send){
      this.socket.send({
        type: 'addCanvas',
        trackId: this.trackId,
        canvasData: await this.getUploadData()
      });
    }
  },
  async mounted(){
    /*
    data: {
      startPoint: double,
      diminished: Object,
      url: objectURL | dataURL
    }
    */
    this.ctx = this.canvas.getContext('2d');
    this.x = this.canvasData.startTime * this.$store.getters.second_width;

    this.canvas.onpointerover = e=>{
      this.decideCursor(e.offsetX);
      this.canvas.onpointermove = e=>this.decideCursor(e.offsetX);
    }

    this.canvas.ontouchmove = e => {
      e.preventDefault();
      e.stopPropagation();
    }

    this.canvas.onpointerdown = e => {
      e.stopPropagation();
      this.canvas.focus();
      this.$emit('track-select', e.shiftKey);

      const startX = e.offsetX;
      if(startX <= 30){
        this.canvas.onpointermove = e=>{
          this.decideCursor(e.offsetX);
          this.resizeLeft(startX, e.offsetX);
        }
      }else if(this.width - startX <= 30){
        let preX = startX;
        this.canvas.onpointermove = e=>{
          this.decideCursor(e.offsetX);
          this.resizeRight(preX, e.offsetX);
          preX = e.offsetX;
        }
      }else{
        this.styles.cursor = 'grabbing';
        this.canvas.onpointermove = e=>this.move(startX, e.offsetX);
      }
    }

    this.canvas.ontouchend = e=>{
      e.preventDefault();
      e.stopPropagation();
    }

    this.canvas.onpointerup = e=>{
      e.preventDefault();
      e.stopPropagation();
      this.decideCursor(e.offsetX);
      this.canvas.onpointermove = e=>this.decideCursor(e.offsetX);
    }

    this.canvas.onpointerout = e=>{
      e.preventDefault();
      e.stopPropagation();
      delete this.styles.cursor;
      this.canvas.onpointermove = null;
    }

    this.canvas.onclick = e=>{
      e.preventDefault();
      e.stopPropagation();
    }
  },
  unmounted(){
    URL.revokeObjectURL(this.canvasData.url);
  },
  computed: {
    bpm(){
      return this.$store.state.bpm;
    },
    beat_width(){
      return this.$store.state.beat_width;
    },
    canvas(){
      return this.$refs.canvas;
    },
    x: {
      get(){return this.styles.left.slice(0, -2) - 0;},
      set(_x){
        if(_x < 0){
          _x = 0;
        }
        this.styles.left = _x + "px";
      }
    },
    width: {
      get(){return this._width;},
      set(_width){this._width = Math.round(_width);}
    },
    initStartPoint(){
      return this.x - this.diminished.left;
    },
    initEndPoint(){
      return this.x + this.width + this.diminished.right;
    },
    startPoint(){
      return this.x;
    },
    endPoint(){
      return this.x + this.width;
    },
    initStartTime(){
      return this.initStartPoint / this.$store.getters.second_width;
    },
    initEndTime(){
      return this.initEndPoint / this.$store.getters.second_width;
    },
    startTime(){
      return this.startPoint / this.$store.getters.second_width;
    },
    endTime(){
      return this.endPoint / this.$store.getters.second_width;
    },
    initDuration(){
      return (this.diminished.left + this.width + this.diminished.right) / this.$store.getters.second_width;
    },
    duration(){
      return this.width / this.$store.getters.second_width;
    }
  },
  watch: {
    bpm(newVal, oldVal){
      this.zoom(newVal, oldVal);
    },
    beat_width(newVal, oldVal){
      this.zoom(newVal, oldVal);
    },
    width(){
      this.$nextTick(function(){this.draw();});
    }
  },
  methods: {
    play(startPoint, onended){},

    pause(){},

    draw(){},

    downloadFile(){},

    initDiminished(diminished={ leftTime: 0, rightTime: 0 }){
      this.diminished = {
        left  : diminished.leftTime * this.$store.getters.second_width,
        right : diminished.rightTime * this.$store.getters.second_width,
        getData(){
          return { leftTime: this.leftTime, rightTime: this.rightTime };
        }
      };
      Object.defineProperties(this.diminished, {
        leftTime: {
          get: () => this.diminished.left / this.$store.getters.second_width
        },
        rightTime: {
          get: () => this.diminished.right / this.$store.getters.second_width
        }
      });
    },

    decideCursor(x){
      if(x <= 30){
        this.styles.cursor = this.diminished.left === 0 ? 'e-resize' : 'ew-resize';
      }else if(this.width - x <= 30){
        this.styles.cursor = this.diminished.right === 0 ? 'w-resize' : 'ew-resize';
      }else{
        this.styles.cursor = 'grab';
      }
    },

    initWidth(duration){
      const leftTime = this.canvasData.diminished?.leftTime || 0;
      const rightTime = this.canvasData.diminished?.rightTime || 0;
      this.width = (duration - leftTime - rightTime) * this.$store.getters.second_width;
      if(this.endPoint > this.$store.getters.ruler_width){
        this.$store.commit('project_duration', this.canvasData.startTime + duration);
      }
    },

    getTime(point){
      return (point - this.initStartPoint) / this.$store.getters.second_width;
    },

    move(initX, tmpX){
      this.x += tmpX - initX;
    },

    resizeLeft(startX, tmpX){
      if(tmpX < startX){
        this.lengthenLeft(startX, tmpX);
      }else{
        this.shortenLeft(startX, tmpX);
      }
    },

    lengthenLeft(startX, tmpX){
      let dif = Math.floor(startX - tmpX);
      if(this.diminished.left < dif){
        dif = this.diminished.left;
      }
      this.x -= dif;
      this.width += dif;
      this.diminished.left -= dif;
    },

    shortenLeft(startX, tmpX){
      let dif = Math.floor(tmpX - startX);
      if(this.width - dif < 60){
        dif = this.width - 60;
      }
      this.x += dif;
      this.width -= dif;
      this.diminished.left += dif;
    },

    resizeRight(preX, tmpX){
      if(preX < tmpX){
        this.lengthenRight(preX, tmpX);
      }else{
        this.shortenRight(preX, tmpX);
      }
    },

    lengthenRight(preX, tmpX){
      let dif = Math.floor(tmpX - preX);
      if(this.diminished.right < dif){
        dif = this.diminished.right;
      }
      this.width += dif;
      this.diminished.right -= dif;
    },

    shortenRight(preX, tmpX){
      let dif = Math.floor(preX - tmpX);
      if(this.width - dif < 60){
        dif = this.width - 60;
      }
      this.width -= dif;
      this.diminished.right += dif;
    },

    zoom(newVal, oldVal){
      const ratio = newVal / oldVal;
      this.x *= ratio;
      this.width *= ratio;
      this.diminished.left *= ratio;
      this.diminished.right *= ratio;
    },

    async getDownloadData(folder, ext){
      await fetch(this.canvasData.url)
      .then(res=>res.blob())
      .then(res=>folder.file(this.id + ext, res))
      .catch(console.error);

      return {
        id         : this.id,
        startTime  : this.startTime,
        diminished : this.diminished.getData()
      };
    },

    async getUploadData(){
      const url = await fetch(this.canvasData.url)
      .then(res=>res.blob())
      .then(res=>new Promise(resolve=>{
        const reader = new FileReader();
        reader.onload = ()=>resolve(reader.result);
        reader.readAsDataURL(res);
      }))
      .catch(console.error);

      return {
        id         : this.id,
        startTime  : this.startTime,
        diminished : this.diminished.getData(),
        url        : url
      };
    }
  }
}

export default CanvasMixin;
