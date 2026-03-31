export function decodeBraille(input, { tryReverse = false } = {}) {
  if (!input) return "";

  const chunks = input.match(/.{1,6}/g) || [];

  const MAP = {
    "100000":"a","110000":"b","100100":"c","100110":"d","100010":"e",
    "110100":"f","110110":"g","110010":"h","010100":"i","010110":"j",
    "101000":"k","111000":"l","101100":"m","101110":"n","101010":"o",
    "111100":"p","111110":"q","111010":"r","011100":"s","011110":"t",
    "101001":"u","111001":"v","010111":"w","101101":"x","101111":"y","101011":"z",

    
    "000001":"CAPITAL",
    "001111":"NUM",

    "010011":"+",
    "001100":"/",
   
    "001101":"=",
  };

  const NUM_MAP = { a:"1", b:"2", c:"3", d:"4", e:"5", f:"6", g:"7", h:"8", i:"9", j:"0" };

  let out = "";
  let numberMode = false;
  let capitalizeNext = false;
  const unknowns = new Set();

  for (let raw of chunks) {
        const cell = tryReverse ? raw.split("").reverse().join("") : raw;

   
    if (cell === "000001") { 
      capitalizeNext = true;
      numberMode = false; 
      continue;
    }
    if (cell === "001111") { 
      numberMode = true;
      capitalizeNext = false;
      continue;
    }

    
    const mapped = MAP[cell];
    if (mapped === undefined) {
      
      if (/[^01]/.test(raw)) { out += "?"; numberMode = false; capitalizeNext = false; continue; }
      unknowns.add(cell);
      out += "?";
      numberMode = false;
      capitalizeNext = false;
      continue;
    }

    
    if (numberMode) {
      if (NUM_MAP[mapped]) { out += NUM_MAP[mapped]; continue; }
      numberMode = false;
    }

   
    let ch = mapped;
    if (capitalizeNext && /^[a-z]$/.test(ch)) { ch = ch.toUpperCase(); capitalizeNext = false; }

    out += ch;

  }

  if (unknowns.size) {
    console.warn("Braille unknown patterns:", Array.from(unknowns));
  }

  return out;
}
