<template>
  <canvas
  class="audio-canvas"
  tabindex="-1"
  :style="styles"
  :width="_width"
  height="120"
  @keydown.delete.stop="$emit('remove')"
  @contextmenu="$refs.menu.show"
  @touchstart="$refs.menu.show"
  ref="canvas"
  ></canvas>
  <ContextMenu ref="menu">
    <li @click.stop="downloadAudioFile">ダウンロード</li>
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
      _width: 0,
      isSelected: false,
    }
  },
  async mounted(){
    this.ctx = this.canvas.getContext('2d');
    this.x = this.initConfig.startPoint;
    this.initDiminished(this.initConfig.diminished);

    this.canvas.ontouchmove = e => {
      e.preventDefault();
      e.stopPropagation();
    }

    this.canvas.onpointerdown = e => {
      e.stopPropagation();
      this.canvas.focus();
      this.$emit('track-selected');
      const initLeft = e.offsetX;
      const initRight = this.width - initLeft;
      if(initLeft <= 30 || initRight <= 30){
        this.canvas.onpointermove = this.resize.bind(this, initLeft, initRight);
      }else{
        this.canvas.onpointermove = this.move.bind(this, initLeft);
      }
    }

    this.canvas.ontouchend = e=>e.preventDefault();

    this.canvas.onpointerup = this.canvas.onpointerout = e=>{
      e.preventDefault();
      this.canvas.onpointermove = null;
    }

    this.canvas.onclick = e=>e.preventDefault();

    this.data = { buffer: null };

    this.loader = new Loader(this.audioCtx, this.initConfig.url, this.data);

    this.player = new Player(this.audioCtx, this.audioNode, this.data);

    this.drawer = new Drawer(this.canvas, this.ctx, this.data);

    this.drawdataprocessor = new DrawDataProcessor(this.audioCtx);

    await this.loader.load();
    this.width = this.data.buffer.duration * this.$store.getters.second_width;
    if(this.width > this.$store.getters.ruler_width){
      const state = this.$store.state;
      const result = Math.ceil(this.data.buffer.duration * state.bpm / 60 / state.rhythm[0] * 4 / state.rhythm[1]);
      this.$store.commit('number_of_bars', result);
    }
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
    width: {
      get: function(){return this._width;},
      set: function(_width){this._width = Math.round(_width);}
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
      return this.$store.getters.getTimeOfDistance(this.initStartPoint);
    },
    initEndTime(){
      return this.$store.getters.getTimeOfDistance(this.initEndPoint);
    },
    startTime(){
      return this.$store.getters.getTimeOfDistance(this.startPoint);
    },
    endTime(){
      return this.$store.getters.getTimeOfDistance(this.endPoint);
    },
    initDuration(){
      return this.$store.getters.getTimeOfDistance(this.diminished.left + this.width + this.diminished.right);
    },
    duration(){
      return this.$store.getters.getTimeOfDistance(this.width);
    }
  },
  watch: {
    bpm(newVal, oldVal){
      this.width *= newVal / oldVal;
    },
    beat_interval(newVal, oldVal){
      this.zoom(newVal, oldVal);
    },
    width(){
      this.$nextTick(function(){this.draw();});
    }
  },
  methods: {
    initDiminished(diminished={left: 0, right: 0}){
      this.diminished = {
        ...diminished,
        getData(){
          return {left: this.left, right: this.right};
        }
      };
      Object.defineProperties(this.diminished, {
        leftTime: {
          get: ()=>this.$store.getters.getTimeOfDistance(this.diminished.left)
        },
        rightTime: {
          get: ()=>this.$store.getters.getTimeOfDistance(this.diminished.right)
        }
      });
    },

    getTime(point){
      return this.$store.getters.getTimeOfDistance(point - this.initStartPoint);
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
      this.width *= ratio;
    },

    move(initX, e){
      this.x += e.offsetX - initX;
    },

    resizeProcess(init, tmp, which){
      let dif = Math.floor(tmp - init);
      if(-this.diminished[which] > dif){
        dif = -this.diminished[which];
      }
      if(which === "left"){this.x += dif;}
      this.diminished[which] += dif;
      this.width -= dif;
    },

    resize(initLeft, initRight, e){
      if(this.width <= 0) return;
      const left = e.offsetX;
      const right = this.width - left;

      if(initLeft <= 30){
        this.resizeProcess(initLeft, left, "left");
      }else if(initRight <= 30){
        this.resizeProcess(initRight, right, "right");
      }
    },

    downloadAudioFile(){
      const link = document.createElement('a');
      link.href = this.loader.url;
      link.download = "audio.wav";
      link.click();
    },

    async getDownloadData(folder, index){
      await fetch(this.loader.url)
      .then(res=>res.blob())
      .then(res=>folder.file(index + ".wav", res))
      .catch(console.error);

      return {
        startPoint: this.startPoint,
        diminished: this.diminished.getData()
      };
    },

    async getUploadData(){
      const base64 = await fetch(this.loader.url)
      .then(res=>res.blob())
      .then(res=>new Promise(resolve=>{
        const reader = new FileReader();
        reader.onload = ()=>resolve(reader.result);
        reader.readAsDataURL(res);
      }))
      .catch(console.error);

      return {
        startPoint: this.startPoint,
        diminished: this.diminished.getData(),
        base64    : base64
      };
    },

    createOfflineSource(offlineCtx, nextNode, startRecordingTime, stopRecordingTime){
      if(startRecordingTime > this.endTime) return;
      const source = offlineCtx.createBufferSource();
      source.buffer = this.data.buffer;
      source.connect(nextNode);
      
      //when: 録音を開始する時間, offset: このAudioCanvasの音声ファイルのどの時点から再生を始めるか, duration: どれくらいの時間録音するか
      let when, offset, duration;

      if(startRecordingTime < this.startTime){
        when = this.startTime - startRecordingTime;
        offset = this.diminished.leftTime;
        if(stopRecordingTime < this.endTime){
          duration = stopRecordingTime - this.startTime;
        }else{
          duration = this.duration;
        }
      }else{
        when = 0;
        offset = startRecordingTime - this.initStartTime;
        if(stopRecordingTime < this.endTime){
          duration = stopRecordingTime - startRecordingTime;
        }else{
          duration = this.endTime - startRecordingTime;
        }
      }

      source.start(when, offset, duration);
    }
  }
}
</script>
