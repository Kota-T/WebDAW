<template>
  <teleport to="#label_field">
    <VideoTrackLabel
    @track-select="select"
    @track-remove="$emit('track-remove')"
    ref="label"
    />
  </teleport>
  <teleport to="#ruler_layer">
    <VideoCanvasContainer
    :pointer="pointer"
    :videoStream="videoStream"
    @track-select="select"
    ref="container"
    />
  </teleport>
</template>

<script>
import TrackMixin from '../TrackMixin.js';
import VideoTrackLabel from './VideoTrackLabel.vue';
import VideoCanvasContainer from './VideoCanvasContainer.vue';

export default {
  name: 'VideoTrack',
  components: {
    VideoTrackLabel,
    VideoCanvasContainer
  },
  mixins: [TrackMixin],
  props: ['videoStream'],
  methods: {
    async getDownloadData(root, index){
      const name = index + "_" + this.name;
      return {
        component: "VideoTrack",
        name: name,
        canvases: await Promise.all(this.$refs.container.getDownloadData(root.folder(name), ".webm"))
      };
    },

    async getUploadData(){
      return {
        id: this.id,
        component: "VideoTrack",
        name: this.name,
        canvases: await Promise.all(this.$refs.container.getUploadData("video/webm"))
      };
    }
  }
}
</script>
