const TATWEEL = "ـ";
const DEFAULT_AMOUNT = 1;
const WHITESPACE_PATTERN = /\s+/;
const ARABIC_LETTER_PATTERN = /[\u0600-\u06ff]/;
const ARABIC_MARK_PATTERN = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/;

const NON_CONNECTING_LETTERS = new Set([
  "ا",
  "أ",
  "إ",
  "آ",
  "د",
  "ذ",
  "ر",
  "ز",
  "و",
  "ؤ",
  "ئ",
  "ء",
  "ة",
  "ى",
]);

export const stretch = (
  text: string,
  amount: number = DEFAULT_AMOUNT,
): string => {
  const tatweel = TATWEEL.repeat(toTatweelCount(amount));

  return text
    .split(WHITESPACE_PATTERN)
    .map((word) => stretchWord(word, tatweel))
    .join(" ");
};

const toTatweelCount = (amount: number): number =>
  Number.isFinite(amount) ? Math.max(0, Math.trunc(amount)) : 0;

const stretchWord = (word: string, tatweel: string): string =>
  toGraphemes(word)
    .map((grapheme, index, graphemes) =>
      joinGraphemes(grapheme, graphemes[index + 1], tatweel),
    )
    .join("");

const toGraphemes = (word: string): string[] => {
  const graphemes: string[] = [];

  for (const char of word) {
    const previous = graphemes.at(-1);

    if (previous !== undefined && ARABIC_MARK_PATTERN.test(char)) {
      graphemes[graphemes.length - 1] = previous + char;
    } else {
      graphemes.push(char);
    }
  }

  return graphemes;
};

const joinGraphemes = (
  grapheme: string,
  next: string | undefined,
  tatweel: string,
): string => {
  if (next === undefined || !isConnectable(grapheme) || !isArabic(next)) {
    return grapheme;
  }

  return `${grapheme}${tatweel}`;
};

const isConnectable = (grapheme: string): boolean => {
  const letter = grapheme.charAt(0);

  return isArabic(letter) && !NON_CONNECTING_LETTERS.has(letter);
};

const isArabic = (grapheme: string): boolean =>
  ARABIC_LETTER_PATTERN.test(grapheme.charAt(0));
