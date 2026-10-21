/** Gemini Live expects 16 kHz mono 16-bit little-endian PCM. */
export const PCM_SAMPLE_RATE = 16000
export const PCM_MIME = `audio/pcm;rate=${PCM_SAMPLE_RATE}`

/** AudioWorklet that converts mic samples to Int16 PCM and posts ~100 ms chunks. */
const WORKLET_SOURCE = `
class PcmCapture extends AudioWorkletProcessor {
  constructor() { super(); this.buf = new Int16Array(${PCM_SAMPLE_RATE / 10}); this.n = 0; }
  process(inputs) {
    const ch = inputs[0][0];
    if (ch) for (let i = 0; i < ch.length; i++) {
      const s = Math.max(-1, Math.min(1, ch[i]));
      this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === this.buf.length) { this.port.postMessage(this.buf.buffer.slice(0)); this.n = 0; }
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCapture);
`

/** Wires a mic stream into a PCM worklet; `onChunk` receives base64 PCM. Returns the AudioContext (close it to stop). */
export async function startPcmCapture(stream: MediaStream, onChunk: (base64: string) => void) {
  const ctx = new AudioContext({ sampleRate: PCM_SAMPLE_RATE })
  const url = URL.createObjectURL(new Blob([WORKLET_SOURCE], { type: 'application/javascript' }))
  try {
    await ctx.audioWorklet.addModule(url)
  } finally {
    URL.revokeObjectURL(url)
  }
  // contexts created after an await can start suspended under autoplay rules
  if (ctx.state === 'suspended') await ctx.resume()
  const node = new AudioWorkletNode(ctx, 'pcm-capture')
  node.port.onmessage = (e: MessageEvent<ArrayBuffer>) => onChunk(toBase64(e.data))
  ctx.createMediaStreamSource(stream).connect(node)
  return ctx
}

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}
