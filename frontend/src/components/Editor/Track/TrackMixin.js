const TrackMixin = {
  props: {
    trackData: Object,
    pointer: Object
  },
  inject: ['socket'],
  emits: ['track-remove'],
  provide(){
    return {
      trackId: this.trackData.id
    }
  },
  data(){
    return {
      name: "",
      isSelected: true
    }
  },
  created(){
    this.id = this.trackData.id;
    this.component = this.trackData.component;
    this.name = this.trackData.name?.substring(this.trackData?.name.indexOf("_") + 1) || "新規トラック";
  },
  mounted(){
    this.trackData.canvases?.forEach(canvasData=>this.$refs.container.createCanvas(canvasData));
    this.$nextTick(async function(){
      if(this.socket.connected && this.trackData.send){
        this.socket.send({
          type: "addTrack",
          trackData: await this.getUploadData()
        });
      }
      this.select();
    });
  },
  watch: {
    name(newVal){
      if(this.socket.connected){
        this.socket.send({
          type: 'changeTrackName',
          trackId: this.id,
          value: newVal
        });
      }
    },
    isSelected(newVal){
      this.$refs.label.$refs.container.isSelected = newVal
    }
  },
  methods: {
    select(shiftKey=false){
      if(!shiftKey){
        this.$parent.tracks.forEach(track=>{
          track.isSelected = false;
        });
      }
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
    }
  }
}

export default TrackMixin;
