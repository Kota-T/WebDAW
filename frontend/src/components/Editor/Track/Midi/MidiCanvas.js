import CanvasMixin from '../CanvasMixin.js';

import { SingleNotePlayer } from '../../../../midi.js';

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
    const duration = this.midiDataArray.reduce((acc, midiData)=>{
      return Math.max(acc, midiData.when + midiData.duration);
    }, 0)
    this.initWidth(duration);
  },
  methods: {
    play(startPoint, onended){
      const startTime = startPoint / this.$store.getters.second_width;
      this.sourceNodeArray = this.midiDataArray.map(midiData=>{
        if(midiData.when + this.startTime < startTime) return;
        const player = new SingleNotePlayer(midiData.number, midiData.velocity, this.audioCtx, this.nextNode);
        player.start(midiData.when, midiData.duration);
        return player;
      });
    },

    pause(){
      this.sourceNodeArray.forEach(node => node && node.stop())
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
        const x = midiData.when * this.$store.getters.second_width;
        const y = (highest_note_number - midiData.number) * note_height;
        const width = midiData.duration * this.$store.getters.second_width;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, width, note_height);
      });
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
