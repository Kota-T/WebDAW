import CanvasMixin from '../CanvasMixin.js';

import { WavHandler, loadAudioBuffer, Player } from '../../../../audio.js';
import { DrawDataProcessor, Drawer } from './AudioCanvasFunctions.js';

export default {
  name: 'AudioCanvas',
  mixins: [CanvasMixin],
  props: ['audioCtx', 'nextNode'],
  async mounted(){
    this.audioBuffer = await loadAudioBuffer(this.audioCtx, this.canvasData.url);

    this.player = new Player(this.audioBuffer, this.nextNode);
    this.drawer = new Drawer();
    this.drawdataprocessor = new DrawDataProcessor();

    this.initWidth(this.audioBuffer.duration);
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
        this.canvas,
        this.ctx,
        this.drawdataprocessor.getDrawData(
          this.audioBuffer,
          this.getTime(this.startPoint),
          this.getTime(this.endPoint)
        )
      );
    },

    split(){
      const pointerX = this.pointer.x;
      if(this.startPoint < pointerX && pointerX < this.endPoint){
        const splitTime = this.getTime(pointerX);
        const former = {
          startTime: this.startTime,
          diminished: { leftTime: this.diminished.leftTime, rightTime: 0 },
          url: WavHandler.AudioBuffer2WavFile(this.audioBuffer, 0, splitTime)
        };
        const latter = {
          startTime: this.startTime + splitTime,
          diminished: { leftTime: 0, rightTime: this.diminished.rightTime },
          url: WavHandler.AudioBuffer2WavFile(this.audioBuffer, splitTime, this.initDuration)
        };
        this.$emit('canvas-split', { canvasId: this.id, former, latter });
      }
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
