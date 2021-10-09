import CanvasMixin from '../CanvasMixin.js';

export default {
  name: 'MidiCanvas',
  mixins: [CanvasMixin],
  props: ['audioCtx', 'nextNode'],
  async mounted(){
    const json = await fetch(this.canvasData.url)
    .then(res=>res.text())
    .then(text=>JSON.parse(text));
    this.initWidth();
  },
  methods: {
    play(startPoint, onended){
    },

    pause(){
    },

    draw(){
    },

    split(){
    },

    downloadFile(){
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
