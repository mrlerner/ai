// progressions.js — what each progression sounds like, how it works, and why it lands.
// Keyed by mode ("M" major / "m" minor) + the numeral sequence with extensions stripped and
// consecutive repeats collapsed, e.g. "M:vi-V-I". Unknown patterns fall back to explain().

import { parseRn, chordInfo } from './theory.js';

export const PATTERNS = {
  // ---------------------------------------------------------------- two chords
  'M:I-IV': { name: 'I–IV', text:
    'Home and the lift. IV shares one note with I (the tonic itself, which becomes the fifth of IV), so the change feels like the floor rising rather than a departure. Nothing pulls back to I; the two chords just rock. Songs use it when the groove or the words are the point and the harmony should stay out of the way.' },
  'M:I-V': { name: 'I–V', text:
    'Home and away. V contains the leading tone, the note a half step below the tonic, so the whole time you sit on V the ear is waiting to be let back to I. That tension-and-release is the engine of most Western music, reduced to its two moving parts. Country and folk lean on it because it lets the melody and the story do the work.' },
  'M:I-bVII': { name: 'I–bVII (Mixolydian)', text:
    'A rock riff sound: bVII is a major chord a whole step below the tonic, borrowed from the mode of the parallel Mixolydian scale. It has no leading tone, so it does not pull back to I the way V does; it just thuds down and back up. That lack of pull is exactly why it sounds tough and un-fussy.' },
  'M:I-iii': { name: 'I–iii', text:
    'The smallest possible change. iii shares two of its three notes with I, so the chord barely moves; what you hear is the bass climbing a third and the colour turning slightly minor. It is wistful without being sad, and it reads as “the same place, seen from a different angle.”' },

  // ---------------------------------------------------------------- three chords, major
  'M:I-IV-V': { name: 'I–IV–V', text:
    'The three-chord song. IV opens the door (a lift, no pull), V creates the pull, I answers it. Every note of the major scale lives inside these three chords, which is why almost any melody in the key fits over them. It is the harmonic equivalent of a sentence with a subject, a verb and a full stop.' },
  'M:I-V-IV': { name: 'I–V–IV', text:
    'The three primary chords in a rock order: instead of IV building to V, V steps down to IV and then the loop returns home. The V–IV drop, a whole step down in the bass, is the sound of every anthem from Louie Louie onward. It feels open and forward-leaning because the loop never quite lands the way a V–I cadence does.' },
  'M:I-V-IV-I': { name: 'I–V–IV–I', text:
    'Country rock in four bars: out to V, a step down to IV, then home. The V–IV move is a “plagal” approach to I (IV to I is the “Amen” cadence), so the loop resolves softly rather than snapping shut. That softness is why it works for mid-tempo storytelling songs.' },
  'M:I-IV-I-V': { name: 'I–IV–I–V', text:
    'Two little trips out from home: first to IV (the lift), then to V (the lean). You come back to I between them, so it is really two two-chord moves stitched together. Great practice for hearing the difference between IV and V: IV feels like the ground rising, V feels like a hand on your back.' },
  'M:I-IV-V-IV': { name: 'I–IV–V–IV', text:
    'A rock loop that avoids resolving. After I–IV–V you expect I; instead V steps back down to IV, and the loop re-enters I from IV. That sidestep keeps the energy up and is why Wild Thing can play the same four chords for three minutes without getting stale.' },
  'M:I-IV-I-IV': { name: 'I–IV over a pedal', text:
    'On paper it is I–IV, the simplest change there is. On the record the bass never moves: it holds the tonic under both chords, so the change happens only in the upper voices. This is a pedal point. It makes IV sound suspended and dreamy rather than like a real departure, and it is a good test of whether you are hearing the chord or just following the bass.' },
  'M:V-IV-I': { name: 'V–IV–I', text:
    'The rock cadence run backwards from V: down a step to IV, down a fourth to I. It is I–V–IV started from the second chord, which changes the feel completely because the loop now ends on home. In High and Dry the V sits on its fifth in the bass, which softens the first chord until the I arrives and everything clicks into place.' },
  'M:I-bVII-IV': { name: 'I–bVII–IV', text:
    'The Mixolydian rock loop, also called the “double plagal” cadence: IV resolves to I plagally, and bVII resolves to IV the same way, so it is two soft cadences in a row. It sounds sunny and open because there is no leading tone anywhere. Note the ambiguity: the same three chords are V–IV–I in the key a fourth up, and Sweet Home Alabama has been argued about on exactly this point for fifty years.' },
  'M:I-bVII-IV-I': { name: 'I–bVII–IV–I', text:
    'The Mixolydian loop with the landing spelled out: bVII drops to IV, IV settles onto I, then the loop restarts. The bVII is the “borrowed” chord, a major chord on the flattened seventh that the major scale does not contain, and it is what makes the progression feel modal and slightly hazy rather than bright.' },
  'M:I-bVII-bVI': { name: 'I–bVII–bVI', text:
    'Two borrowed chords in a row, each a whole step down: I, bVII, bVI. The bass walks down a whole-tone fragment and the harmony darkens with each step, since both bVII and bVI come from the parallel minor. It sounds ominous and cinematic because you leave the major key and never come back inside the loop.' },
  'M:vi-V-I': { name: 'vi–V–I', text:
    'Starts on the relative minor, so the loop opens in shadow. V then supplies the pull, and I resolves it, but because you arrived at I from a minor chord two steps earlier, the resolution feels earned rather than automatic. It is the shape of a small mood swing: down, lean, light. Riptide holds I for two bars to let that light sit.' },
  'M:vi-IV-I': { name: 'vi–IV–I', text:
    'A descending-thirds loop: vi to IV is down a third, IV to I is down a fourth, so the bass keeps falling and the harmony keeps brightening. There is no V, so nothing pushes; the chords sink into I like a landing on a mattress. That is why it suits slow, consoling songs.' },

  // ---------------------------------------------------------------- four chords, major
  'M:I-V-vi-IV': { name: 'I–V–vi–IV (the four-chord loop)', text:
    'The most used progression in modern pop. Out to V, then the deceptive move: V “should” go to I but drops to vi instead, the relative minor, which gives a little twist of melancholy. IV then lifts you back toward I. Bright, sad, bright again in eight beats; that emotional cycle is why it never wears out.' },
  'M:vi-IV-I-V': { name: 'vi–IV–I–V', text:
    'The four-chord loop rotated to start on the minor chord. Same four chords as I–V–vi–IV, but beginning on vi makes the whole loop feel minor and searching, and ending on V leaves it hanging so the return to vi feels inevitable. Pop calls this the “sad but uplifting” progression; every anthemic EDM drop uses it.' },
  'M:I-vi-IV-V': { name: 'I–vi–IV–V (the ’50s progression)', text:
    'The doo-wop changes. I sinks a third to vi (barely a change, two shared notes), then IV lifts and V pulls you home. It is a complete little sentence that ends on a real cadence, which is why it loops so comfortably. Stand By Me plays it on the bass alone and the whole world recognises it.' },
  'M:I-vi-IV-V-I': { name: 'I–vi–IV–V–I', text:
    'The ’50s progression with the resolution written in: after V you land on I before the loop restarts. The extra bar of home makes it feel settled rather than cyclic. Listen for the V–I as a real ending each time.' },
  'M:I-vi-V-IV': { name: 'I–vi–V–IV', text:
    'A cousin of the ’50s progression with the last two chords swapped: I, down to vi, then V, then a step down to IV. Because IV comes last the loop returns to I with a plagal “amen” cadence instead of a V–I, which is softer and more folky. The V–IV whole-step drop in the middle is the tell.' },
  'M:I-vi-V-IV-V': { name: 'I–vi–V–IV–V', text:
    'I–vi–V–IV with a V tacked on the end so the loop resolves properly into I. Two Vs in five chords keeps the pull strong; the vi and IV between them supply the softness. Synth-pop likes this shape because it feels both driving and tender.' },
  'M:IV-I-vi-V': { name: 'IV–I–vi–V', text:
    'The four-chord loop started from IV, so the first thing you hear is the lift and home arrives on chord two. Then vi drops the mood and V leaves it hanging. Starting off-tonic is what makes Fast Car feel like it is already in motion when it begins.' },
  'M:IV-V-I-vi': { name: 'IV–V–I–vi', text:
    'A full cadence up front (IV–V–I) followed by a slide down into vi. Because the resolution comes in the middle of the loop rather than the end, the phrase ends in shadow and restarts with the lift. It sounds ceremonial; Viva La Vida turns it into a march.' },
  'M:I-V-vi-V': { name: 'I–V–vi–V', text:
    'Home, away, the deceptive drop to vi, and back to V. The V never resolves inside the loop, so it hangs and hangs; you only land on I when the loop restarts. In Landslide the V sits on its third in the bass, so the bass line walks Eb, D, C, D: a scale fragment rocking back and forth.' },
  'M:I-V-IV-V': { name: 'I–V–IV–V', text:
    'Home, then the dominant, then a step down to IV, then V again. The loop ends on V so it never fully resolves; every return to I is a small arrival. In Wonderful Tonight the first V sits on its third, so the bass walks G, F#, then jumps to C and D: the same D chord twice, with two different bass notes, is the whole lesson.' },
  'M:I-V-ii-IV': { name: 'I–V–ii–IV', text:
    'Like the four-chord loop but with ii where you expect vi. Both are minor, but ii is a fourth below V rather than a third, so the drop feels bigger and cooler. IV then arrives as ii’s neighbour up a third. It is the four-chord loop with a slight chill on it, which suits The Cure perfectly.' },
  'M:I-V-vi-III': { name: 'I–V–vi–III (secondary dominant)', text:
    'Starts like the four-chord loop, then instead of IV you get III as a major chord, E7 in the key of C. That chord is V of vi, a secondary dominant: it wants to resolve to vi, and the next time round it does. The major III adds a bright, slightly theatrical lean that a diatonic chord cannot.' },
  'M:I-V-vi-iii-IV': { name: 'I–V–vi–iii–IV', text:
    'The four-chord loop with iii slipped in between vi and IV. iii and vi share two notes, so the ear hears a minor chord “moving without moving,” and then IV brightens the way out. Most people miss the iii entirely; catching it is the whole exercise.' },
  'M:I-iii-vi-IV': { name: 'I–iii–vi–IV', text:
    'A descending-thirds chain: I to iii to vi, each chord sharing two notes with the last, so the harmony glides down almost imperceptibly before IV lifts it. In Someone Like You the iii sits on its fifth, so the bass steps A, G#, F#, then jumps to D: the smoothness is in the bass line as much as the chords.' },
  'M:I-iii-vi-IV-I-V': { name: 'I–iii–vi–IV–I–V', text:
    'The descending-thirds chain (I–iii–vi) with a full cadence after it (IV–I–V). It is a hymn shape: the first half sinks gently, the second half resolves and then leaves the door open on V. Slow it down and it is Can’t Help Falling in Love.' },
  'M:I-iii-vi-V': { name: 'I–iii–vi–V', text:
    'The chord roots walk straight down a scale: I, iii, vi, V. It sounds like a descending bass line, but every note is a real root rather than an inversion.' },
  'M:I-vi-III-IV': { name: 'I–vi–III–IV', text:
    'I drops to vi as usual, then the surprise: III as a major chord (G# major in E). That is V of vi, arriving after vi instead of before it, which makes it sound like a wrong turn that somehow works. IV then pulls everything back inside the key. Where Is My Mind gets its tilt from that one chord.' },
  'M:I-III-vi-V': { name: 'I–III–vi–V', text:
    'I, then a major III, a secondary dominant that leans hard into vi; vi obliges; V then sets up the return to I. Two real dominant pulls in four chords (III to vi, V to I) give it a spring in its step. Santeria is this loop with a lazy backbeat.' },
  'M:I-III-IV-iv': { name: 'I–III–IV–iv (Creep)', text:
    'Two surprises. The major III (B in G) is a secondary dominant that should go to vi but goes to IV instead. Then IV turns minor: the iv chord borrows from the parallel minor and its flattened third slides down to the tonic’s fifth like a sigh. Bright, lurch, lift, wilt. Radiohead built a career on that last chord.' },
  'M:I-IV-V-VI': { name: 'I–IV–V–VI', text:
    'A normal I–IV–V that ends on VI as a major chord, E major in G, which is not in the key at all. It functions as V of ii, but here it never resolves; it just sits there glowing before the loop snaps back to I. That unresolved major chord is why Hey Ya sounds so weirdly elated.' },
  'M:vi-I-V-II': { name: 'vi–I–V–II', text:
    'Minor start, then I and V as usual, then II as a major chord (B in A), a borrowed “double dominant,” V of V. In Wonderwall it is a sus chord, so the pull is blurred, but the bass landing on the second degree is unmistakable. The progression never resolves to I on a strong beat, which is what keeps the song circling.' },
  'M:I-v-ii': { name: 'I–v–ii (minor v)', text:
    'The tonic, then v as a minor chord, which the major key does not contain. Minor v removes the leading tone, so instead of pulling home it drifts, and ii after it drifts further. The loop never resolves, which is why Clocks feels like it could run forever. Modal, cool, a little anxious.' },
  'M:I-v-bVII-vi': { name: 'I–v–bVII–vi', text:
    'Major tonic, then three chords that all suggest the parallel minor or Mixolydian mode: minor v, bVII, and vi. The loop keeps stepping out of the key and back, and none of the chords pulls hard toward I. It is a wash of colour rather than a journey, which is exactly what an ambient-leaning track wants.' },
  'M:bVI-bIII-bVII-IV-I': { name: 'bVI–bIII–bVII–IV–I (Hey Joe)', text:
    'A chain of rising fourths: C, G, D, A, E. Each chord is the dominant of the next, so every change feels like a resolution, and the whole thing lands on E as the final resolution. Only the last two chords belong to the key; the first three are borrowed, which is why it sounds like it is arriving from far away.' },

  // ---------------------------------------------------------------- long form, major
  'M:I-V-vi-I-IV-V': { name: 'I–V/3–vi–I/5–IV/3–V', text:
    'The bass walks A, G#, F#, E, F#, E under a plain I–V–vi–I–IV–V. Three of the six chords are inversions whose only purpose is to keep the bass stepping instead of leaping. Take the inversions away and it is an ordinary progression; keep them and it is a lullaby.' },
  'M:I-V-vi-bVII-IV-V': { name: 'I–V/3–vi–bVII–IV–V', text:
    'A descending bass, G, F#, E, then F, that borrows a major chord on the flat seventh to keep the line stepping down chromatically. IV and V then turn it around. The bVII in a major key is the Southern-rock fingerprint; the walking bass is what makes it feel stately.' },
  'M:I-vi-IV-ii': { name: 'The Whiter Shade bass line', text:
    'On paper the chords are I, vi, IV, ii: nothing exotic. The composition is the bass line, which walks the major scale straight down, C, B, A, G, F, E, D, C, and the chords are chosen (and inverted) to sit over each step. Bach wrote this pattern first; Procol Harum added a Hammond. Hear the bass and the chords take care of themselves.' },
  'M:I-V-IV-I-IV-I-II-V': { name: 'The Piano Man bass line', text:
    'A waltz built the same way as Whiter Shade: the bass descends C, B, A, G, F, E, D, and the chords are inverted to fit. The one real surprise is the D major (II) near the end, a secondary dominant that leans into V so the loop can turn around. Count in three and follow the left hand.' },

  // ---------------------------------------------------------------- minor
  'm:i-iv-V': { name: 'i–iv–V', text:
    'The minor key’s three primary chords. iv is dark (minor subdominant), and V is major here, which means the leading tone is present and the pull back to i is strong. That major V in a minor key is the “classical” minor sound, tense and dramatic, and Billie Eilish plays it on a bass synth alone.' },
  'm:i-VI-V': { name: 'i–VI–V', text:
    'Tonic, then the sixth degree, then V: the bass falls a whole step (Ab to G in C minor) and lands on the dominant, which pulls hard back to i. That VI–V half-step-then-resolve is the Andalusian cadence trimmed to its last two chords. It sounds insistent and slightly menacing, which suits a synth riff.' },
  'm:i-VII-VI-V': { name: 'i–VII–VI–V (Andalusian cadence)', text:
    'The bass walks down the minor scale, D, C, Bb, A, and lands on a major V that yanks you back to i. The first three chords are all diatonic to natural minor; the V is borrowed from harmonic minor so the last step has a leading tone. Flamenco, Sultans of Swing, and half of all film music use it.' },
  'm:i-VII-VI-VII': { name: 'i–VII–VI–VII', text:
    'A minor loop that never touches V: down a step to VII, down another to VI, then back up. There is no leading tone anywhere, so nothing resolves; the progression just circles, which is why Watchtower can go on for as long as the soloist wants. Aeolian, brooding, endlessly loopable.' },
  'm:i-VII-III-VII': { name: 'i–VII–III–VII', text:
    'Minor tonic, down a step to VII, up to the relative major III, back to VII. Because III is the relative major, the loop is ambiguous: heard from D major it is vi–V–I–V. The bass riff decides which home you hear. Hearing that ambiguity, and hearing which chord the bass treats as home, is the skill.' },
  'm:i-VII-VI-iv': { name: 'i–VII–VI–iv', text:
    'A natural-minor descent, i–VII–VI, followed by iv instead of V, so the loop stays dark and does not resolve with a leading tone. In Nightcall the VII sits on its third in the bass, so the bass line goes A, B, F, D rather than A, G, F, D: an upward step where you expect a downward one.' },
  'm:i-VI-III-VII': { name: 'i–VI–III–VII', text:
    'The minor version of the four-chord loop: vi–IV–I–V heard from the minor chord. Relative to E minor it is i–VI–III–VII, and it feels minor because the loop starts and restarts on Em. The VII (D) at the end acts like a V-without-leading-tone, so the return to i is a soft landing, not a snap.' },
  'm:i-III-VII-IV': { name: 'i–III–VII–IV (Dorian loop)', text:
    'i, up to the relative major, down to VII, then IV as a major chord. That major IV (Bb over F minor) is the Dorian note: the sixth degree raised a half step. It sounds hopeful inside a minor key, bittersweet rather than sad, which is why both Mad World and Boulevard of Broken Dreams use it verbatim.' },
  'm:i-III-VII-VI': { name: 'i–III–VII–VI', text:
    'Minor tonic, relative major, then two steps down: VII, VI. The loop ends on VI, a whole step above the dominant, so the return to i feels like a lift rather than a resolution. Big-room EDM uses this shape constantly because the last chord makes the drop back to i feel triumphant.' },
  'm:i-III-v-IV': { name: 'i–III–v–IV (Dorian)', text:
    'Minor tonic, relative major, minor v, then a major IV. The major IV over a minor key is the Dorian colour again, here at disco tempo, and the minor v (no leading tone) keeps the loop from ever resolving. Cool, funky, cyclical: a loop that is happy to run all night.' },
  'm:i-III-VI-V': { name: 'i–III–VI–V', text:
    'Tonic, relative major, VI, then a major V with a leading tone. The first three chords sit in natural minor and feel like a smooth ascent (C, Eb, Ab); the V at the end supplies the drama and pulls you back to i. It is the classic minor-key turnaround with a soul-music sheen.' },
  'm:i-III-IV': { name: 'i–III–IV (Dorian)', text:
    'Minor tonic, relative major, then a major IV. That IV is the Dorian chord; in A minor it is D major instead of D minor, and its F# is what makes the loop ache rather than mope. Three chords, two bars, a whole worldview.' },
  'm:i-iv-III-VI': { name: 'i–iv–III–VI', text:
    'Two rising fourths in a row: i up to iv, then III up to VI. The bass leaps rather than steps, and there is no V, so the loop is all momentum and no resolution. Played as power chords with no thirds it is Smells Like Teen Spirit; the ambiguity between minor and major is part of the noise.' },
  'm:i-v-VII-IV': { name: 'i–v–VII–IV', text:
    'Minor tonic, minor v, VII, then a major IV. Minor v and major IV in the same loop is the ’80s synth-pop blend of Aeolian and Dorian: nothing resolves with a leading tone, but the major IV lifts the end of every bar. It sounds nocturnal and propulsive at the same time.' },
  'm:i-v-VII-i': { name: 'i–v–VII–i', text:
    'A minor tonic with a quick minor-v and VII on the way back. The v is minor, so there is no leading tone and the return to i is a slump rather than a resolution, which is exactly the feeling of the lyric. Sparse enough that the bass and the vocal are the whole harmony.' },
  'm:i-v-i-v-iv-VII': { name: 'i–v–i–v–iv–VII', text:
    'Minor tonic and minor dominant rocking back and forth, then iv and VII to turn the phrase around. Everything is natural minor: no leading tone, no bright chord, just a slow tide. The mandolin arpeggios hide the changes; the bass roots are the map.' },
  'm:i-v-VI-VII-v-VI': { name: 'i–v–VI, VII–v–VI', text:
    'Two three-chord phrases that share a tail: i–v–VI, then VII–v–VI. Every chord is natural minor and the bass jumps around, so the loop feels like it is circling a centre it never lands on. Anchor on the C minor at the top of each cycle and let the rest orbit.' },
  'm:i-III-IV-VI-V': { name: 'The descending minor bass line', text:
    'The chords are i, III, IV, VI, V, but the composition is the bass: A, G, F#, F, E, a chromatic descent from the tonic to the dominant. Two of the chords are inverted purely to put the right note in the bass. Led Zeppelin, Stairway, Time in a Bottle and a hundred flamenco tunes all use this line.' },
  'm:i-IV-VI-VII-i': { name: 'The Stairway line', text:
    'Same idea as Babe I’m Gonna Leave You: a chromatic bass descending A, G#, G, F#, F under chords chosen to fit each note. The i chord with a major seventh in the bass (Am/G#) is not a chord anyone would pick for its own sake; it exists because the bass line needs G#. Hear the line first, then the chords.' },
  'm:i-III-IV-VI-i-III-V': { name: 'i–III–IV–VI, i–III–V', text:
    'A rising minor line, A, C, D, F, answered by a second phrase that ends on a major V so it can turn around. The first phrase climbs with no resolution; the second supplies it. In 6/8 and arpeggiated, this is House of the Rising Sun, and it has been a folk standard for a century for this reason.' },
  'm:i-V-VII-IV-VI-III-iv-V': { name: 'Hotel California', text:
    'Eight bars that are secretly a chain of descending fifths: Bm, F#, A, E, G, D, Em, F#. Each chord is roughly a fifth below the last, alternating between the minor key and its relative major, so the sequence feels inevitable even though it visits almost every chord in the key. The final major V pulls it back to Bm and the wheel turns again.' },
  // ---------------------------------------------------------------- added after the official-chart pass
  'M:I-IV-I': { name: 'I–IV–I', text:
    'Home, the lift, home. IV shares the tonic note with I (it becomes the fifth of IV), so the move up feels like the floor rising rather than a departure, and the return is a soft landing with no leading tone. Reggae and trip-hop both lean on it because it never demands resolution; the groove carries the weight.' },
  'M:ii-IV-I': { name: 'ii–IV–I', text:
    'A minor start away from home, a lift to IV, and a landing on I. ii and IV share two notes, so the first move barely changes colour: it just turns from minor to major. There is no V, so the loop never pushes; it settles. Hear it as a slow exhale.' },
  'M:I-IV-V-iii': { name: 'I–IV–V/3–iii', text:
    'I to IV is the lift; then V arrives on its third in the bass (Bb/D in Eb), and iii is the minor chord a step below that. The bass line is the story: Eb, Ab, D, G, a leap up and then a walk down. Elton John writes bass lines first and hangs chords on them.' },
  'm:i-VII-IV-VI-V': { name: 'i–VII–IV/3–VI–V (descending bass)', text:
    'The bass falls A, G, F#, F, E: a chromatic line from the tonic to the dominant. The chords are chosen to sit on each step, which is why IV appears in a minor key (D major over F#). By the time the major V arrives with its leading tone, the line has walked you to the door and the V pushes you through it.' },
  'M:I-bVII-bVI-bVII': { name: 'I–bVII–bVI–bVII', text:
    'Two borrowed chords in a row, each a whole step down, then a step back up. The bass walks a whole-tone fragment (C#, B, A, B) and the harmony darkens as it goes, since bVII and bVI both come from the parallel minor. It sounds ominous and cinematic because you leave the major key and only get home when the loop restarts.' },
  'M:I-vi-I-IV-V': { name: 'I–Imaj7/7–vi–I–IV–V (waltz)', text:
    'The first three chords are one bass line: G, F#, E under G, Gmaj7 over F#, and Em. The chord barely changes; the bass steps down and the colour turns minor. Then a plain I–IV–V cadence answers it. A waltz built from a sigh and a nod.' },
  'm:i-v-VI-VII-i-v-VI': { name: 'Cm Gm Ab, Bb Cm Gm Ab', text:
    'A seven-chord loop where the second half re-enters the first: i–v–VI, then VII–i–v–VI. Every chord is natural minor, the bass jumps around, and nothing resolves with a leading tone, so it circles a centre it never lands on. Anchor on the C minor at the top of each cycle and let the rest orbit.' },
  'm:i-VII-III-v-VII': { name: 'i–VII–III–v–VII', text:
    'Minor tonic, down a step to VII, up to the relative major III, then the minor v and VII to turn around. Because III is the relative major, the loop is ambiguous: heard from E major it is vi–V–I–iii–V. The bass riff decides which home you hear, and hearing which chord the bass treats as home is the skill.' },
  // ---------------------------------------------------------------- inversion patterns (level 4)
  'M:I-I/3-IV-V': { name: 'I–I/3–IV–V (rising bass)', text:
    'The first two chords are the same chord. Only the bass moves, D up to F#, so the harmony sits still while the floor tilts upward; then IV and V arrive as plain root-position chords. That climbing bass, D, F#, G, A, is a scale walking up to the dominant, and it is why the loop feels like it is always leaning forward. Toggle “bass on roots” and the lean disappears.' },
  'M:I-V/3-IV-V': { name: 'I–V/3–IV–V', text:
    'Home, then the dominant on its third, then IV and V. The bass walks G, F#, then jumps to C and D: the same D chord appears twice with two different bass notes. The first one passes (it steps down and moves on); the second one pulls. Hearing that one chord can do two jobs depending on its bass is the whole exercise.' },
  'M:I-V/3-vi-V/3': { name: 'I–V/3–vi–V/3', text:
    'Home, the deceptive drop to vi, and V in between twice, never on its root. The bass steps Eb, D, C, D: a scale fragment rocking back and forth. Because V never sits on its root it never resolves; it just leans and returns, which is why Landslide feels suspended rather than sad.' },
  'M:I-iii/5-vi-IV': { name: 'I–iii/5–vi–IV (descending bass)', text:
    'A descending-thirds chain, I to iii to vi, with the middle chord placed over its fifth so the bass steps A, G#, F# instead of leaping. The G# under C#m makes it sound like a passing chord between home and the relative minor; then IV lifts the way out. Relative pairs again: C#m/G# and E/G# are one note apart.' },
  'm:i-VI-III-VII/3': { name: 'i–VI–III–VII/3', text:
    'The minor four-chord loop (vi–IV–I–V heard from the minor chord) with the last chord placed over its third. In E minor that is D over F#, so the bass ends a half step above E and leans back into it. Root-position D would just step down; D/F# points home.' },
  'M:vi-IVmaj7/5-I/5-V': { name: 'vi–IV/5–I/5–V (pedal bass)', text:
    'The chords are the “sad but uplifting” loop, but the guitar plays the middle two over their fifths, so the bass sits on D and then A while the harmony moves above it. That is a pedal in all but name: the ear hears the chords change and the floor stay put, then the V arrives on its root and the loop tips back to vi.' },
  'M:I-I7/7-IV-I': { name: 'I–I/b7–IV–I', text:
    'The chord barely changes for the first two bars: A, then the same A with G in the bass. That flat seventh in the bass is the Mixolydian colour, and dropping it under the chord instead of playing a separate G chord keeps the loop static and hazy. IV then lifts and I settles. Suspended voicings on top blur the thirds, which is the trip-hop fog.' },
  'M:I-Imaj7/7-vi-I-IV-V': { name: 'I–Imaj7/7–vi–I–IV–V (waltz)', text:
    'The first three chords are one bass line: G, F#, E under G, Gmaj7 over F#, and Em. The chord barely changes; the bass steps down and the colour turns minor. Then a plain I–IV–V cadence answers it. A waltz built from a sigh and a nod.' },
  'M:I-IV/5': { name: 'I–IV over a pedal', text:
    'On paper it is I–IV, the simplest change there is. On the record the bass never moves: it holds the tonic under both chords, so the change happens only in the upper voices. This is a pedal point. It makes IV sound suspended and dreamy rather than like a real departure, and it is a good test of whether you are hearing the chord or just following the bass.' },
  'M:I-IV/3': { name: 'I–IV/3', text:
    'I to IV, with the IV played over its third so the bass only drops a minor third (C to A) instead of leaping up a fourth. Same lift, smaller step. Hearing that the bass went down while the harmony went “up” to IV is the whole lesson.' },
  'M:I-V/3-IV': { name: 'I–V/3–IV', text:
    'Home, the dominant on its third, then IV. Spelled E/G#, the second chord is a first-inversion V: the bass steps down a half step from A to G# and the chord passes rather than resolves, then leaps to D. It shares two notes and its bass with C#m, so hearing it as iii is fair; the point is the bass line, A down to G#, and the fact that nothing cadences.' },
};

// -------------------------------------------------------------- fallback ----
const ROLE_MAJOR = {
  I: 'home', ii: 'a pre-dominant minor chord that usually leads to V', iii: 'a soft minor chord that shares two notes with I',
  IV: 'the lift (subdominant)', V: 'the dominant, which pulls back to I', vi: 'the relative minor', 'vii°': 'a leading-tone chord that resolves to I',
  bVII: 'a borrowed major chord from Mixolydian', bVI: 'a borrowed chord from the parallel minor', bIII: 'a borrowed chord from the parallel minor',
  iv: 'the minor subdominant, borrowed from the parallel minor', II: 'V of V, a secondary dominant', III: 'V of vi, a secondary dominant', VI: 'V of ii, a secondary dominant', v: 'a minor dominant with no leading tone',
};
const ROLE_MINOR = {
  i: 'home', 'ii°': 'a diminished pre-dominant', III: 'the relative major', iv: 'the minor subdominant', v: 'the minor dominant (no leading tone)',
  V: 'the major dominant, with a leading tone that pulls to i', VI: 'the sixth degree', VII: 'the subtonic, a soft dominant substitute',
  IV: 'a major IV, the Dorian colour', II: 'a major II, borrowed', bII: 'the Neapolitan', I: 'a major tonic (Picardy)', ii: 'a minor ii, Dorian',
};

const strip = rn => rn.replace(/maj7|7|9|sus[24]|add9|add4|6/g, '').replace('dim', '°');

// Pattern key without bass notes ("M:I-IV-V"); with withBass=true, inversions are kept ("M:I-I/3-IV-V").
export function patternKey(chords, key, withBass = false) {
  const a = chords.map(c => strip(c.rn) + (withBass && c.bass && c.bass !== 'root' ? '/' + c.bass : ''));
  const collapsed = a.filter((x, i) => i === 0 || x !== a[i - 1]);
  return (key.mode === 'minor' ? 'm:' : 'M:') + collapsed.join('-');
}

const BASS_WORD = { 3: 'third', 5: 'fifth', 7: 'seventh', M7: 'major seventh', b7: 'flat seventh' };

// One sentence naming the slash chords in this progression, for essays that describe the plain version.
function inversionNote(chords, key) {
  const inv = chords.filter(c => c.bass && c.bass !== 'root');
  if (!inv.length) return '';
  const parts = [...new Set(inv.map(c => { const i = chordInfo(c, key); return `${i.name} (${strip(c.rn)} with its ${BASS_WORD[c.bass] || c.bass} in the bass)`; }))];
  return ` In this song the bass does not always sit on the root: ${parts.join(', ')}. The chord functions are the same; the bass line is what changes.`;
}

export function explain(chords, key) {
  const kb = patternKey(chords, key, true);
  if (PATTERNS[kb]) return PATTERNS[kb];
  const k = patternKey(chords, key);
  if (PATTERNS[k]) return { name: PATTERNS[k].name, text: PATTERNS[k].text + inversionNote(chords, key) };
  const roles = key.mode === 'minor' ? ROLE_MINOR : ROLE_MAJOR;
  const seq = k.slice(2).split('-');
  const parts = seq.map(rn => { const r = roles[rn]; return r ? `${rn} is ${r}` : rn; });
  const hasV = seq.includes('V') || seq.includes('vii°');
  const borrowed = seq.filter(rn => /^b|^iv$|^II$|^III$|^VI$/.test(rn) && key.mode === 'major');
  let text = `${seq.join('–')}. ${parts.join('; ')}.`;
  text += hasV ? ' There is a real dominant in the loop, so it resolves each time round.' : ' There is no dominant with a leading tone, so the loop circles rather than resolves.';
  if (borrowed.length) text += ` ${borrowed.join(' and ')} come from outside the key, which is where the colour is.`;
  return { name: seq.join('–'), text };
}
