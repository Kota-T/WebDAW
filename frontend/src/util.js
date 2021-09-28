export function dataUrl2Url(dataUrl, mimetype){
  const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
  return base642Url(base64, mimeType);
}

export function base642Url(base64, mimeType){
  const byteString = atob(base64);
  const content = new Uint8Array(byteString.length);
  for(let i = 0; i < byteString.length; i++){
    content[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  return url;
}
