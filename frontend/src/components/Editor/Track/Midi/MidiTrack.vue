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
    <MidiCanvasContainer
    :audioCtx="audioCtx"
    :nextNode="gainNode"
    :midiInput="midiInput"
    @track-select="select"
    ref="container"
    />
  </teleport>
</template>

<script>
import { SingleNotePlayer } from '../../../../midi.js';
import TrackMixin from '../TrackMixin.js';
import AudioTrackLabel from '../Audio/AudioTrackLabel.vue';
import MidiCanvasContainer from './MidiCanvasContainer.vue';

export default {
  name: 'MidiTrack',
  components: {
    AudioTrackLabel, MidiCanvasContainer
  },
  mixins: [TrackMixin],
  props: {
    audioCtx: Object,
    midiInput: Object
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

    this.gainNode.gain.value = this.gain;
    this.pannerNode.pan.value = this.pan;

    const sourceNodeArray = [];

    this.midiInput.addListener('noteon', "all", e=>{
      if(this.isSelected){
        const player = new SingleNotePlayer(e.note.number, e.velocity, this.audioCtx, this.gainNode);
        player.start()
        sourceNodeArray.push(player);
      }
    });

    this.midiInput.addListener('noteoff', "all", e=>{
      sourceNodeArray
      .filter(node => node.note_number === e.note.number)
      .forEach(node=>{
        node.stop();
        sourceNodeArray.splice(sourceNodeArray.indexOf(node), 1);
      });
    });
  },
  mounted(){
    this.isSolo = false;
  },
  unmounted(){
    this.soloNode.disconnect();
  },
  watch: {
    gain(newVal){
      this.gainNode.gain.value = newVal
    },
    pan(newVal){
      this.pannerNode.pan.value = newVal
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

      this.$refs.container.createOffline(offlineCtx, gainNode, startRecordingTime, stopRecordingTime);
    }
  }
}
</script>
