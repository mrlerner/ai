// theory.js — keys, Roman numerals, chord spelling.
// A chord in the corpus is { rn: "vi", bass: "3", beats: 4 } where rn is a Roman numeral
// relative to the song's key and bass is an optional chord tone ("root" | "3" | "5" | "7").

const PC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10]; // natural minor; V and vii° are spelled with accidentals in the corpus
const DEGREE = { I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6 };
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab']);

export function notePc(name) {
  const m = /^([A-G])([#b]*)$/.exec(name.trim());
  if (!m) throw new Error('bad note ' + name);
  let pc = NOTE_PC[m[1]];
  for (const a of m[2]) pc += a === '#' ? 1 : -1;
  return ((pc % 12) + 12) % 12;
}

export function parseKey(str) {
  // "F# minor", "Bb", "A major", "Am"
  const m = /^([A-G][#b]?)\s*(m(?:inor)?|major|maj)?$/i.exec(str.trim());
  if (!m) throw new Error('bad key ' + str);
  const mode = m[2] && /^m/i.test(m[2]) && !/maj/i.test(m[2]) ? 'minor' : 'major';
  return { tonic: m[1], tonicPc: notePc(m[1]), mode };
}

function preferFlats(key) {
  // Spell chord names with flats when the key signature uses flats.
  const flatTonicsMajor = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
  const flatTonicsMinor = ['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'];
  return key.mode === 'major' ? flatTonicsMajor.includes(key.tonic) : flatTonicsMinor.includes(key.tonic);
}

export function pcName(pc, key) {
  return (preferFlats(key) ? PC_FLAT : PC_SHARP)[((pc % 12) + 12) % 12];
}

// Parse a Roman numeral like "bVII", "ii7", "V/V", "Imaj7", "vii°", "IVsus2".
export function parseRn(rn) {
  let s = rn.trim();
  let secondary = null;
  const slash = s.indexOf('/');
  if (slash > 0) { secondary = s.slice(slash + 1); s = s.slice(0, slash); }
  const m = /^([b#]?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(.*)$/.exec(s);
  if (!m) throw new Error('bad roman numeral ' + rn);
  const acc = m[1] === 'b' ? -1 : m[1] === '#' ? 1 : 0;
  const numeral = m[2];
  const upper = numeral === numeral.toUpperCase();
  const degree = DEGREE[numeral.toUpperCase()];
  let suffix = m[3];
  let quality;
  if (/^(°|o|dim)/.test(suffix)) { quality = 'dim'; suffix = suffix.replace(/^(°|o|dim)/, ''); }
  else if (/^\+/.test(suffix)) { quality = 'aug'; suffix = suffix.slice(1); }
  else quality = upper ? 'maj' : 'min';
  return { acc, degree, upper, quality, suffix, secondary, label: rn };
}

const CHORD_INTERVALS = {
  maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8],
};

function extensionIntervals(quality, suffix) {
  // returns { intervals, seventh } where seventh is the semitone of the 7th if the chord has one
  let base = CHORD_INTERVALS[quality].slice();
  let seventh = null;
  const s = suffix;
  if (/^maj7/.test(s)) { seventh = 11; base.push(11); }
  else if (/^7/.test(s) || /^9/.test(s) || /^m7/.test(s)) { seventh = 10; base.push(10); if (/^9/.test(s)) base.push(14); }
  else if (/^6/.test(s)) base.push(9);
  if (/sus4/.test(s)) base = base.filter(i => i !== 4 && i !== 3).concat([5]);
  if (/sus2/.test(s)) base = base.filter(i => i !== 4 && i !== 3).concat([2]);
  if (/add9/.test(s)) base.push(14);
  if (/add4/.test(s)) base.push(5);
  base = [...new Set(base)].sort((a, b) => a - b);
  return { intervals: base, seventh };
}

// Root pitch class of a Roman numeral in a key.
export function rnRootPc(rn, key) {
  const p = typeof rn === 'string' ? parseRn(rn) : rn;
  const scale = key.mode === 'major' ? MAJOR : MINOR;
  let root = key.tonicPc + scale[p.degree] + p.acc;
  if (p.secondary) {
    // V/V etc: the numeral is relative to the secondary target's root, as a major key
    const targetPc = rnRootPc(p.secondary, key);
    root = targetPc + MAJOR[p.degree] + p.acc;
  }
  return ((root % 12) + 12) % 12;
}

// Full chord description: { rootPc, name, intervals, bassPc, bassLabel, quality }
export function chordInfo(chord, key) {
  const p = parseRn(chord.rn);
  const rootPc = rnRootPc(p, key);
  const { intervals, seventh } = extensionIntervals(p.quality, p.suffix);
  const bass = chord.bass || 'root';
  let bassInterval = 0;
  if (bass === '3') bassInterval = intervals.find(i => i === 3 || i === 4) ?? 0;
  else if (bass === '5') bassInterval = 7;
  else if (bass === '7') {
    // "natural" 7th for slash-chord spelling: maj7 over major triads, m7 over minor, b7 if chord already dominant
    bassInterval = seventh ?? (p.quality === 'maj' ? 11 : 10);
  } else if (bass === 'b7') bassInterval = 10;
  else if (bass === 'M7') bassInterval = 11;
  else if (typeof bass === 'number') bassInterval = bass;
  const bassPc = (rootPc + bassInterval) % 12;
  const rootName = pcName(rootPc, key);
  let name = rootName;
  if (p.quality === 'min') name += 'm';
  else if (p.quality === 'dim') name += 'dim';
  else if (p.quality === 'aug') name += '+';
  name += p.suffix.replace(/^m7/, '7');
  if (bass !== 'root') name += '/' + pcName(bassPc, key);
  return { rootPc, name, intervals, bassPc, bassInterval, bass, quality: p.quality, rn: chord.rn, rnLabel: rnDisplay(chord) };
}

export function rnDisplay(chord) {
  let s = chord.rn.replace('dim', '°');
  if (chord.bass && chord.bass !== 'root') s += '/' + chord.bass;
  return s;
}

export function keyDisplay(key) {
  return key.mode === 'major' ? `${key.tonic} major` : `${key.tonic} minor`;
}

// The palette of numerals offered as answer buttons, by key mode and difficulty tier.
export const PALETTES = {
  major: {
    diatonic: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    borrowed: ['bIII', 'bVI', 'bVII', 'iv', 'II', 'III', 'VI', 'V/V'],
  },
  minor: {
    diatonic: ['i', 'ii°', 'III', 'iv', 'v', 'V', 'VI', 'VII'],
    borrowed: ['IV', 'II', 'bII', 'vii°', 'ii', 'I'],
  },
};

// Equivalence for grading: strip extensions so "V7" matches "V", "ii7" matches "ii", "vii°" matches "vii°".
export function rnCore(rn) {
  const p = parseRn(rn);
  const acc = p.acc === -1 ? 'b' : p.acc === 1 ? '#' : '';
  const num = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][p.degree];
  const numeral = p.upper ? num : num.toLowerCase();
  const q = p.quality === 'dim' ? '°' : p.quality === 'aug' ? '+' : '';
  return acc + numeral + q + (p.secondary ? '/' + rnCore(p.secondary) : '');
}

export function sameChord(a, b) {
  return rnCore(a) === rnCore(b);
}

// MIDI helpers for the synth
export function pcToMidi(pc, octave) { return 12 * (octave + 1) + pc; }
export function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

// Voice a chord for the synth: bass note in octave 2, chord tones around octave 4 in close position.
export function voiceChord(info, { rootPosition = false } = {}) {
  const bassPc = rootPosition ? info.rootPc : info.bassPc;
  const bassMidi = pcToMidi(bassPc, 2);
  // chord tones: keep them within C4..B4-ish, sorted from the root
  const tones = info.intervals.map(i => (info.rootPc + i) % 12);
  let midis = tones.map(pc => pcToMidi(pc, 4));
  // rotate so the voicing sits in a comfortable register: lowest note >= E3 (52) and <= E4 (64)
  midis = midis.map(m => (m < 57 ? m + 12 : m)).sort((a, b) => a - b);
  if (midis[0] > 64) midis = midis.map(m => m - 12);
  return { bassMidi, chordMidis: midis };
}
