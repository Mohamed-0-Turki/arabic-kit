# Architecture

This document explains how `arabic-kit` is organised and, more importantly, **where new code
belongs**. If you can answer "which directory does this go in?" after reading this file, you can
start any change in this repository.

- [Principles](#principles)
- [Directory map](#directory-map)
- [How the layers depend on each other](#how-the-layers-depend-on-each-other)
- [Feature anatomy](#feature-anatomy)
- [Placement rules](#placement-rules)
- [Constants](#constants)
- [Types](#types)
- [Tests](#tests)
- [Exports](#exports)
- [Recipes](#recipes)
- [Anti-patterns](#anti-patterns)
- [API design decisions](#api-design-decisions)

---

## Principles

The architecture exists to make six answers obvious:

1. Which directory does new behaviour go in?
2. Which file inside that directory?
3. What must be exported for it to be public?
4. Which test file must change?
5. Which documentation must change?
6. Which command proves it works?

Everything below serves those answers. When a rule and convenience conflict, the rule wins.

---

## Directory map

```text
src/
├── index.ts                     # The only public entry point. Re-exports, nothing else.
│
├── number/                      # Area 1: numbers
│   ├── index.ts                 # Public surface of the area
│   ├── formatter.ts             # number
│   ├── numeric.ts               # internal: numeric-text gate + Intl grouping, identifier-safe
│   ├── types.ts                 # Public types of the area
│   └── __tests__/
│       └── number.test.ts
│
├── digits/                      # Area 2: digit glyphs inside text
│   ├── index.ts
│   ├── digits.ts                # digits
│   └── __tests__/
│       └── digits.test.ts
│
├── date/                        # Area 3: dates
│   ├── index.ts
│   ├── formatter.ts             # date
│   ├── parser.ts                # internal: string -> Date, with validation
│   ├── types.ts
│   └── __tests__/
│       └── date.test.ts
│
├── time/                        # Area 4: times
│   ├── index.ts
│   ├── formatter.ts             # time
│   ├── parser.ts                # internal: string -> { hour, minute, second }
│   ├── types.ts
│   └── __tests__/
│       └── time.test.ts
│
├── stretch/                     # Area 5: Arabic text stretching
│   ├── index.ts
│   ├── stretch.ts               # stretch
│   └── __tests__/
│       └── stretch.test.ts
│
├── locale/                      # Shared locale infrastructure
│   └── index.ts                 # Locale, DigitStyle, LOCALE_TAGS, resolveDigitStyle
│
├── utils/                       # Genuinely shared helpers (used by 2+ areas)
│   └── digits.ts                # applyDigitStyle
│
└── __tests__/                   # Package-level guarantees
    ├── public-api.test.ts       # The public export surface
    └── readme-examples.test.ts  # Every example claimed in README.md

examples/                        # Runnable examples, not published (see package.json "files")
```

| Directory      | Responsibility                                     | Must not contain                      |
| -------------- | -------------------------------------------------- | ------------------------------------- |
| `src/number/`  | Everything about formatting a number value.        | Date, time or stretching logic.       |
| `src/digits/`  | Everything about digit glyphs inside text.         | Number formatting, separators.        |
| `src/date/`    | Everything about calendar dates.                   | Time-of-day logic.                    |
| `src/time/`    | Everything about wall-clock time strings.          | Calendar logic.                       |
| `src/stretch/` | Everything about tatweel insertion.                | Formatting or locale data.            |
| `src/locale/`  | `Locale`, `DigitStyle` and the tables behind them. | Feature behaviour.                    |
| `src/utils/`   | Stateless helpers used by **more than one** area.  | Feature behaviour, feature constants. |
| `src/index.ts` | Explicit re-exports of the intended public API.    | Any implementation.                   |

### There is no `src/constants/`

Deliberate. The legacy project had a flat `constants/` folder that every feature imported from,
which made it impossible to tell which constant belonged to which feature. Today every constant
sits in the file that uses it (`TATWEEL` lives in `src/stretch/stretch.ts`, the digit code points
live in `src/utils/digits.ts`). If a constant is ever needed by two areas, it moves to
`src/locale/` (locale data) or `src/utils/` (behaviour), and the rule above applies again.

---

## How the layers depend on each other

```text
┌─────────────────────────────────────────────┐
│ Public API          src/index.ts           │  re-exports only
├─────────────────────────────────────────────┤
│ Feature modules     src/number/            │  public behaviour
│                     src/digits/            │  + their own internals
│                     src/date/              │
│                     src/time/              │
│                     src/stretch/           │
├─────────────────────────────────────────────┤
│ Shared internals    src/utils/digits.ts    │  used by 3 areas
│                     src/locale/index.ts    │
├─────────────────────────────────────────────┤
│ Platform            Intl (built into JS)   │  no dependency of ours
└─────────────────────────────────────────────┘
```

Rules, in order of importance:

1. **Dependencies point down only.** A feature may use `utils`, `locale` and the platform. `utils`
   and `locale` may use the platform. Nothing ever points up.
2. **A feature never imports another feature.** `src/date/` must not import from `src/number/`.
   If two areas need the same logic, that logic is not feature logic — move it to `src/utils/`.
3. **`src/index.ts` imports only from feature `index.ts` files.** It is a manifest, not a module.
4. **No circular imports**, ever. If you feel the need for one, the shared logic is in the wrong
   layer.
5. **Internal files are imported by explicit path** (`../utils/digits.js`), never through a barrel
   that re-exports everything.

The current import graph is a tree with no cycles and no cross-feature edges:

```text
index.ts
├── number/index.ts  ──▶ number/formatter.ts, number/numeric.ts, number/types.ts
│                        └──▶ utils/digits.ts, locale/index.ts
├── digits/index.ts  ──▶ digits/digits.ts
│                        └──▶ utils/digits.ts
├── date/index.ts    ──▶ date/formatter.ts, date/parser.ts, date/types.ts
│                        └──▶ locale/index.ts
├── time/index.ts    ──▶ time/formatter.ts, time/parser.ts, time/types.ts
│                        └──▶ utils/digits.ts, locale/index.ts
└── stretch/index.ts ──▶ stretch/stretch.ts
```

---

## Feature anatomy

A feature is a folder under `src/` that answers to one product concern. It follows the same shape
so that any feature can be read the same way.

| File           | Contains                                                           | Named as                 |
| -------------- | ------------------------------------------------------------------ | ------------------------ |
| `index.ts`     | Re-exports only: the public function and public types of the area. | —                        |
| `formatter.ts` | The public function of the area.                                   | `number`, `date`, `time` |
| `parser.ts`    | Internal validation/normalisation of raw input.                    | `parseDate`, `parseTime` |
| `<name>.ts`    | A public function that is not a formatter (`stretch`).             | `stretch`                |
| `<name>.ts`    | A public function with no input policy beyond its argument.        | `digits`                 |
| `types.ts`     | Public types of the area. Only if the area has types.              | `types`                  |
| `__tests__/`   | One test file per public function, named after it.                 | `<name>.test.ts`         |

Rules inside a feature:

- Private helpers are module-local `const` arrow functions **below** the exported function, not
  exported.
- An exported function is exported from its own file, then re-exported by `index.ts`, then
  re-exported by `src/index.ts`. Three hops, each one intentional.
- If a helper must be shared inside the feature (two files), it lives in its own file and is
  imported explicitly. It is still not public until `index.ts` re-exports it.

---

## Placement rules

Use this table. It is the single source of truth for "where does X go?".

| The behaviour…                                      | Goes in                                                    |
| --------------------------------------------------- | ---------------------------------------------------------- |
| formats a number value                              | `src/number/`                                              |
| converts digit glyphs inside text                   | `src/digits/`                                              |
| formats a calendar date                             | `src/date/`                                                |
| formats a wall-clock time                           | `src/time/`                                                |
| inserts tatweel into Arabic text                    | `src/stretch/`                                             |
| decides whether a string may be grouped as a number | `src/number/`                                              |
| is needed by Digits **and** Number **and** Time     | `src/utils/`                                               |
| is needed by exactly one area                       | inside that area                                           |
| is locale metadata (tags, digit styles)             | `src/locale/`                                              |
| is a constant used by one file                      | that file                                                  |
| is part of the public API                           | exported from the area's `index.ts` **and** `src/index.ts` |
| is a package-level guarantee (export surface, docs) | `src/__tests__/`                                           |

**The `utils` test.** Before adding anything to `src/utils/`, answer both:

1. Is it used by at least two areas **today** (not "will probably be used")?
2. Does it contain no feature-specific behaviour, names or constants?

If either answer is no, it belongs in the feature. `utils` is the smallest directory in the
repository on purpose.

`src/utils/digits.ts` is the only file there, and it passes the test three times over: Digits, Number
and Time all convert digit glyphs, so the glyph-to-glyph mapping is shared. What stays out of it is
just as important — the `"auto"` resolution policy lives in `src/locale/`, the numeric-text gate
lives in `src/number/numeric.ts`, and the public `digits()` signature lives in `src/digits/`. Sharing
the conversion is not the same as sharing a responsibility.

---

## Constants

| Kind of constant                   | Example                                                            | Home                           |
| ---------------------------------- | ------------------------------------------------------------------ | ------------------------------ |
| Feature-specific, used by one file | `TATWEEL`, `NON_CONNECTING_LETTERS`, `PERIODS`, `HOURS_PER_PERIOD` | that file, at the top, `const` |
| Pattern used by one file           | `ISO_DATE_PATTERN`, `TIME_PATTERN`, `NUMERIC_PATTERN`              | that file, at the top, `const` |
| Shared lookup table                | `LOCALE_TAGS`, `LOCALE_DIGIT_STYLES`                               | `src/locale/index.ts`          |
| Digit families as whole strings    | `ARABIC_INDIC_DIGITS`, `EXTENDED_ARABIC_INDIC_DIGITS`              | `src/utils/digits.ts`          |
| Separator code point               | `ARABIC_DECIMAL_SEPARATOR`                                         | `src/number/numeric.ts`        |

Rules:

- One `const` per value, even when two values are equal. `DAY` and `NUMERIC` both being
  `"numeric"` is exactly the kind of alias that makes code harder to read.
- A name must say what it is: `TATWEEL`, not `T`; `HOURS_PER_PERIOD`, not `TWELVE_ONLY`.
- No magic numbers inside a function body. If a number appears in a function, it needs a name.
- Letters and words are written literally (`"ص"`, `"م"`, `"ـ"`). Code points that are invisible or
  punctuation-like (`ARABIC_INDIC_DIGITS`, `ARABIC_DECIMAL_SEPARATOR`) use an escape so a reviewer
  can see the character being referenced.
- A **domain** constant exists exactly once: one tatweel, one non-connecting letter set, one
  separator table, one locale tag map. These must never be duplicated.
- A trivial local layout constant such as a two-digit pad width may repeat across two independent
  renderers; coupling `src/date/` and `src/time/` over the number `2` would cost more than it
  protects.

---

## Types

| Kind of type                         | Home                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Public input/option types of an area | `src/<area>/types.ts`, re-exported by the area and by `src/index.ts`   |
| Cross-area public types              | `src/locale/index.ts` (`Locale`, `DigitStyle`)                         |
| Internal helper types                | next to the helper, not exported (`TimeParts` in `src/time/parser.ts`) |
| Test-only types                      | inside the test file                                                   |

Rules:

- Input unions are named `…Input` (`NumberInput`, `DateInput`, `TimeInput`) and always include
  `null` and `undefined`, because every public function accepts them.
- Options are named after the function they configure: `NumberOptions`, `DateOptions`,
  `TimeOptions`. Every property is optional.
- A literal union such as `MonthStyle` is exported only if a user needs it; otherwise it stays
  internal to the area. `DigitStyle` is public because two areas accept it.
- Prefer `unknown`/narrow literals over `any`. `any` is banned by the lint config.
- Do not add a type before a second consumer exists.

---

## Tests

Tests live next to the code they cover:

```text
src/number/formatter.ts   ->  src/number/__tests__/number.test.ts
```

| Rule                                                 | Detail                                                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| One test file per public function                    | Named `<function-name>.test.ts` with dashes.                                                        |
| Every public function is tested                      | A new export without a test is incomplete work.                                                     |
| Tests import the implementation file, not the barrel | `import { number } from "../formatter.js"` — this also proves the file is independently importable. |
| Test names describe behaviour                        | `it("keeps leading-zero strings intact when group is enabled")`, not `it("works")`.                 |
| Package-level tests live in `src/__tests__/`         | `public-api.test.ts` asserts the export surface; `readme-examples.test.ts` asserts the README.      |
| No snapshots                                         | Exact strings are asserted directly. Snapshots hide regressions instead of documenting them.        |

When you add a public export, also add its name to `PUBLIC_FUNCTIONS` in
`src/__tests__/public-api.test.ts`. That test fails if you export something you did not intend to
export, which is the cheapest guard against leaking internals. The same file lists
`REMOVED_PUBLIC_NAMES`: the pre-1.0 names that must never come back.

---

## Exports

Three hops decide whether something is public:

```text
implementation file  ->  area index.ts  ->  src/index.ts  ->  package.json "exports"
```

1. **Implementation file.** `export const number = ...` if the area should expose it.
2. **Area index** (`src/date/index.ts`). The one place where an area decides its public surface.
   Re-export values with `export { x } from "./x.js"`, types with `export type { … } from …`.
3. **Root** (`src/index.ts`). The package manifest. Alphabetical, explicit, one line per export.
4. **`package.json`.** `exports` maps `.`, `./number`, `./digits`, `./date`, `./time`, `./stretch`.
   A new area needs a new subpath here, and `files`-style metadata stays in sync.

Rules:

- `src/index.ts` never contains logic, only re-exports.
- If it is not in `src/index.ts`, it is not public — even if the file exports it.
- `LOCALE_TAGS`, `resolveDigitStyle`, `applyDigitStyle`, `applyGrouping`, `isNumeric`, `parseDate`,
  `parseTime` are deliberately **not** exported. If a user needs one of them, that is a signal to
  extend a public function, not to export the internal one.
- Types are public as well. Exporting a function whose options type is unreachable is a bug.
- `examples/` is not exported and not published. It imports `arabic-kit` by name and resolves
  through the same `exports` map consumers use, which keeps the examples honest.

---

## Recipes

### Add a variation to an existing function

Example: "rounding to a fixed number of decimals".

The public surface is five functions. A variation is almost always an **option**, not a sixth
function.

1. Add the property to the options interface in `src/<area>/types.ts` — optional, with a default
   applied by destructuring in the implementation.
2. Implement it in `<area>/formatter.ts`; extract a small named helper if the branch grows.
3. Add it to the options table in `README.md`.
4. Add tests for: the default, the enabled value, and the edge case.
5. Add the example to `src/__tests__/readme-examples.test.ts`.
6. Run `npm run validate`.

If a behaviour genuinely cannot be an option, add a function only with a user request behind it,
and treat it as a public API decision: 1. implement it in `src/<area>/formatter.ts` (or its own file
inside the area), 2. export it from `src/<area>/index.ts`, 3. export it from `src/index.ts`, 4. add `src/<area>/__tests__/<name>.test.ts`, 5. add the name to `PUBLIC_FUNCTIONS` and a row to the
API reference table in `README.md`, 6. `npm run validate`.

### Add a constant

1. Ask: is it used by one file, several files of one area, or several areas?
2. One file → top of that file. One area → its own file inside the area. Several areas →
   `src/utils/` (behaviour) or `src/locale/` (locale data).
3. Name it, never inline it.
4. If it moved areas, update every import and re-run `npm run validate`.

### Add a new area (a sixth feature)

Example: "number to words".

1. Create `src/words/{index.ts,formatter.ts,parser.ts,types.ts,__tests__/words.test.ts}`.
2. Follow [Feature anatomy](#feature-anatomy) exactly. Copy the shape of `src/date/`.
3. Register a subpath in `package.json` `exports`: `"./words"`.
4. Export from `src/index.ts` and add the entry to the tables in `README.md`.
5. Add a section in `ARCHITECTURE.md` (directory map, import graph) and in the docs table of
   `README.md`.
6. Add the area to the QA list in `AI_GUIDE.md`.
7. Run `npm run validate`.

### Change the public API

Never a silent change. In order:

1. implementation, 2. types, 3. area `index.ts`, 4. `src/index.ts`, 5. tests (update, then add),
2. `README.md` (section + API table + `readme-examples.test.ts`), 7. `ARCHITECTURE.md` if the shape
   changed. Breaking changes bump the major version and get a migration note in `README.md`.

A rename like the pre-1.0 `format*` → `number` / `date` / `time` cleanup is done in that order, in
one pass, and finishes with a repository-wide search for the old names to prove none survived.

### Update tests

- Behaviour change → change the expectation and add a test that fails without the change.
- New option → three tests: default, set, edge case.
- New public export → new test file **and** update `src/__tests__/public-api.test.ts`.
- README change → update `src/__tests__/readme-examples.test.ts` in the same commit.

---

## Anti-patterns

These are the ways this architecture degrades. All of them are pull requests that should be
rejected or fixed.

| Anti-pattern                                | Why it is banned                                                                | Do this instead                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| A random `.ts` file in `src/`               | Nobody can predict where to look for it.                                        | Put it in the area that owns the behaviour.                    |
| A `utils.ts` that grows forever             | Becomes a junk drawer; imports drag in unrelated code.                          | One small file per shared helper, named after it.              |
| Feature logic inside `index.ts`             | The barrel becomes the place people look for behaviour, so nothing is findable. | `index.ts` re-exports; behaviour lives in named files.         |
| Circular imports                            | Symptom of logic in the wrong layer.                                            | Move the shared part down to `utils`.                          |
| Importing another area's internals          | Couples areas; deleting one breaks the other.                                   | Move the shared part to `utils`, or make it public on purpose. |
| Duplicating a constant (two `TATWEEL`s)     | They will drift.                                                                | One definition, in the lowest layer that needs it.             |
| Exporting implementation details            | Locks internals into the public contract forever.                               | Keep it internal until a user-visible need exists.             |
| A new runtime dependency                    | A formatting library must stay installable anywhere.                            | `Intl` and the platform already do this.                       |
| A sixth public function for one variation   | The surface stops being memorable and every user pays for the choice.           | Add an option, or extend the existing function.                |
| An abstraction before the second caller     | Guessing at a future API makes the code worse.                                  | Write it inline; extract on the second use.                    |
| `any`, `as`, `!` to silence the compiler    | Defeats the type system that protects the API.                                  | Narrow the type properly.                                      |
| A `try/catch` around code that cannot throw | Hides bugs and adds noise.                                                      | Validate input explicitly and return a documented fallback.    |
| A React/Vue/framework binding in `core`     | Forces a framework on every consumer.                                           | Keep it in the consumer app.                                   |

---

## API design decisions

Documented so that future changes stay consistent instead of drifting.

**Names are the area, not the verb: `number`, `digits`, `date`, `time`, `stretch`.** These replaced
the `formatNumber` / `formatDate` / `formatTime` / `toArabicDigits` / `toLatinDigits` family. The old
names cost the user two things: the `format` prefix said nothing the import statement did not, and
the two digit functions were variations of a single concern that users had to learn separately. One
function per area, named after the area, is the smallest surface that still covers the five jobs. The
internal files kept the verb (`formatter.ts`, `parser.ts`, `numeric.ts`) so the code still says what
it does.

**A formatted number and a sentence are different problems, so they are different functions.**
`number()` answers "how is this value displayed?" and `digits()` answers "rewrite the digits in this
text". Folding the second into the first as an option forces every caller of `number()` to also carry
the number input policy: `number("order #42", { digits: "arabic" })` has to decide whether that string
is a number, and the answer is that it is not — so the digits silently stay Latin and the caller gets
a wrong string with no error. Splitting the functions removes that ambiguity from the call site
instead of documenting around it.

**`number()` is numeric-only, and non-numeric input comes back untouched.** The area's value is its
guarantee that identifiers are never grouped; that guarantee is only credible if "is this a number?"
is answered by a strict rule (`isNumeric`) rather than by heuristics. So string input that is not a
plain decimal is returned verbatim, with no digit conversion, and the caller reaches for `digits()`
when they meant text. The wide input union stays (`string | number | bigint | null | undefined`)
because templates pass through every one of them; what changed is the policy applied to each.

**`digits()` takes a string and a required style — no options object, no default.** It has exactly
one decision, so `digits(value, style)` is the whole API. The style is required on purpose: `digits`
has no locale, so there is nothing sensible to default it to, and a silent default would produce
Latin digits for a caller who assumed otherwise. Its input is a string only, because text that
contains digits is text by definition; a `number` argument would only invite callers to reformat
values they should have sent to `number()`.

**`digits` converts all three digit families, in any combination.** Latin, Arabic-Indic and
Persian/extended Arabic-Indic digits all map to the requested family, so mixed input converges
instead of keeping whatever the author typed. It never touches separators, currency symbols or signs:
normalising a number is `number()`'s job, and blurring the two is how `"1٬000"` ends up as
`"1,000"` in a string that was supposed to be display-only.

**`digits: "auto"` resolves from the locale, and only `number` and `time` have it.** Number and Time
render their own digits, so a forced style is meaningful for both. Date either returns the
`YYYY-MM-DD` form with its digits converted through `applyDigitStyle` and
`resolveDigitStyle(locale, "auto")`, or delegates month names to `Intl.DateTimeFormat`, which already
owns the digit style — an option there would be a second way to say one thing. `digits` is not given
an option either, per the rule above.

**Options objects, not positional booleans.** The legacy functions took `(value, lang, a, b, c)`.
Positional booleans are unreadable at the call site and impossible to extend without breaking
everyone. Every function takes one optional options object, and an option is added only when it
represents a user-facing decision.

**`stretch` keeps a positional number.** It has exactly one knob; an object would be ceremony.

**Intl is used where it is correct.** Numbers and dates are real values, so
`Intl.NumberFormat`/`Intl.DateTimeFormat` do the grouping, ordering, month names and weekday names.
We do not reimplement locale data.

**Time is rendered by hand, on purpose.** A wall-clock string is not a `Date`. Using Intl would
mean inventing a `Date` in some timezone and depending on the runtime's ICU build.
`time` validates the string and renders it deterministically instead.

**Locale decides separators, `digits` decides glyphs.** `locale: "ar"` with `digits: "latin"` keeps
the Arabic thousands separator and swaps the digits, which is the honest decomposition: one option
for the shape of the value, one for the characters it is drawn with. Users who want both Latin ask
for `locale: "en", digits: "latin"`.

**Two numeric patterns, on purpose.** `isNumeric` (`NUMERIC_PATTERN`) decides whether string input is
a number at all, and it is lenient enough to accept a sign and leading zeros so a typed national ID
still gets its digits shaped. `applyGrouping` (`GROUPABLE_PATTERN`) decides whether the value may be
grouped, and it is strict: no leading zeros, no `+`, no exponent. Using one pattern for both would
force a choice between grouping phone numbers and leaving IDs unstyled. Grouping also converts through
`BigInt` when the value is an integer, so a 30-digit value is grouped exactly instead of being rounded
through a float.

**Locale tags are pinned.** `ar` maps to `ar-EG` because `new Intl.NumberFormat("ar")` resolves to
the `latn` numbering system and would produce Latin digits. `en` maps to `en-US`. The mapping
lives in `src/locale/index.ts` so that the pinning is one decision in one file, next to the digit
styles it implies.

**Invalid input is returned unchanged, and nullish input is `""`.** Every function is safe to call
directly in a template. Nothing throws, and nothing is logged: a formatting library that prints
warnings on every render is a nuisance in production.

**The React hook was removed.** The legacy `useStretchedArabic` (a `ResizeObserver` + canvas
measuring hook) left the core package: it forced React on every consumer, needed a DOM test
environment, and is an integration concern, not a formatting one. The stretching engine
(`stretch`) is unchanged and is the supported primitive; measure-and-fit belongs in the app.
