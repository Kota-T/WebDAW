const A4_FREQ = 440;
const A4_NUMBER = 69;

export function note2Freq(note){
  const { number } = note;
  const dif = number - A4_NUMBER;
  const freq = Math.pow(2, dif / 12) * A4_FREQ;
  return freq;
}

export class MidiRecorder {
  constructor(midiInput){
    this.midiInput = midiInput;
    this.noteBuffer = [];
    this.isRecording = false;
  }

  start(pointer, startTime){
    this.onstart();
    this.noteOnFn = e=>{
      this.noteBuffer.push({
        number: e.note,
        velocity: e.velocity,
        startTime: pointer.time - startTime
      });
    };
    this.noteOffFn = e=>{
      const note = this.noteBuffer.find(
        note => !note.endTime && note.number === e.note.number
      );
      note.endTime = pointer.time - startTime;
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
