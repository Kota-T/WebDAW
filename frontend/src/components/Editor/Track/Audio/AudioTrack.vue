<template>
  <teleport to="#label_field">
    <AudioTrackLabel
    :trackType="this.trackData.component"
    v-model:name="name"
    v-model:gain="gain"
    v-model:pan="pan"
    v-model:isSelected="isSelected"
    v-model:isMonitoring="isMonitoring"
    v-model:isMuted="isMuted"
    v-model:isSolo="isSolo"
    @track-select="select"
    @track-remove="$emit('track-remove')"
    ref="label"
    />
  </teleport>
  <teleport to="#ruler_layer">
    <AudioCanvasContainer
    :sourceNode="sourceNode"
    :nextNode="gainNode"
    @track-select="select"
    ref="container"
    />
  </teleport>
</template>

<script>
import TrackMixin from '../TrackMixin.js';
import AudioTrackLabel from './AudioTrackLabel.vue';
import AudioCanvasContainer from './AudioCanvasContainer.vue';

export default {
  name: 'AudioTrack',
  components: {
    AudioTrackLabel,
    AudioCanvasContainer
  },
  mixins: [TrackMixin],
  props: {
    sourceNode: Object
  },
  emits: ['track-solo'],
  data(){
    return {
      gain: this.trackData.gain || 0.5,
      pan: this.trackData.pan || 0,
      isMonitoring: false,
      isMuted: false,
      isSolo: true
    }
  },
  created(){
    const audioCtx = this.sourceNode.context;
    this.gainNode = audioCtx.createGain();
    this.pannerNode = audioCtx.createStereoPanner();
    this.muteNode = audioCtx.createGain();
    this.soloNode = audioCtx.createGain();
    this.gainNode
      .connect(this.pannerNode)
      .connect(this.muteNode)
      .connect(this.soloNode)
      .connect(audioCtx.destination);

    this.gainNode.gain.value = this.gain;
    this.pannerNode.pan.value = this.pan;
  },
  mounted(){
    this.isSolo = false;
  },
  unmounted(){
    try{
      this.sourceNode.disconnect(this.gainNode);
    }catch(e){}
    this.soloNode.disconnect();
  },
  watch: {
    gain(newVal){
      this.gainNode.gain.value = newVal
    },
    pan(newVal){
      this.pannerNode.pan.value = newVal
    },
    isMonitoring(newVal){
      if(newVal){
        this.sourceNode.connect(this.gainNode);
      }else{
        try{
          this.sourceNode.disconnect(this.gainNode);
        }catch(e){}
      }
    },
    isMuted(newVal){
      this.muteNode.gain.value = newVal ? 0 : 1
    },
    isSolo(newVal){
      this.$emit('track-solo');
    }
  },
  methods: {
    setSolo(value){
      this.soloNode.gain.value = value ? 1 : 0;
    },

    async getDownloadData(root, index){
      const name = index + "_" + this.name;
      return {
        component: this.trackData.component,
        name: name,
        gain: this.gain,
        pan : this.pan,
        canvases: await Promise.all(this.$refs.container.getDownloadData(root.folder(name), ".wav"))
      };
    },

    async getUploadData(){
      return {
        id: this.trackData.id,
        component: this.trackData.component,
        name: this.name,
        gain: this.gain,
        pan : this.pan,
        canvases: await Promise.all(this.$refs.container.getUploadData())
      };
    },

    createOffline(offlineCtx, startRecordingTime, stopRecordingTime){
      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = this.gain;
      const pannerNode = offlineCtx.createStereoPanner();
      pannerNode.pan.value = this.pan;
      gainNode.connect(pannerNode);
      pannerNode.connect(offlineCtx.destination);

      this.$refs.container.createOffline(gainNode, startRecordingTime, stopRecordingTime);
    }
  }
}
</script>
