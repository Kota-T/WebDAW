import CanvasMixin from '../CanvasMixin.js';

import { string2DataUrl } from '../../../../util.js';
import { Player } from '../../../../midi.js';

export default {
  name: 'MidiCanvas',
  mixins: [CanvasMixin],
  props: {
    nextNode: Object
  },
  async mounted(){
    this.midiNoteArray = await fetch(this.canvasData.url)
    .then(res=>res.text())
    .then(text=>JSON.parse(text));
    this.player = new Player(this.midiNoteArray, this.nextNode);
    const duration = this.midiNoteArray.reduce((acc, midiNote)=>{
      return Math.max(acc, midiNote.when + midiNote.duration);
    }, 0);
    this.initWidth(duration);
  },
  methods: {
    play(startPoint, onended){
      this.player.play(this.getTime(startPoint), this.getTime(this.endPoint), onended);
    },

    pause(){
      this.player.pause();
    },

    draw(){
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      const highest_note_number = this.midiNoteArray.reduce((acc, midiNote)=>{
        return Math.max(acc, midiNote.number);
      }, 0);
      const lowest_note_number = this.midiNoteArray.reduce((acc, midiNote)=>{
        return Math.min(acc, midiNote.number);
      }, 200);
      let note_height = this.canvas.height / (highest_note_number - lowest_note_number + 1);
      if(note_height > 20)
        note_height = 20
      this.midiNoteArray.forEach(midiNote => {
        const x = midiNote.when * this.$store.getters.second_width - this.diminished.left;
        const y = (highest_note_number - midiNote.number) * note_height;
        const width = midiNote.duration * this.$store.getters.second_width;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, width, note_height);
      });
    },

    split(){
      const pointer_x = this.$store.state.pointer_x;
      if(this.startPoint < pointer_x && pointer_x < this.endPoint){
        const splitTime = this.getTime(pointer_x);
        const formerDataArray = this.midiNoteArray
          .filter(midiNote => midiNote.when < splitTime)
          .map(midiNote => {
            if(midiNote.when + midiNote.duration > splitTime)
              midiNote.duration = splitTime - midiNote.when
            return midiNote;
          });
        const latterDataArray = this.midiNoteArray
          .filter(midiNote => midiNote.when >= splitTime)
          .map(midiNote => {
            midiNote.when -= splitTime;
            return midiNote;
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
