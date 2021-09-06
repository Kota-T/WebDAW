<template>
  <teleport to="#label_field">
    <TrackLabel
    :gainNode="gainNode"
    :pannerNode="pannerNode"
    :muteNode="muteNode"
    ref="label"
    @track-selected="select"
    @track-remove="$emit('track-remove')"
    />
  </teleport>
  <teleport to="#audio_field">
    <TrackAudioContainer
    :audioCtx="audioCtx"
    :audioNode="gainNode"
    :stream="stream"
    :pointer="pointer"
    ref="container"
    @track-selected="select"
    />
  </teleport>
</template>

<script>
import TrackLabel from './TrackLabel/TrackLabel.vue';
import TrackAudioContainer from './TrackAudio/TrackAudioContainer.vue';

export default {
  name: 'Track',
  components: {
    TrackLabel, TrackAudioContainer
  },
  props: ['data', 'audioCtx', 'stream', 'pointer'],
  emits: ['track-remove'],
  data(){
    return {
      gainNode: null,
      pannerNode: null
    }
  },
  created(){
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.5;
    this.pannerNode = this.audioCtx.createStereoPanner();
    this.muteNode = this.audioCtx.createGain();
    this.gainNode.connect(this.pannerNode).connect(this.muteNode).connect(this.audioCtx.destination);
  },
  mounted(){
    this.name = this.data.name?.substring(this.data?.name.indexOf("_") + 1) || "新規トラック";
    this.gain = this.data.gain || 0.5;
    this.pan = this.data.pan || 0;
    this.data.audioStack?.forEach(elem=>this.$refs.container.createAudioCanvas(elem));
  },
  computed: {
    name: {
      get: function(){
        return this.$refs.label.$refs.trackName.value;
      },
      set: function(value){
        this.$refs.label.$refs.trackName.value = value;
      },
    },
    gain: {
      get: function(){
        return this.gainNode.gain.value;
      },
      set: function(value){
        this.$refs.label.$refs.trackSlider.gainValue = value;
      }
    },
    pan: {
      get: function(){
        return this.pannerNode.pan.value;
      },
      set: function(value){
        this.$refs.label.$refs.trackSlider.panValue = value;
      }
    },
    isSelected: {
      get: function(){
        return this.$refs.label.isSelected;
      },
      set: function(value){
        this.$refs.label.isSelected = value;
      }
    }
  },
  methods: {
    select(){
      this.$parent.tracks.forEach(track=>track.isSelected = false);
      this.isSelected = true;
    },

    startRecording(){
      this.$refs.container.startRecording();
    },

    stopRecording(){
      this.$refs.container.stopRecording();
    },

    play(){
      this.$refs.container.play();
    },

    pause(){
      this.$refs.container.pause();
    },

    async getDownloadData(root, index){
      const name = index + "_" + this.name;
      return {
        name: name,
        gain: this.gain,
        pan : this.pan,
        audioStack: await Promise.all(this.$refs.container.getDownloadData(root.folder(name)))
      };
    },

    async getUploadData(){
      return {
        name: this.name,
        gain: this.gain,
        pan : this.pan,
        audioStack: await Promise.all(this.$refs.container.getUploadData())
      };
    },

    createOffline(offlineCtx, start_time, stop_time){
      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = this.gain;
      const pannerNode = offlineCtx.createStereoPanner();
      pannerNode.pan.value = this.pan;
      gainNode.connect(pannerNode);
      pannerNode.connect(offlineCtx.destination);

      this.$refs.container.createOffline(offlineCtx, gainNode, start_time, stop_time);
    }
  }
}
</script>
