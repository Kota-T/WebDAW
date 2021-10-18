const A4_FREQ = 440;
const A4_NUMBER = 69;

export function noteNumber2Freq(note_number){
  const dif = note_number - A4_NUMBER;
  const freq = Math.pow(2, dif / 12) * A4_FREQ;
  return freq;
}

export class SingleNotePlayer {
  constructor(note_number, velocity, audioCtx, nextNode){
    this.note_number = note_number;
    this.velocity = velocity;
    this.audioCtx = audioCtx;
    this.nextNode = nextNode;
  }

  start(when=0, duration, onstop){
    this.playId = setTimeout(()=>{
      this.sourceNode = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();
      this.sourceNode.frequency.value = noteNumber2Freq(this.note_number);
      this.gainNode.gain.value = this.velocity;
      this.sourceNode.connect(this.gainNode).connect(this.nextNode);
      this.sourceNode.start();
      this.isPlaying = true;
      if(duration)
        this.stop(duration, onstop);
    }, when * 1000);
  }

  stop(when=0, onstop){
    setTimeout(()=>{
      if(!this.isPlaying){
        clearTimeout(this.playId);
        onstop?.();
        return;
      }
      const startTime = this.audioCtx.currentTime;
      const tmpVal = this.gainNode.gain.value;
      this.gainNode.gain.setValueAtTime(tmpVal, startTime);
      this.gainNode.gain.linearRampToValueAtTime(0, startTime + 0.01);
      setTimeout(()=>{
        this.sourceNode.stop();
        this.gainNode.disconnect();
        onstop?.();
      }, 10);
      this.isPlaying = false;
    }, when * 1000);
  }
}

export class Player {
  constructor(midiDataArray, audioCtx, nextNode){
    this.midiDataArray = midiDataArray
    this.audioCtx = audioCtx;
    this.nextNode = nextNode;
  }

  start(offset=0, duration, onended){
    if(!duration){
      const lastNote = this.midiDataArray[this.midiDataArray.length - 1];
      duration = lastNote.when + lastNote.duration
    }
    this.playerArray = this.midiDataArray.map(midiData=>{
      if(midiData.when > duration || midiData.when < offset) return;
      const player = new SingleNotePlayer(midiData.number, midiData.velocity, this.audioCtx, this.nextNode);
      player.start(midiData.when - offset, midiData.duration, ()=>{
        this.playerArray[this.playerArray.indexOf(player)] = null;
        if(this.playerArray.every(player=>!player))
          onended?.();
      });
      return player;
    });
  }

  stop(){
    this.playerArray.forEach(player => player && player.stop())
  }
}

export class MidiRecorder {
  constructor(midiInput){
    this.midiInput = midiInput;
    this.noteBuffer = [];
    this.isRecording = false;
  }

  start(){
    this.onstart();
    const startTime = Date.now()
    this.noteOnFn = e=>{
      this.noteBuffer.push({
        number: e.note.number,
        velocity: e.velocity,
        when: (Date.now() - startTime) / 1000
      });
    };
    this.noteOffFn = e=>{
      const note = this.noteBuffer.find(
        note => !note.duration && note.number === e.note.number
      );
      if(note)
        note.duration = (Date.now() - startTime) / 1000 - note.when;
    };
    this.midiInput.addListener('noteon', "all", this.noteOnFn);
    this.midiInput.addListener('noteoff', "all", this.noteOffFn);
    this.isRecording = true;
  }

  stop(){
    if(!this.isRecording){ return; }
    this.midiInput.removeListener('noteon', "all", this.noteOnFn);
    this.midiInput.removeListener('noteoff', "all", this.noteOffFn);
    this.isRecording = false;
    const jsonStr = JSON.stringify(this.noteBuffer);
    this.noteBuffer = [];
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.onstop(url);
  }
}
