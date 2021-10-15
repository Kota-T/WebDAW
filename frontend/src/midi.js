const A4_FREQ = 440;
const A4_NUMBER = 69;

export function noteNumber2Freq(note_number){
  const dif = note_number - A4_NUMBER;
  const freq = Math.pow(2, dif / 12) * A4_FREQ;
  return freq;
}

export class Player {
  /*
  interface Note {
    number: number
    velocity: number
    duration: number
  }
  */

  constructor(note_number, velocity, audioCtx, nextNode){
    this.note_number = note_number;
    this.velocity = velocity;
    this.audioCtx = audioCtx;
    this.nextNode = nextNode;
  }

  start(when=0, duration){
    setTimeout(()=>{
      this.sourceNode = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();
      this.sourceNode.frequency.value = noteNumber2Freq(this.note_number);
      this.gainNode.gain.value = this.velocity;
      this.sourceNode.connect(this.gainNode).connect(this.nextNode);
      this.sourceNode.start();
      this.isPlaying = true;
      if(duration)
        this.stop(duration);
    }, when * 1000);
  }

  stop(when=0){
    if(!this.isPlaying) return;
    setTimeout(()=>{
      const startTime = this.audioCtx.currentTime;
      const tmpVal = this.gainNode.gain.value;
      this.gainNode.gain.setValueAtTime(tmpVal, startTime);
      this.gainNode.gain.linearRampToValueAtTime(0, startTime + 0.01);
      setTimeout(()=>{
        this.sourceNode.stop();
        this.gainNode.disconnect();
      }, 10);
      this.isPlaying = false;
    }, when * 1000);
  }
}

export class MidiRecorder {
  constructor(midiInput, pointer){
    this.midiInput = midiInput;
    this.pointer = pointer;
    this.noteBuffer = [];
    this.isRecording = false;
  }

  start(){
    const startTime = this.onstart();
    this.noteOnFn = e=>{
      this.noteBuffer.push({
        number: e.note.number,
        velocity: e.velocity,
        when: this.pointer.time - startTime
      });
    };
    this.noteOffFn = e=>{
      const note = this.noteBuffer.find(
        note => !note.duration && note.number === e.note.number
      );
      if(note)
        note.duration = this.pointer.time - startTime - note.when;
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
