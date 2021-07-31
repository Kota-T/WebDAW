<template>
  <canvas
  class="audio-canvas"
  tabindex="-1"
  :style="styles"
  :width="width"
  height="120"
  @contextmenu.prevent="$refs.menu.show"
  @touchstart="e => e.touches.length === 2 ? $refs.menu.show() : console.log('error')"
  @keydown.delete.stop="$emit('remove')"
  ref="canvas"
  ></canvas>
  <ContextMenu ref="menu">
    <li @click.stop="$emit('remove')">削除</li>
  </ContextMenu>
</template>

<style>
.audio-canvas{
  position: absolute;
  top: 0;
}
.audio-canvas:hover{
  cursor: pointer;
}
.audio-canvas:focus{
  border: 1px solid white;
  outline: none;
}
</style>

<script>
import { Loader } from '../../../../webaudio/webaudio.js';
import { Player, DrawDataProcessor, Drawer } from './AudioCanvas.js';

import ContextMenu from '../../../util/ContextMenu.vue';

export default {
  name: 'AudioCanvas',
  components: {
    ContextMenu
  },
  props: ['initConfig', 'audioCtx', 'audioNode'],
  emits: ['track-selected', 'remove'],
  data(){
    return {
      styles: {
        left: "0px"
      },
      width: 0,
      isSelected: false,
    }
  },
  mounted(){
    this.ctx = this.canvas.getContext('2d');
    this.x = this.initConfig.startPoint;
    this.diminished = this.initConfig.diminished || {left: 0, right: 0};

    this.canvas.ontouchmove = e => {
      e.preventDefault();
      e.stopPropagation();
    }

    this.canvas.onpointerdown = e => {
      e.stopPropagation();
      this.canvas.focus();
      this.$emit('track-selected');
      const initLeft = e.offsetX;
      const initRight = this.canvas_width - initLeft;
      if(initLeft <= 30 || initRight <= 30){
        this.canvas.onpointermove = this.resize.bind(this, initLeft, initRight);
      }else{
        this.canvas.onpointermove = this.move.bind(this, initLeft);
      }
    }

    this.canvas.onpointerup = this.canvas.onpointerout = ()=>{
      this.canvas.onpointermove = null;
    }

    this.data = { buffer: null };

    this.loader = new Loader(this.audioCtx, this.initConfig.url, this.data);

    this.player = new Player(this.audioCtx, this.audioNode, this.data);

    this.drawer = new Drawer(this.canvas, this.ctx, this.data);

    this.drawdataprocessor = new DrawDataProcessor(this.audioCtx);

    (async ()=>{
      await this.loader.load();
      this.canvas_width = this.data.buffer.duration * this.second_width;
      if(this.canvas_width > this.ruler_width){
        const state = this.$store.state;
        const result = Math.ceil(this.data.buffer.duration * state.bpm / 60 / state.rhythm[0] * 4 / state.rhythm[1])
        this.$store.commit('number_of_bars', result);
      }
    })();
  },
  computed: {
    bpm(){
      return this.$store.state.bpm;
    },
    beat_interval(){
      return this.$store.state.beat_interval;
    },
    second_width(){
      return this.bpm / 60 * this.beat_interval;
    },
    ruler_width(){
      const state = this.$store.state;
      return state.beat_interval * state.rhythm[0] * 4 / state.rhythm[1] * state.number_of_bars;
    },
    canvas(){
      return this.$refs.canvas;
    },
    x: {
      get: function(){return this.styles.left.slice(0, -2) - 0;},
      set: function(_x){
        if(_x < 0){
          _x = 0;
        }
        this.styles.left = _x + "px";
      }
    },
    canvas_width: {
      get: function(){return this.width;},
      set: function(_width){this.width = Math.round(_width);}
    },
    initStartPoint(){
      return this.x - this.diminished.left;
    },
    initEndPoint(){
      return this.x + this.canvas_width + this.diminished.right;
    },
    startPoint(){
      return this.x;
    },
    endPoint(){
      return this.x + this.canvas_width;
    }
  },
  watch: {
    bpm(newVal, oldVal){
      this.canvas_width *= newVal / oldVal;
    },
    beat_interval(newVal, oldVal){
      this.zoom(newVal, oldVal);
    },
    canvas_width(){
      this.$nextTick(function(){this.draw();});
    }
  },
  methods: {
    getTimeOfDistance(distance){
      return  60 / this.bpm * distance / this.beat_interval;
    },

    getTime(point){
      return  60 / this.bpm * (point - this.initStartPoint)/ this.beat_interval;
    },

    play(startPoint, onended){
      this.player.play(
        this.getTime(startPoint),
        this.getTime(this.endPoint),
        onended
      );
    },

    pause(){
      this.player.pause();
    },

    draw(){
      this.drawer.draw(
        this.drawdataprocessor.getDrawData(
          this.data.buffer,
          this.getTime(this.startPoint),
          this.getTime(this.endPoint)
        )
      );
    },

    async zoom(newVal, oldVal){
      if(!this.data.buffer){
        await this.loader.load();
      }
      const ratio = newVal / oldVal;
      this.diminished.left *= ratio;
      this.diminished.right *= ratio;
      this.x *= ratio;
      this.canvas_width *= ratio;
    },

    move(initX, e){
      this.x += e.offsetX - initX;
    },

    resize(initLeft, initRight, e){
      const left = e.offsetX;
      const right = this.canvas_width - left;

      const process = (init, tmp, which) => {
        let dif = Math.floor(tmp - init);
        if(-this.diminished[which] > dif){
          dif = -this.diminished[which];
        }
        if(which === "left"){this.x += dif;}
        this.diminished[which] += dif;
        this.canvas_width -= dif;
      }

      if(initLeft <= 30){
        process(initLeft, left, "left");
      }else if(initRight <= 30){
        process(initRight, right, "right");
      }
    },

    async getDownloadData(folder, index){
      await new Promise(resolve=>{
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.loader.url);
        xhr.responseType = 'blob';
        xhr.onload = ()=>{
          folder.file(index + ".wav", xhr.response);
          resolve();
        }
        xhr.onerror = console.error;
        xhr.send();
      });

      return {
        startPoint: this.startPoint,
        diminished: this.diminished
      };
    },

    async getUploadData(){
      let base64;
      await new Promise(resolve=>{
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.loader.url);
        xhr.responseType = 'blob';
        xhr.onload = ()=>{
          const reader = new FileReader();
          reader.onload = ()=>{
            base64 = reader.result;
            resolve();
          }
          reader.readAsDataURL(xhr.response);
        }
        xhr.onerror = console.error;
        xhr.send();
      });

      return {
        startPoint: this.startPoint,
        diminished: this.diminished,
        base64    : base64
      };
    },

    createOfflineSource(offlineCtx, gainNode, start_time, stop_time){
      const source = offlineCtx.createBufferSource();
      source.buffer = this.data.buffer;
      source.connect(gainNode);
      let when = this.getTimeOfDistance(this.startPoint) - start_time;
      let offset = this.getTimeOfDistance(this.diminished.left);
      if(when <= 0){
        if(offset <= -when){
          offset = -when;
        }
        when = 0;
      }
      let duration = this.getTimeOfDistance(this.width) - offset;
      const end_time = this.getTimeOfDistance(this.endPoint);
      if(end_time >= stop_time){
        duration -= (end_time - stop_time);
      }
      source.start(when, offset, duration);
    }
  }
}
</script>
