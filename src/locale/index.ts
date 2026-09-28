export type Locale = "ar" | "en";

export type DigitStyle = "arabic" | "latin";

export const LOCALE_TAGS: Record<Locale, string> = {
  ar: "ar-EG",
  en: "en-US",
};

const LOCALE_DIGIT_STYLES: Record<Locale, DigitStyle> = {
  ar: "arabic",
  en: "latin",
};

export const resolveDigitStyle = (
  locale: Locale,
  preference: DigitStyle | "auto",
): DigitStyle =>
  preference === "auto" ? LOCALE_DIGIT_STYLES[locale] : preference;
