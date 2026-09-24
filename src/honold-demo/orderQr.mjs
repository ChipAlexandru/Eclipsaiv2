const VERSION = 4;
const SIZE = 17 + VERSION * 4;
const DATA_CODEWORDS = 80;
const ECC_CODEWORDS = 20;

function gfMultiply(x, y) {
  let result = 0;
  for (let i = 7; i >= 0; i -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    if (((y >>> i) & 1) !== 0) result ^= x;
  }
  return result;
}

function reedSolomonDivisor(degree) {
  const result = Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 2);
  }
  return result;
}

function reedSolomonRemainder(data, divisor) {
  const result = Array(divisor.length).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift();
    result.push(0);
    for (let i = 0; i < result.length; i += 1) result[i] ^= gfMultiply(divisor[i], factor);
  }
  return result;
}

function appendBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
}

function dataCodewords(text) {
  const bytes = [...new TextEncoder().encode(text)];
  if (bytes.length > 78) throw new Error("Honold order identity is too long for its QR code.");
  const bits = [];
  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const result = [];
  for (let i = 0; i < bits.length; i += 8) result.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
  for (let pad = 0xec; result.length < DATA_CODEWORDS; pad ^= 0xec ^ 0x11) result.push(pad);
  return result;
}

export function qrMatrix(text) {
  const data = dataCodewords(text);
  const codewords = [...data, ...reedSolomonRemainder(data, reedSolomonDivisor(ECC_CODEWORDS))];
  const modules = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const functions = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const setFunction = (x, y, black) => {
    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) { modules[y][x] = black; functions[y][x] = true; }
  };
  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy += 1) for (let dx = -4; dx <= 4; dx += 1) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setFunction(cx + dx, cy + dy, distance !== 2 && distance !== 4);
    }
  };
  finder(3, 3); finder(SIZE - 4, 3); finder(3, SIZE - 4);
  for (let i = 0; i < SIZE; i += 1) {
    if (!functions[6][i]) setFunction(i, 6, i % 2 === 0);
    if (!functions[i][6]) setFunction(6, i, i % 2 === 0);
  }
  for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) {
    setFunction(26 + dx, 26 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  const formatData = 0b01000;
  let remainder = formatData;
  for (let i = 0; i < 10; i += 1) remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537);
  const formatBits = ((formatData << 10) | remainder) ^ 0x5412;
  const formatBit = (index) => ((formatBits >>> index) & 1) !== 0;
  for (let i = 0; i <= 5; i += 1) setFunction(8, i, formatBit(i));
  setFunction(8, 7, formatBit(6)); setFunction(8, 8, formatBit(7)); setFunction(7, 8, formatBit(8));
  for (let i = 9; i < 15; i += 1) setFunction(14 - i, 8, formatBit(i));
  for (let i = 0; i < 8; i += 1) setFunction(SIZE - 1 - i, 8, formatBit(i));
  for (let i = 8; i < 15; i += 1) setFunction(8, SIZE - 15 + i, formatBit(i));
  setFunction(8, SIZE - 8, true);
  let bitIndex = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < SIZE; vert += 1) {
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? SIZE - 1 - vert : vert;
      for (let column = 0; column < 2; column += 1) {
        const x = right - column;
        if (functions[y][x]) continue;
        const bit = bitIndex < codewords.length * 8 ? ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) !== 0 : false;
        modules[y][x] = bit !== ((x + y) % 2 === 0);
        bitIndex += 1;
      }
    }
  }
  return modules;
}

export function orderIdentity(order) {
  return `HONOLD|${order.orderId || order.approvalId}|${order.pickupCode}|${order.branchId}|${order.slotId}`;
}
