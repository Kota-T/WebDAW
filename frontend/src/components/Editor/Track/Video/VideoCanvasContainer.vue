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
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

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
        console.log(blob);
        chunks = [];
        const ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load();
        ffmpeg.FS('writeFile', 'recorded.mp4', await fetchFile(blob));
        await ffmpeg.run('-i', 'recorded.mp4',  'transcoded.mp4');
        const data = ffmpeg.FS('readFile', 'transcoded.mp4');
        const transcodedBlob = new Blob([data.buffer], { type: 'video/mp4' });
        console.log(transcodedBlob);
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
