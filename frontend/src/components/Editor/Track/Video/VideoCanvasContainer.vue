<template>
  <div
  class="canvas-container"
  @pointerdown="e=>$emit('track-select', e.shiftKey)"
  >
    <VideoDraftCanvas ref="draftCanvas"/>
    <VideoCanvas
    v-for="canvasData in canvasParams"
    :key="canvasData.id"
    :canvasData="canvasData"
    :ref="setCanvasRef"
    @track-select="shiftKey=>$emit('track-select', shiftKey)"
    @canvas-remove="removeCanvasByUser(canvasData.id)"
    />
  </div>
</template>

<script>
import CanvasContainerMixin from '../CanvasContainerMixin.js';
import VideoDraftCanvas from './VideoDraftCanvas.js';
import VideoCanvas from './VideoCanvas.js';

export default {
  name: 'VideoCanvasContainer',
  components: {
    VideoDraftCanvas, VideoCanvas
  },
  mixins: [CanvasContainerMixin],
  props: ['videoStream'],
  methods: {
    initRecorder(){
      this.recorder = new MediaRecorder(this.videoStream);

      let startPoint;
      let recordingId;
      let chunks = [];

      this.recorder.onstart = () => {
        startPoint = this.pointer.x;
        this.$refs.draftCanvas.show(startPoint);
        let loop = ()=>{
          this.$refs.draftCanvas.draw();
          recordingId = requestAnimationFrame(loop);
        }
        recordingId = requestAnimationFrame(loop);
      }

      this.recorder.ondataavailable = e => chunks.push(e.data);

      this.recorder.onstop = async () => {
        cancelAnimationFrame(recordingId);
        const blob = new Blob(chunks);
        chunks = [];
        const transcodedBlob = await fetch(`${location.protocol}//${location.host}/transcode-video`, {
          method: 'POST',
          body: blob
        })
        .then(res=>res.blob());
        const transcodedUrl = URL.createObjectURL(transcodedBlob);
        this.createCanvasByUser({
          startTime: startPoint / this.$store.getters.second_width,
          url: transcodedUrl
        });
        this.$refs.draftCanvas.hide();
      }
    }
  }
}
</script>
