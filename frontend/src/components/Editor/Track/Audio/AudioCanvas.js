import CanvasMixin from '../CanvasMixin.js';

import WavHandler from '../../../../webaudio/WavHandler.js';
import { loadAudioBuffer, Player } from '../../../../webaudio/webaudio.js';
import { DrawDataProcessor, Drawer } from './AudioCanvasFunctions.js';

export default {
  name: 'AudioCanvas',
  mixins: [CanvasMixin],
  props: ['audioCtx', 'nextNode'],
  async mounted(){
    this.audioBuffer = await loadAudioBuffer(this.audioCtx, this.canvasData.url);

    this.player = new Player(this.audioCtx, this.nextNode, this.audioBuffer);
    this.drawer = new Drawer(this.canvas, this.ctx);
    this.drawdataprocessor = new DrawDataProcessor();

    const leftTime = this.canvasData.diminished?.leftTime || 0;
    const rightTime = this.canvasData.diminished?.rightTime || 0;
    this.width = (this.audioBuffer.duration - leftTime - rightTime) * this.$store.getters.second_width;
    if(this.endPoint > this.$store.getters.ruler_width){
      this.$store.commit('project_duration', this.canvasData.startTime + this.audioBuffer.duration);
    }
  },
  methods: {
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
          this.getTime(this.endPoint),
          this.audioCtx.sampleRate
        )
      );
    },

    downloadFile(){
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
