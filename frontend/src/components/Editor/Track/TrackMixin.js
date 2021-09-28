const TrackMixin = {
  props: ['trackData', 'pointer'],
  inject: ['socket'],
  emits: ['track-remove'],
  provide(){
    return {
      trackId: this.trackData.id
    }
  },
  created(){
    this.id = this.trackData.id;
    this.component = this.trackData.component;
  },
  mounted(){
    this.name = this.trackData.name?.substring(this.trackData?.name.indexOf("_") + 1) || "新規トラック";
    this.trackData.canvases?.forEach(canvasData=>this.$refs.container.createCanvas(canvasData));
    this.$watch('name', newVal=>{
      if(this.socket.connected){
        this.socket.send({
          type: 'changeTrackName',
          trackId: this.id,
          value: newVal
        });
      }
    });
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
  computed: {
    name: {
      get(){
        return this.$refs.label.$refs.trackName.value;
      },
      set(value){
        this.$refs.label.$refs.trackName.value = value;
      },
    },
    isSelected: {
      get(){
        return this.$refs.label.isSelected;
      },
      set(value){
        this.$refs.label.isSelected = value;
      }
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
