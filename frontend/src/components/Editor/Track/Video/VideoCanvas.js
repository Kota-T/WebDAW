import { base642Url } from '../../../../util.js';
import CanvasMixin from '../CanvasMixin.js';

export default {
  name: 'VideoCanvas',
  mixins: [CanvasMixin],
  async mounted(){
    this.dataVideo = document.createElement('video');
    this.dataVideo.src = this.canvasData.url;
    await this.seekSync(this.dataVideo, 7*24*60*1000);
    await this.seekSync(this.dataVideo, 0);
    this.sample_width = this.dataVideo.videoWidth * 120 / this.dataVideo.videoHeight;

    this.initWidth(this.dataVideo.duration);

    this.showVideo = document.createElement('video');
    this.showVideo.style.position = "fixed";
    this.showVideo.style.top = "0";
    this.showVideo.style.zIndex = "10";
    this.showVideo.style.height = "110px";
    this.showVideo.src = this.canvasData.url;
    await this.seekSync(this.showVideo, 0);
  },
  unmounted(){
    this.showVideo.onpause = null;
    this.showVideo.pause();
    this.showVideo.removeAttribute('src');
    this.showVideo.remove();
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
        await this.seekSync(this.dataVideo, this.diminished.leftTime + seek_interval * i);
        this.ctx.drawImage(this.dataVideo, this.sample_width * i, 0, this.sample_width, 120);
      }
    },

    async split(){
      const pointer_x = this.$store.state.pointer_x;
      if(this.startPoint < pointer_x && pointer_x < this.endPoint){
        const splitTime = this.getTime(pointer_x);

        const base64 = await fetch(this.canvasData.url)
        .then(res=>res.blob())
        .then(res=>new Promise(resolve=>{
          const reader = new FileReader();
          reader.onload = ()=>resolve(reader.result.split(',')[1])
          reader.readAsDataURL(res);
        }))
        .catch(console.error);

        const resJson = await fetch(`${location.protocol}//${location.host}/split-video`, {
          method: 'POST',
          body: JSON.stringify({ splitTime, base64 })
        })
        .then(res=>res.json());

        const former = {
          startTime: this.startTime,
          diminished: { leftTime: this.diminished.leftTime, rightTime: 0 },
          url: base642Url(resJson.former, 'video/webm;codecs=vp9')
        };
        const latter = {
          startTime: this.startTime + splitTime,
          diminished: { leftTime: 0, rightTime: this.diminished.rightTime },
          url: base642Url(resJson.latter, 'video/webm;codecs=vp9')
        };
        this.$emit('canvas-split', { canvasId: this.id, former, latter });
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
