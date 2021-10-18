const A4_FREQ = 440;
const A4_NUMBER = 69;

export function noteNumber2Freq(note_number){
  const dif = note_number - A4_NUMBER;
  const freq = Math.pow(2, dif / 12) * A4_FREQ;
  return freq;
}

export class SingleNotePlayer {
  /*
    interface MidiNote {
      number: number
      velocity: number
      when?: number
      duration?: number
    }
  */
  constructor(note_number, velocity, nextNode){
    this.note_number = note_number;
    this.velocity = velocity;
    this.nextNode = nextNode;
    this.audioCtx = this.nextNode.context;
  }

  start(when=0, duration, onended){
    this.oscNode = this.audioCtx.createOscillator();
    this.oscNode.frequency.value = noteNumber2Freq(this.note_number);
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = this.velocity;
    this.oscNode.connect(this.gainNode).connect(this.nextNode);
    this.oscNode.onended = () => {
      this.oscNode.disconnect();
      this.oscNode = null;
      this.gainNode.disconnect();
      this.gainNode = null;
      onended?.();
    }
    this.oscNode.start(this.audioCtx.currentTime + when);
    if(duration)
      this.stop(when + duration);
  }

  stop(when=0){
    if(!this.oscNode) return;
    const stopTime = this.audioCtx.currentTime + when;
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, stopTime);
    this.gainNode.gain.linearRampToValueAtTime(0, stopTime + 0.01);
    this.oscNode.stop(stopTime + 0.01);
  }
}

export class Player {
  constructor(midiNoteArray, nextNode){
    this.midiNoteArray = midiNoteArray;
    this.nextNode = nextNode;
  }

  play(when, offset, duration, onended){
    this.playerArray = this.midiNoteArray
      .filter(midiNote => offset <= midiNote.when && midiNote.when < offset + duration)
      .map(midiNote => {
        const player = new SingleNotePlayer(midiNote.number, midiNote.velocity, this.nextNode);
        player.start(when + midiNote.when - offset, midiNote.duration, () => {
          this.playerArray.splice(this.playerArray.indexOf(player), 1);
          if(!this.playerArray.length)
            onended?.();
        });
        return player;
      });
  }

  pause(){
    this.playerArray.forEach(player => player.stop())
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
    const startTime = Date.now();
    this.noteOnFn = e=>{
      this.noteBuffer.push({
        number: e.note.number,
        velocity: e.velocity,
        when: (Date.now() - startTime) / 1000
      });
    }
    this.noteOffFn = e=>{
      const note = this.noteBuffer.find(
        note => !note.duration && note.number === e.note.number
      );
      if(note)
        note.duration = (Date.now() - startTime) / 1000 - note.when;
    }
    this.midiInput.addListener('noteon', "all", this.noteOnFn);
    this.midiInput.addListener('noteoff', "all", this.noteOffFn);
    this.isRecording = true;
  }

  stop(){
    if(!this.isRecording){ return; }
    this.midiInput.removeListener('noteon', "all", this.noteOnFn);
    this.midiInput.removeListener('noteoff', "all", this.noteOffFn);
    const jsonStr = JSON.stringify(this.noteBuffer);
    this.noteBuffer = [];
    this.isRecording = false;
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.onstop(url);
  }
}
