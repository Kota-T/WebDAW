export default class WavHandler{
  static AudioBuffer2WavFile(buffer, startTime, endTime){
    const url = WavHandler.writeWav(
      WavHandler.AudioBuffer2WavData(buffer, startTime, endTime),
      buffer.sampleRate
    );
    return url;
  }

  static AudioBuffer2WavData(buffer, startTime, endTime){
    const startIndex = Math.floor(startTime * buffer.sampleRate || 0);
    const endIndex   = Math.floor(endTime   * buffer.sampleRate || buffer.length);
    const dataLength = endIndex - startIndex;
    const left  = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const array = new Float32Array(dataLength * 2);
    for(let i = 0; i < dataLength; i++){
      array[i * 2] = left[i + startIndex];
      array[i * 2 + 1] = right[i + startIndex];
    }
    return array;
  }

  static writeWav(samples, sampleRate){
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    WavHandler.writeWavHead(view, samples.length, sampleRate);
    WavHandler.writeWavData(view, samples);

    const blob = new Blob([view], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    return url;
  }

  static writeWavHead(view, sample_length, sampleRate){
    const writeString = function (view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');  // RIFFヘッダ
    view.setUint32(4, 32 + sample_length * 2, true); // これ以降のファイルサイズ
    writeString(view, 8, 'WAVE'); // WAVEヘッダ
    writeString(view, 12, 'fmt '); // fmtチャンク
    view.setUint32(16, 16, true); // fmtチャンクのバイト数
    view.setUint16(20, 1, true); // フォーマットID
    view.setUint16(22, 2, true); // チャンネル数
    view.setUint32(24, sampleRate, true); // サンプリングレート
    view.setUint32(28, sampleRate * 2, true); // データ速度
    view.setUint16(32, 2, true); // ブロックサイズ
    view.setUint16(34, 16, true); // サンプルあたりのビット数
    writeString(view, 36, 'data'); // dataチャンク
    view.setUint32(40, sample_length * 2, true); // 波形データのバイト数
  }

  static writeWavData(view, samples){
    for (let i = 0, offset = 44; i < samples.length; i++ , offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }
}
