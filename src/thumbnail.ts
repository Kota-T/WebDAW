import html2canvas from 'html2canvas'

const THUMBNAIL_RATIO = 9 / 16
const THUMBNAIL_WIDTH = 270
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * THUMBNAIL_RATIO

export async function clipThumbnail(): Promise<string> {
  const canvas = await html2canvas(document.body)
  const clipped = document.createElement('canvas')
  clipped.width = THUMBNAIL_WIDTH
  clipped.height = THUMBNAIL_HEIGHT
  const clippedCtx = clipped.getContext('2d')
  clippedCtx.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    canvas.width * THUMBNAIL_RATIO,
    0,
    0,
    clipped.width,
    clipped.height
  )
  return clipped.toDataURL()
}
