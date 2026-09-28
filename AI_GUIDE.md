# AI Guide

You are an AI coding agent working on `arabic-kit`, a zero-dependency Arabic formatting library
for JavaScript and TypeScript. This file tells you exactly how to modify it safely.

Read it as a checklist, not as background information.

---

## 1. Before changing anything

Read these four files, in this order. They take a few minutes and prevent every common mistake:

```text
ARCHITECTURE.md    where code belongs, dependency rules, recipes
CONTRIBUTING.md    workflow, naming, style, forbidden changes
DEVELOPMENT.md     local commands and how to verify a change
README.md          the public API and every documented example
```

Then inspect the feature directory you are about to touch, including its tests:

```text
src/number/   src/digits/   src/date/   src/time/   src/stretch/
```

Read the feature's `formatter.ts` (or `<name>.ts`) and its `__tests__/` before writing anything. The
tests are the executable specification; the README is documentation. When they disagree, the tests
win and the README is the bug.

Finally, run the quality gate to confirm you start from a green tree:

```bash
npm run validate
```

---

## 2. Route the request to a directory

Never guess. Use this table.

| The request                                                                                | Go to                |
| ------------------------------------------------------------------------------------------ | -------------------- |
| "format a number", "group thousands", "percentage-like decimals", "national ID formatting" | `src/number/`        |
| "Arabic digits in this text", "convert the digits in a label", "the user typed ٠١٢٣"       | `src/digits/`        |
| "month name", "weekday name", "ISO date", "leap year", "exam date"                         | `src/date/`          |
| "HH:mm", "seconds", "12-hour", "AM/PM", "ص / م"                                            | `src/time/`          |
| "tatweel", "stretch", "fill a label", "text elongation"                                    | `src/stretch/`       |
| logic needed by **two or more** areas                                                      | `src/utils/`         |
| locale tags, `Locale` / `DigitStyle` types, numbering systems                              | `src/locale/`        |
| a constant used by a single file                                                           | the top of that file |
| a test for the public export surface, or README examples                                   | `src/__tests__/`     |
| a longer usage example, a framework snippet                                                | `examples/`          |
| a change to how the package is consumed (exports, entry points)                            | `package.json`       |

Examples of concrete routing:

- "Add `formatPercent`" -> rejected by default: the public surface is five functions. Add a
  `percent` option to `NumberOptions` if the user needs percentages, or a new area if they really need
  a separate function.
- "Add an option to show the weekday in the time" -> rejected: time has no weekday. It belongs in
  `src/date/`.
- "Add a `padStart` helper for codes" -> if it is only for numbers, `src/number/`. If digits are
  involved and more than one area needs it, `src/utils/digits.ts`.
- "Make `number()` also convert digits in arbitrary text" -> rejected: that is `digits()`. Mixing them
  is what the two-function split exists to prevent.
- "Add currency support" -> **out of scope.** Say so instead of inventing it. See section 6.

---

## 3. Hard rules

These are enforced by tooling or by review. Do not violate them.

1. **Zero runtime dependencies.** The package ships with none. `Intl` and the platform are the
   toolbox. A new dependency requires discussion, not just a line in `package.json`.
2. **No new feature areas** beyond Number, Digits, Date, Time and Stretch without an explicit
   request.
3. **Dependencies point down only**: public entry -> feature -> `utils` / `locale` -> platform.
4. **A feature never imports another feature.** Shared logic moves to `src/utils/`.
5. **No circular imports.**
6. **No cross-cutting constant folders.** Constants live in the file that uses them.
7. **No new public export unless the request asks for one**, and then it must be exported
   deliberately through all three hops: the file, the area `index.ts`, then `src/index.ts`. The
   public surface is exactly `number`, `digits`, `date`, `time`, `stretch`; a variation is an option.
   The pre-1.0 names `formatNumber`, `formatDate`, `formatTime`, `toArabicDigits` and
   `toLatinDigits` must never reappear — `public-api.test.ts` fails if they do.
8. **No `any`, no `as`, no `!`** to silence the compiler. Narrow the type properly.
9. **No `console.*` in `src/`.** Ever.
10. **No `try/catch` around code that cannot throw.** Validate and return a documented fallback.
11. **No magic numbers inside function bodies.** Name the constant.
12. **No framework code** (React hooks, Vue composables, DOM listeners) in this package.
13. **No comments** explaining what the code does. Comment only a decision or a non-obvious rule.
14. **Relative imports with the `.js` extension** (`../utils/digits.js`). The project uses
    `moduleResolution: nodenext`; there are no path aliases.
15. **Do not change documented output** without changing the tests, the README and
    `src/__tests__/readme-examples.test.ts` in the same change, and without treating it as a
    breaking change.

---

## 4. How to make each kind of change

### Add a variation to an existing function

This is the default answer. The public surface is five functions.

1. Add an optional property to the options interface in `src/<area>/types.ts`.
2. Apply a default by destructuring in the implementation. Never mutate the caller's object.
3. Add it to the options table in `README.md`.
4. Add three tests: default, enabled, edge case.
5. Assert the new example in `src/__tests__/readme-examples.test.ts`.
6. Run `npm run validate`.

### Add a function to an existing area

Only when the behaviour cannot be an option, and only with a stated user need.

1. Create `src/<area>/<name>.ts` with one exported `const` arrow function and an explicit return
   type. Use the same style as the neighbouring files.
2. Add public types to `src/<area>/types.ts` (optional properties, defaults applied by
   destructuring).
3. Export it from `src/<area>/index.ts`.
4. Add a line to `src/index.ts` in alphabetical order.
5. Add `src/<area>/__tests__/<name>.test.ts`. Import from the implementation file
   (`../<name>.js`), not the barrel. Cover: default behaviour, every option, empty input, invalid
   input, and one Arabic case.
6. Add the name to `PUBLIC_FUNCTIONS` in `src/__tests__/public-api.test.ts`.
7. Add a section and an API table row in `README.md`, and assert the examples in
   `src/__tests__/readme-examples.test.ts`.
8. Run `npm run validate`.

### Add a constant

Ask: one file, one area, or several areas? Then put it in that file, in a file inside the area, or
in `src/utils/` / `src/locale/`. Name it in `SCREAMING_SNAKE_CASE` and spell it out
(`HOURS_PER_PERIOD`, not `TWELVE`).

### Add a new area

1. Copy the shape of `src/date/` exactly: `index.ts`, `formatter.ts`, `parser.ts`, `types.ts`,
   `__tests__/`.
2. Register the subpath in `package.json` `exports` (`"./<area>"` -> `./dist/<area>/index.js`).
3. Export from `src/index.ts`.
4. Update the directory map and import graph in `ARCHITECTURE.md`, the QA list in this file, and
   the tables in `README.md`.

### Change the public API

Implementation -> types -> area `index.ts` -> `src/index.ts` -> tests -> `README.md` (section,
API table, `readme-examples.test.ts`) -> `ARCHITECTURE.md` if the shape changed. Breaking changes
require a major version bump and a migration note in `README.md`. A rename finishes with a
repository-wide search for the old names, because a leftover reference is a broken import.

---

## 5. Commands

```bash
npm run validate      # the gate: format:check + lint + typecheck + test + build
npm run typecheck     # types only
npm test              # tests only (Vitest)
npm run test:watch    # watch mode
npm run lint          # ESLint, type-aware, warnings are errors
npm run format        # Prettier write
npm run build         # clean + tsc -> dist/ (ESM + .d.ts)
```

If you cannot run the commands, say so explicitly instead of claiming the change is verified.

---

## 6. Scope boundaries

The package has five areas on purpose. Requests outside them must be declined with a short
explanation, not implemented "while you are in there":

- currency, money, prices, tafqit (number to words),
- OCR, NLP, stemming, translation, text normalisation,
- Hijri / Islamic calendar conversion,
- React hooks, Vue composables, or any framework binding,
- locale detection, runtime locale files, i18n frameworks,
- any new runtime dependency.

If a request clearly implies one of these, the correct output is a short refusal plus the nearest
thing the package does support.

---

## 7. Traps specific to this repository

- **Arabic is bidirectional.** A tatweel-heavy string in a diff or terminal can look scrambled even
  when it is correct. Never "fix" Arabic strings by eye. Assert exact strings in a test and let the
  test result decide.
- **Never guess `Intl` output.** Arabic month and weekday names, the thousands separator `٬` and
  the Arabic comma `،` come from ICU. Compute the expected value by running the code
  (`node --input-type=module -e '...'`) instead of predicting it.
- **`ar` alone is not enough.** `new Intl.NumberFormat("ar")` resolves to the `latn` numbering
  system and produces Latin digits. Always go through `LOCALE_TAGS` in `src/locale/index.ts`.
- **Time is not delegated to `Intl`.** A wall-clock string is not a `Date`; formatting `"18:30"`
  through `Intl` would mean inventing a `Date` in some timezone. Keep `time` deterministic.
- **`stretch` has documented behaviour that looks like a bug.** Whitespace is normalised to single
  spaces and non-finite amounts become `0`. These are tested, intentional, and changing them is a
  breaking change.
- **`locale` decides separators, `digits` decides glyphs.** `number(123456, { locale: "ar", digits:
"latin", group: true })` is `"123٬456"` on purpose. Do not "fix" it by making the separators follow
  the digit style.
- **Grouping applies only to plain decimal numbers.** `"0501234567"` must never become
  `"50,123,4567"`. This is the single most valuable guarantee of the number area. `isNumeric` and
  `applyGrouping` use two different patterns for exactly this reason; do not merge them.
- **`number()` does not touch digits in text.** `number("order #42", { locale: "ar" })` is
  `"order #42"`. That is not a bug to "fix" by moving the shaping back — it is the reason `digits()`
  exists.
- **`digits()` does not normalise separators.** `digits("١٬٠٠٠", "latin")` is `"1٬000"`. Number
  formatting belongs to `number()`.
- **`date("…")` with no `month` is deliberately locale-independent.** Do not shape its digits or
  localize it; the ISO form exists to be stored and submitted.
- **Dates are parsed as local calendar dates.** Do not switch to `new Date(value)`, which parses
  `"2026-09-28"` as UTC and shifts the day for negative UTC offsets.
- **The README is not a substitute for tests.** If you change behaviour, the README examples and
  `src/__tests__/readme-examples.test.ts` must change in the same commit.

---

## 8. Definition of done

A change is complete when all of these are true:

```text
[ ] the code lives in the directory this guide routes it to
[ ] no new runtime dependency, no new feature area, no framework code
[ ] no `any`, no `console`, no bare magic number, no unnecessary try/catch
[ ] an option was preferred over a new public function
[ ] every new public function has a test file; edge cases included
[ ] new public exports are re-exported from src/index.ts on purpose
[ ] public-api.test.ts lists the new export
[ ] README section + options/API table + readme-examples.test.ts updated
[ ] a repository-wide search for removed/renamed symbols comes back empty
[ ] ARCHITECTURE.md updated if the file layout changed
[ ] npm run validate passes
[ ] you can state, from evidence, that behaviour did not change for the other areas
```

Report the result honestly: what you changed, which command you ran, and the output. If something
is unresolved, say so instead of declaring the task finished.
