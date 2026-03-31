import fs from "fs";
import { decodeBase64 } from "./base64.mjs";
import { decodeBraille } from "./braille.mjs";

// paste your brailleText (from decodeBraille) or base64Str
const base64Str = "anh1980Rdwp5971OZWp19857YnlkdSBldiBzZXR197PldHFvLApqZSBjcWF197P44SBieWpqYnUgcmtqamVkIGlqcW8uCnJraiBteHVkIHkgaHFkIHlqLCBteHFqIHEgdmh5438qLApqeHUgaXNodXVkIG11ZGogdHFoYSwgeWogbXFpZCdqIGh5438qIQoKbXh118Ug..."; // use full string

function applyRot(s, shift) {
  return s.split("").map(ch => {
    if (ch >= "a" && ch <= "z") {
      return String.fromCharCode(((ch.charCodeAt(0)-97 - shift + 26) % 26) + 97);
    }
    if (ch >= "A" && ch <= "Z") {
      return String.fromCharCode(((ch.charCodeAt(0)-65 - shift + 26) % 26) + 65);
    }
    return ch;
  }).join("");
}

function scoreEnglish(s) {
  // crude scoring: count common words
  const words = s.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (!words.length) return 0;
  const common = ["the","and","that","this","is","it","to","a","of","in","for","with","on","as","was","are","i","you","be","not"];
  let score = 0;
  for (const w of words) {
    if (common.includes(w)) score += 5;
    if (w.length > 6) score += 1;
  }
  // penalize too many non-letter characters
  const nonletters = (s.match(/[^A-Za-z0-9\s\.,'"\-\?\!;:]/g)||[]).length;
  return score - nonletters*2;
}

let decoded;
try {
  decoded = decodeBase64(base64Str);
} catch (e) {
  console.error("base64 decode failed:", e.message);
  process.exit(1);
}

const results = [];
for (let shift=0; shift<26; shift++) {
  const plain = applyRot(decoded, shift);
  const score = scoreEnglish(plain);
  results.push({ shift, score, plain: plain.slice(0,800) });
}
results.sort((a,b)=>b.score-a.score);

console.log("Top candidates:");
for (let i=0;i<6 && i<results.length;i++){
  console.log(`\n=== shift=${results[i].shift} score=${results[i].score} ===\n`);
  console.log(results[i].plain);
}
fs.writeFileSync("rot_candidates.json", JSON.stringify(results, null, 2));
