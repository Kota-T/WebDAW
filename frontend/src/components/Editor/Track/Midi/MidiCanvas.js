import CanvasMixin from '../CanvasMixin.js';

import { string2DataUrl } from '../../../../util.js';
import { Player } from '../../../../midi.js';

export default {
  name: 'MidiCanvas',
  mixins: [CanvasMixin],
  props: {
    audioCtx: Object,
    nextNode: Object
  },
  async mounted(){
    this.midiDataArray = await fetch(this.canvasData.url)
    .then(res=>res.text())
    .then(text=>JSON.parse(text));
    this.player = new Player(this.midiDataArray, this.audioCtx, this.nextNode);
    const duration = this.midiDataArray.reduce((acc, midiData)=>{
      return Math.max(acc, midiData.when + midiData.duration);
    }, 0)
    this.initWidth(duration);
  },
  methods: {
    play(startPoint, onended){
      this.player.start(this.getTime(startPoint), this.getTime(this.endPoint), onended);
    },

    pause(){
      this.player.stop();
    },

    draw(){
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      const highest_note_number = this.midiDataArray.reduce((acc, midiData)=>{
        return Math.max(acc, midiData.number);
      }, 0);
      const lowest_note_number = this.midiDataArray.reduce((acc, midiData)=>{
        return Math.min(acc, midiData.number);
      }, 200);
      const note_height = this.canvas.height / (highest_note_number - lowest_note_number + 1);
      this.midiDataArray.forEach(midiData => {
        const x = midiData.when * this.$store.getters.second_width - this.diminished.left;
        const y = (highest_note_number - midiData.number) * note_height;
        const width = midiData.duration * this.$store.getters.second_width;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, width, note_height);
      });
    },

    split(){
      const pointer_x = this.$store.state.pointer_x;
      if(this.startPoint < pointer_x && pointer_x < this.endPoint){
        const splitTime = this.getTime(pointer_x);
        const formerDataArray = this.midiDataArray
          .filter(midiData => midiData.when < splitTime)
          .map(midiData => {
            if(midiData.when + midiData.duration > splitTime)
              midiData.duration = splitTime - midiData.when
            return midiData;
          });
        const latterDataArray = this.midiDataArray
          .filter(midiData => midiData.when >= splitTime)
          .map(midiData => {
            midiData.when -= splitTime;
            return midiData;
          });
        const former = {
          startTime: this.startTime,
          diminished: { leftTime: this.diminished.leftTime, rightTime: 0 },
          url: string2DataUrl(JSON.stringify(formerDataArray), 'application/json')
        };
        const latter = {
          startTime: this.startTime + splitTime,
          diminished: { leftTime: 0, rightTime: this.diminished.rightTime },
          url: string2DataUrl(JSON.stringify(latterDataArray), 'application/json')
        };
        this.$emit('canvas-split', { canvasId: this.id, former, latter });
      }
    },

    downloadFile(){
      const link = document.createElement('a');
      link.href = this.canvasData.url;
      link.download = "midi.json";
      link.click();
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
