import { describe, expect, it } from "vitest";
import { stretch } from "../stretch.js";

describe("stretch", () => {
  it("adds one tatweel per join by default", () => {
    expect(stretch("مرحبا")).toBe("مـرحـبـا");
  });

  it("accepts a custom amount", () => {
    expect(stretch("مرحبا", 2)).toBe("مــرحــبــا");
    expect(stretch("مرحبا", 3)).toBe("مـــرحـــبـــا");
  });

  it("truncates fractional amounts", () => {
    expect(stretch("مرحبا", 1.9)).toBe("مـرحـبـا");
  });

  it("treats negative, zero and non-finite amounts as no stretch", () => {
    expect(stretch("مرحبا", 0)).toBe("مرحبا");
    expect(stretch("مرحبا", -3)).toBe("مرحبا");
    expect(stretch("مرحبا", Number.NaN)).toBe("مرحبا");
    expect(stretch("مرحبا", Number.POSITIVE_INFINITY)).toBe("مرحبا");
  });

  it("never appends a tatweel after the last letter", () => {
    expect(stretch("ابت", 5)).toBe("ابـــــت");
    expect(stretch("ابت", 5).match(/\u0640/g)).toHaveLength(5);
  });

  it("leaves non-connecting letters alone", () => {
    expect(stretch("أحمد", 3)).toBe("أحـــمـــد");
    expect(stretch("س", 2)).toBe("س");
    expect(stretch("ة", 2)).toBe("ة");
    expect(stretch("ا", 2)).toBe("ا");
  });

  it("keeps diacritics attached to their base letter", () => {
    expect(stretch("مُحَمَّد", 2)).toBe("مُــحَــمَّــد");
  });

  it("stretches every word of an Arabic phrase", () => {
    expect(stretch("مرحبا بالعالم", 2)).toBe("مــرحــبــا بــالــعــالــم");
  });

  it("stretches words around punctuation", () => {
    expect(stretch("مرحباً، بالعالم!", 2)).toBe(
      "مــرحــبــاً، بــالــعــالــم!",
    );
  });

  it("normalizes whitespace between words to a single space", () => {
    expect(stretch("  مرحبا   بالعالم  ", 1)).toBe(" مـرحـبـا بـالـعـالـم ");
    expect(stretch("مرحبا\nبالعالم", 1)).toBe("مـرحـبـا بـالـعـالـم");
    expect(stretch("مرحبا\tبالعالم", 1)).toBe("مـرحـبـا بـالـعـالـم");
  });

  it("ignores non-Arabic content", () => {
    expect(stretch("Hello", 2)).toBe("Hello");
    expect(stretch("2026", 2)).toBe("2026");
    expect(stretch("مرحبا 2026", 2)).toBe("مــرحــبــا 2026");
  });

  it("decides from the base letter, not from a trailing mark", () => {
    expect(stretch("بتaَ", 2)).toBe("بــتaَ");
    expect(stretch("بaَ", 2)).toBe("بaَ");
  });

  it("returns an empty string for empty input", () => {
    expect(stretch("")).toBe("");
  });
});
