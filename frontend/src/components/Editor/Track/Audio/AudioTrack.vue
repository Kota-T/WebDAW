<template>
  <teleport to="#label_field">
    <AudioTrackLabel
    :gainNode="gainNode"
    :pannerNode="pannerNode"
    :muteNode="muteNode"
    @track-select="select"
    @track-solo="$emit('track-solo')"
    @track-remove="$emit('track-remove')"
    ref="label"
    />
  </teleport>
  <teleport to="#ruler_layer">
    <AudioCanvasContainer
    :pointer="pointer"
    :audioCtx="audioCtx"
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
  props: ['audioCtx', 'sourceNode'],
  emits: ['track-solo'],
  created(){
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.5;
    this.pannerNode = this.audioCtx.createStereoPanner();
    this.muteNode = this.audioCtx.createGain();
    this.soloNode = this.audioCtx.createGain();
    this.gainNode
      .connect(this.pannerNode)
      .connect(this.muteNode)
      .connect(this.soloNode)
      .connect(this.audioCtx.destination);
  },
  mounted(){
    this.gain = this.trackData.gain || 0.5;
    this.pan = this.trackData.pan || 0;
    this.$watch('isMonitoring', value=>{
      if(value){
        this.sourceNode.connect(this.gainNode);
      }else{
        try{
          this.sourceNode.disconnect(this.gainNode);
        }catch(e){}
      }
    });
  },
  unmounted(){
    try{
      this.sourceNode.disconnect(this.gainNode);
    }catch(e){}
    this.soloNode.disconnect();
  },
  computed: {
    gain: {
      get(){
        return this.gainNode.gain.value;
      },
      set(value){
        this.$refs.label.gainValue = value;
      }
    },
    pan: {
      get(){
        return this.pannerNode.pan.value;
      },
      set(value){
        this.$refs.label.panValue = value;
      }
    },
    isMonitoring: {
      get(){
        return this.$refs.label.isMonitoring;
      },
      set(value){
        this.$refs.label.isMonitoring = value;
      }
    },
    isSolo(){
      return this.$refs.label.isSolo;
    }
  },
  methods: {
    async getDownloadData(root, index){
      const name = index + "_" + this.name;
      return {
        component: "AudioTrack",
        name: name,
        gain: this.gain,
        pan : this.pan,
        canvases: await Promise.all(this.$refs.container.getDownloadData(root.folder(name), ".wav"))
      };
    },

    async getUploadData(){
      return {
        id: this.id,
        component: "AudioTrack",
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

      this.$refs.container.createOffline(offlineCtx, gainNode, startRecordingTime, stopRecordingTime);
    }
  }
}
</script>
