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
    <MidiCanvasContainer
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
import { note2Freq } from '../../../../midi.js';
import TrackMixin from '../TrackMixin.js';
import AudioTrackLabel from '../Audio/AudioTrackLabel.vue';
import MidiCanvasContainer from './MidiCanvasContainer.vue';

export default {
  name: 'MidiTrack',
  components: {
    AudioTrackLabel
  },
  mixins: [TrackMixin],
  props: ['audioCtx', 'midiInput'],
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

    this.sourceNodeBuffer = [];

    this.midiInput.addListener('noteon', "all", e=>{
      if(!this.isSelected) return;
      const sourceNode = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      sourceNode.frequency.value = note2Freq(e.note);
      gainNode.gain.value = e.velocity;
      this.sourceNodeBuffer.push({note: e.note, sourceNode, gainNode});
      sourceNode.connect(gainNode).connect(this.gainNode);
      sourceNode.start();
    });

    this.midiInput.addListener('noteoff', "all", e=>{
      this.sourceNodeBuffer
      .filter(obj => obj.note.number === e.note.number)
      .forEach(async obj=>{
        const startTime = this.audioCtx.currentTime;
        const tmpVal = obj.gainNode.gain.value;
        obj.gainNode.gain.setValueAtTime(tmpVal, startTime);
        obj.gainNode.gain.linearRampToValueAtTime(0, startTime + 0.01);
        await new Promise(resolve=>setTimeout(()=>resolve(), 10));
        obj.sourceNode.stop();
        obj.gainNode.disconnect();
        const index = this.sourceNodeBuffer.indexOf(obj);
        this.sourceNodeBuffer.splice(index, 1);
      });
    });
  },
  mounted(){
    this.gain = this.trackData.gain || 0.5;
    this.pan = this.trackData.pan || 0;
  },
  unmounted(){
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
    isSolo(){
      return this.$refs.label.isSolo;
    }
  },
  methods: {
    async getDownloadData(root, index){
      const name = index + "_" + this.name;
      return {
        component: "MidiTrack",
        name: name,
        gain: this.gain,
        pan : this.pan,
        canvases: await Promise.all(this.$refs.container.getDownloadData(root.folder(name), ".wav"))
      };
    },

    async getUploadData(){
      return {
        id: this.id,
        component: "MidiTrack",
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
