// uuencode / uudecode of strings, without Node's Buffer (browser friendly).
// The output is identical to the former "uuencode" package, so characters saved before stay readable.

const LINE_BYTES = 45 // Bytes encoded on each line
const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * uuencode a string.
 * @param  {String} text The text (UTF-8) to encode.
 * @return {String}      The encoded text.
 */
export function encode (text) {
  const input = encoder.encode(text)
  let result = ''

  for (let start = 0; start < input.length; start += LINE_BYTES) {
    const count = Math.min(LINE_BYTES, input.length - start)
    result += String.fromCharCode((count & 0x3f) + 32)

    for (let i = start; i < start + count; i += 3) {
      // Bytes after the end of the input count as 0
      const b1 = input[i]
      const b2 = input[i + 1] || 0
      const b3 = input[i + 2] || 0
      result += String.fromCharCode(
        ((b1 >>> 2) & 0x3f) + 32,
        (((b1 << 4) & 0x30) | ((b2 >>> 4) & 0xf)) + 32,
        (((b2 << 2) & 0x3c) | ((b3 >>> 6) & 0x3)) + 32,
        (b3 & 0x3f) + 32
      )
    }
    result += '\n'
  }

  return result
}

/**
 * uudecode a string.
 * @param  {String} text The encoded text.
 * @return {String}      The decoded text (UTF-8).
 * @throws {String}      'Invalid Data' when a line announces more than 45 bytes.
 */
export function decode (text) {
  const input = encoder.encode(text)
  const output = new Uint8Array(input.length)
  let inIndex = 0
  let outIndex = 0
  let total = 0
  let stop = false

  while (!stop && inIndex < input.length) {
    let n = (input[inIndex++] - 32) & 0x3f
    if (n > LINE_BYTES) throw 'Invalid Data'
    if (n < LINE_BYTES) stop = true
    total += n

    for (; n > 0; n -= 3) {
      // Characters after the end of the input count as 0 (same as the former package)
      const c1 = (input[inIndex] - 32) & 0x3f
      const c2 = (input[inIndex + 1] - 32) & 0x3f
      const c3 = (input[inIndex + 2] - 32) & 0x3f
      const c4 = (input[inIndex + 3] - 32) & 0x3f
      output[outIndex] = ((c1 << 2) | (c2 >> 4)) & 0xff
      output[outIndex + 1] = ((c2 << 4) | (c3 >> 2)) & 0xff
      output[outIndex + 2] = ((c3 << 6) | c4) & 0xff
      outIndex += 3
      inIndex += 4
    }
    inIndex++ // Line feed
  }

  return decoder.decode(output.subarray(0, total))
}

export default { encode, decode }
