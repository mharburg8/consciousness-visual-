// Presence Mode — orienting questions.
//
// Each option is a felt-sense statement a person might recognize in themselves,
// not an assessment. The `layer` field is a gentle resonance hint only. The
// resolved layer is the rounded average across all answers. No scores are
// shown to the user — nothing is tallied or ranked. This file is the
// single source of truth for the Presence flow's question content.

export interface PresenceOption {
  text: string;
  layer: number; // 1 (innermost) – 7 (outermost)
}

export interface PresenceQuestion {
  prompt: string;
  hint?: string;
  options: PresenceOption[];
}

export const presenceQuestions: PresenceQuestion[] = [
  {
    prompt: "What's most present in your body right now?",
    hint: 'Pause. Notice. Let the answer come from sensation, not thought.',
    options: [
      { text: 'A heaviness — something I have been carrying',        layer: 7 },
      { text: 'A tight readiness, a bracing',                        layer: 7 },
      { text: 'Motion — I am engaged with what is in front of me',   layer: 6 },
      { text: 'A quiet wondering, a reaching toward understanding',  layer: 5 },
      { text: 'Warmth or softness without reason',                   layer: 4 },
      { text: 'Spaciousness — less of a me than usual',              layer: 3 },
    ],
  },
  {
    prompt: 'When you look at your life right now, it feels…',
    hint: 'Not what you think about it. What it feels like.',
    options: [
      { text: 'Like too much, or unfair',                     layer: 7 },
      { text: 'Demanding, but I am managing',                 layer: 6 },
      { text: 'Workable — things are moving',                 layer: 6 },
      { text: 'Meaningful, even where it is hard',            layer: 5 },
      { text: 'Complete, even in what has not resolved',      layer: 4 },
      { text: 'Simply what it is, without much commentary',   layer: 3 },
    ],
  },
  {
    prompt: 'What, underneath everything, are you reaching for?',
    hint: 'Not the surface want. The longing beneath it.',
    options: [
      { text: 'Relief — for this to ease',                       layer: 7 },
      { text: 'To keep moving, to keep building',                layer: 6 },
      { text: 'To understand, to see clearly',                   layer: 5 },
      { text: 'Peace that does not depend on anything',          layer: 4 },
      { text: 'To rest as what I already am',                    layer: 3 },
      { text: "Nothing in particular — and that feels strange",  layer: 2 },
    ],
  },
];

// Average the selected layer IDs, round to nearest integer, clamp to 1..7.
// Returns the resonant layer id.
export function resonantLayerFrom(answers: number[]): number {
  if (answers.length === 0) return 7;
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  const rounded = Math.round(avg);
  return Math.max(1, Math.min(7, rounded));
}
