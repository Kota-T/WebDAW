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
import WavHandler from '../../../../webaudio/WavHandler.js';
import { loadAudioBuffer } from '../../../../webaudio/webaudio.js';
import { Player, DrawDataProcessor, Drawer } from './AudioCanvas.js';

import ContextMenu from '../../../util/ContextMenu.vue';

export default {
  name: 'AudioCanvas',
  components: {
    ContextMenu
  },
  props: ['data', 'audioCtx', 'nextNode'],
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
    /*
    data: {
      startPoint: double,
      diminished: Object,
      url: objectURL | dataURL
    }
    */
    this.id = this.data.id;
    this.ctx = this.canvas.getContext('2d');
    this.x = this.data.startPoint;
    this.initDiminished(this.data.diminished);

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
      this.$emit('track-selected', e.shiftKey);

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

    this.audioBuffer = await loadAudioBuffer(this.audioCtx, this.data.url);

    this.player = new Player(this.audioCtx, this.nextNode, this.audioBuffer);

    this.drawer = new Drawer(this.canvas, this.ctx);

    this.drawdataprocessor = new DrawDataProcessor(this.audioCtx);

    this.width = this.audioBuffer.duration * this.$store.getters.second_width;
    if(this.width > this.$store.getters.ruler_width){
      this.$store.commit('number_of_bars', this.$store.getters.getNumberOfBarsFromDuration(this.audioBuffer.duration));
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
    decideCursor(x){
      if(x <= 30){
        this.styles.cursor = this.diminished.left === 0 ? 'e-resize' : 'ew-resize';
      }else if(this.width - x <= 30){
        this.styles.cursor = this.diminished.right === 0 ? 'w-resize' : 'ew-resize';
      }else{
        this.styles.cursor = 'grab';
      }
    },

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
          this.audioBuffer,
          this.getTime(this.startPoint),
          this.getTime(this.endPoint)
        )
      );
    },

    async zoom(newVal, oldVal){
      if(!this.audioBuffer){
        this.audioBuffer = await loadAudioBuffer(this.audioCtx, this.data.url);
      }
      const ratio = newVal / oldVal;
      this.diminished.left *= ratio;
      this.diminished.right *= ratio;
      this.x *= ratio;
      this.width *= ratio;
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

    downloadAudioFile(){
      const length = this.duration * this.audioCtx.sampleRate;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, length, this.audioCtx.sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = this.audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0, this.diminished.leftTime, this.duration);
      offlineCtx.startRendering().then(buffer=>{
        const url = WavHandler.AudioBuffer2WavFile(buffer);
        const link = document.createElement('a');
        link.href = url;
        link.download = "audio.wav";
        link.click();
      }).catch(console.error);
    },

    async getDownloadData(folder, index){
      await fetch(this.data.url)
      .then(res=>res.blob())
      .then(res=>folder.file(index + ".wav", res))
      .catch(console.error);

      return {
        startPoint: this.startPoint,
        diminished: this.diminished.getData()
      };
    },

    async getUploadData(){
      const url = await fetch(this.data.url)
      .then(res=>res.blob())
      .then(res=>new Promise(resolve=>{
        const reader = new FileReader();
        reader.onload = ()=>resolve(reader.result);
        reader.readAsDataURL(res);
      }))
      .catch(console.error);

      return {
        id: this.data.id,
        startPoint: this.startPoint,
        diminished: this.diminished.getData(),
        url       : url
      };
    },

    createOfflineSource(offlineCtx, nextNode, startRecordingTime, stopRecordingTime){
      if(startRecordingTime > this.endTime) return;
      const source = offlineCtx.createBufferSource();
      source.buffer = this.audioBuffer;
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
