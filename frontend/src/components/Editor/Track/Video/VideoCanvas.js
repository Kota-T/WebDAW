import CanvasMixin from '../CanvasMixin.js';

export default {
  name: 'VideoCanvas',
  mixins: [CanvasMixin],
  async mounted(){
    this.downloadFile();
    this.dataVideo = document.createElement('video');
    this.dataVideo.playsInline = true;
    this.dataVideo.onerror = e=>console.error(e);
    this.dataVideo.src = this.canvasData.url;
    await this.seekSync(this.dataVideo, 7*24*60*1000);
    await this.seekSync(this.dataVideo, 0);
    this.sample_width = this.dataVideo.videoWidth * 120 / this.dataVideo.videoHeight;

    const leftTime  = this.canvasData.diminished?.leftTime || 0;
    const rightTime = this.canvasData.diminished?.rightTime || 0;
    this.width = (this.dataVideo.duration - leftTime - rightTime) * this.$store.getters.second_width;
    if(this.endPoint > this.$store.getters.ruler_width){
      this.$store.commit('project_duration', this.canvasData.startTime + this.dataVideo.duration);
    }

    this.showVideo = document.createElement('video');
    this.showVideo.style.position = "fixed";
    this.showVideo.style.top = "0";
    this.showVideo.style.zIndex = "10";
    this.showVideo.style.height = "110px";
    this.showVideo.src = this.canvasData.url;
    await this.seekSync(this.showVideo, 0);
  },
  methods: {
    async seekSync(video, time){
      video.currentTime = time;
      await new Promise(resolve => video.onseeked = resolve);
      video.onseeked = null;
    },

    async play(startPoint, onended){
      document.body.appendChild(this.showVideo);
      await this.seekSync(this.showVideo, this.getTime(startPoint));
      await this.showVideo.play();
      this.showVideo.onpause = ()=>{
        onended();
        document.body.removeChild(this.showVideo);
        this.showVideo.onpause = null;
      }
      this.playId = setTimeout(()=>this.showVideo.pause(), this.duration * 1000);
    },

    pause(){
      clearTimeout(this.playId);
      this.showVideo.pause();
    },

    async draw(){
      const seek_interval = this.sample_width / this.$store.getters.second_width;
      for(let i = 0; i < Math.ceil(this.width / this.sample_width); i++){
        await this.seekSync(this.dataVideo, seek_interval * i);
        this.ctx.drawImage(this.dataVideo, this.sample_width * i, 0, this.sample_width, 120);
      }
    },

    downloadFile(){
      const link = document.createElement('a');
      link.href = this.canvasData.url;
      link.download = "video.mp4";
      link.click();
    }
  }
}
