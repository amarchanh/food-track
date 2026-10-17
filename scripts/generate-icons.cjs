// Generates the PWA/app icons as plain PNGs with zero native dependencies.
// Draws a simple flame-in-a-circle mark (calorie tracking) by evaluating
// each pixel against a few geometric shapes, then hand-encodes a PNG.
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const BG = [22, 163, 74] // green-600
const FG = [255, 255, 255]

function dist(x, y, cx, cy) {
  return Math.hypot(x - cx, y - cy)
}

// A simple flame silhouette via a teardrop made of a circle + triangle blend,
// approximated with layered circles for smooth edges at any resolution.
function flameAlpha(nx, ny) {
  // nx, ny in [-1, 1], flame centered around (0, 0.05)
  const x = nx
  const y = ny - 0.05
  const body = dist(x, y * 0.9, 0, 0.15) < 0.52
  const tip = dist(x * 1.6, y + 0.35, 0, 0) < 0.3
  const waist = dist(x * 2.2, y - 0.05, 0, 0) < 0.22
  return (body || tip) && !(waist && y < -0.1)
}

function drawIcon(size, { padding = 0.12, maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4)
  const r = size / 2
  const pad = size * padding
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const cx = x - r + 0.5
      const cy = y - r + 0.5
      let inCircle = true
      if (!maskable) {
        inCircle = dist(cx, cy, 0, 0) <= r - 1
      }
      if (!inCircle) {
        pixels[idx] = 0
        pixels[idx + 1] = 0
        pixels[idx + 2] = 0
        pixels[idx + 3] = 0
        continue
      }
      pixels[idx] = BG[0]
      pixels[idx + 1] = BG[1]
      pixels[idx + 2] = BG[2]
      pixels[idx + 3] = 255

      const usable = r - pad
      const nx = cx / usable
      const ny = cy / usable
      if (Math.hypot(nx, ny) < 1.05 && flameAlpha(nx, ny)) {
        pixels[idx] = FG[0]
        pixels[idx + 1] = FG[1]
        pixels[idx + 2] = FG[2]
        pixels[idx + 3] = 255
      }
    }
  }
  return pixels
}

function crc32(buf) {
  let c
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[n] = c >>> 0
    }
    return t
  })())
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(size, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1)
    raw[rowStart] = 0 // filter: none
    pixels.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4)
  }
  const idatData = zlib.deflateSync(raw, { level: 9 })

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function writeIcon(file, size, opts) {
  const pixels = drawIcon(size, opts)
  const png = encodePng(size, pixels)
  fs.writeFileSync(file, png)
  console.log('wrote', file, `${size}x${size}`)
}

const outDir = path.join(__dirname, '..', 'public')
fs.mkdirSync(outDir, { recursive: true })

writeIcon(path.join(outDir, 'pwa-192.png'), 192)
writeIcon(path.join(outDir, 'pwa-512.png'), 512)
writeIcon(path.join(outDir, 'maskable-512.png'), 512, { maskable: true, padding: 0.24 })
writeIcon(path.join(outDir, 'apple-touch-icon.png'), 180, { maskable: true, padding: 0.16 })
writeIcon(path.join(outDir, 'favicon-32.png'), 32)
