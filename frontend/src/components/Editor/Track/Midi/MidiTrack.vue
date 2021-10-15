<template>
  <teleport to="#label_field">
    <AudioTrackLabel
    v-model:name="name"
    v-model:gainValue="gainValue"
    v-model:panValue="panValue"
    @track-select="select"
    @track-remove="$emit('track-remove')"
    @track-monitoring="toggleMonitoring"
    @track-muted="toggleMuted"
    @track-solo="$emit('track-solo')"
    ref="label"
    />
  </teleport>
  <teleport to="#ruler_layer">
    <MidiCanvasContainer
    :pointer="pointer"
    :audioCtx="audioCtx"
    :nextNode="gainNode"
    :midiInput="midiInput"
    @track-select="select"
    ref="container"
    />
  </teleport>
</template>

<script>
import { Player } from '../../../../midi.js';
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
      gainValue: 0.5,
      panValue: 0
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

    this.gainValue = this.trackData.gain || 0.5;
    this.panValue = this.trackData.pan || 0;

    const sourceNodeArray = [];

    this.midiInput.addListener('noteon', "all", e=>{
      if(this.isSelected){
        const player = new Player(e.note.number, e.velocity, this.audioCtx, this.gainNode);
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
  unmounted(){
    this.soloNode.disconnect();
  },
  watch: {
    gainValue(newVal){
      this.gainNode.gain.value = newVal
    },
    panValue(newVal){
      this.pannerNode.pan.value = newVal
    }
  },
  methods: {
    toggleMonitoring(newVal){
      if(newVal){
        this.sourceNode.connect(this.gainNode);
      }else{
        try{
          this.sourceNode.disconnect(this.gainNode);
        }catch(e){}
      }
    },

    toggleMuted(newVal){
      this.muteNode.gain.value = newVal ? 0 : 1
    },

    async getDownloadData(root, index){
      const name = index + "_" + this.name;
      return {
        component: "MidiTrack",
        name: name,
        gain: this.gainValue,
        pan : this.panValue,
        canvases: await Promise.all(this.$refs.container.getDownloadData(root.folder(name), ".wav"))
      };
    },

    async getUploadData(){
      return {
        id: this.id,
        component: "MidiTrack",
        name: this.name,
        gain: this.gainValue,
        pan : this.panValue,
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
