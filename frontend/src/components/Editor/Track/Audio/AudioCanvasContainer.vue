<template>
  <div
  class="canvas-container"
  @pointerdown="e=>$emit('track-select', e.shiftKey)"
  >
    <AudioDraftCanvas :sourceNode="sourceNode" ref="draftCanvas"/>
    <AudioCanvas
    v-for="canvasData in canvasParams"
    :key="canvasData.id"
    :canvasData="canvasData"
    :nextNode="nextNode"
    :ref="setCanvasRef"
    @canvas-split="splitCanvas"
    @track-select="shiftKey=>$emit('track-select', shiftKey)"
    @canvas-remove="removeCanvasByUser(canvasData.id)"
    />
  </div>
</template>

<script>
import { AudioRecorder } from '../../../../audio.js';

import CanvasContainerMixin from '../CanvasContainerMixin.js';
import AudioDraftCanvas from './AudioDraftCanvas.js';
import AudioCanvas from './AudioCanvas.js';

export default {
  name: 'AudioCanvasContainer',
  components: {
    AudioDraftCanvas, AudioCanvas
  },
  mixins: [CanvasContainerMixin],
  props: {
    sourceNode: Object,
    nextNode: Object
  },
  methods: {
    initRecorder(){
      this.recorder = new AudioRecorder(this.sourceNode);

      let startPoint;
      let recordingId;

      this.recorder.onstart = ()=>{
        startPoint = this.$store.state.pointer_x;
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
