<template>
  <div
  class="canvas-container"
  @pointerdown="e=>$emit('track-select', e.shiftKey)"
  >
    <MidiDraftCanvas ref="draftCanvas"/>
    <MidiCanvas
    v-for="canvasData in canvasParams"
    :key="canvasData.id"
    :canvasData="canvasData"
    :audioCtx="audioCtx"
    :nextNode="nextNode"
    :pointer="pointer"
    :ref="setCanvasRef"
    @canvas-split="splitCanvas"
    @track-select="shiftKey=>$emit('track-select', shiftKey)"
    @canvas-remove="removeCanvasByUser(canvasData.id)"
    />
  </div>
</template>

<script>
import { MidiRecorder } from '../../../../midi.js';
import CanvasContainerMixin from '../CanvasContainerMixin.js';
import MidiDraftCanvas from './MidiDraftCanvas.js';
import MidiCanvas from './MidiCanvas.js';

export default {
  name: 'MidiCanvasContainer',
  components: {
    MidiDraftCanvas, MidiCanvas
  },
  mixins: [CanvasContainerMixin],
  props: ['midiInput'],
  methods: {
    initRecorder(){
      this.recorder = new MidiRecorder(this.midiInput);

      let startPoint;
      let recordingId;

      this.recorder.onstart = ()=>{
        startPoint = this.pointer.x;
        this.$refs.draftCanvas.show(startPoint);
        let loop = ()=>{
          this.$refs.draftCanvas.draw();
          recordingId = requestAnimationFrame(loop);
        }
        recordingId = requestAnimationFrame(loop);
      }

      this.recorder.onstop = url=>{
        cancelAnimationFrame(recordingId);
        this.createCanvasByUser({
          startTime: startPoint / this.$store.getters.second_width,
          url
        });
        this.$refs.draftCanvas.hide();
      }
    },

    createOffline(offlineCtx, nextNode, startRecordingTime, stopRecordingTime){
      this.canvases.forEach(audioCanvas=>audioCanvas.createOfflineSource(offlineCtx, nextNode, startRecordingTime, stopRecordingTime));
    }
  }
}
</script>
