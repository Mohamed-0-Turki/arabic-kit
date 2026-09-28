# Contributing

Thanks for improving `arabic-kit`. This document is the short version of the workflow; the long
version lives in [ARCHITECTURE.md](./ARCHITECTURE.md).

- [Workflow](#workflow)
- [Naming conventions](#naming-conventions)
- [Where to put code](#where-to-put-code)
- [Code style](#code-style)
- [What contributors should avoid](#what-contributors-should-avoid)
- [Before you open a pull request](#before-you-open-a-pull-request)
- [Adding an option or a function: checklist](#adding-an-option-or-a-function-checklist)

---

## Workflow

1. **Identify the feature area.** Number, Digits, Date, Time or Stretch. If the change does not
   belong to one of them, it does not belong in this package — see "Non-goals" in
   [README.md](./README.md).
2. **Implement inside the correct module.** `src/number/`, `src/digits/`, `src/date/`, `src/time/` or
   `src/stretch/`. Shared logic that at least two areas need goes to `src/utils/`.
3. **Add or update the types** in `src/<area>/types.ts`.
4. **Add or update tests** in `src/<area>/__tests__/`. Every public function needs tests, including
   edge cases: empty input, invalid input, defaults, and the option being off.
5. **Update the exports** if the change is public: the area's `index.ts`, then `src/index.ts`, then
   `package.json` `exports` if you added a subpath.
6. **Update the README** — the feature section, the API reference table, and the examples in
   `src/__tests__/readme-examples.test.ts`.
7. **Run the quality gate:** `npm run validate` (format, lint, typecheck, test, build).
8. **Open a pull request** with a short summary of the behaviour change and an example of the
   before/after output.

If you only need a subset:

```bash
npm run typecheck    # types
npm test             # tests
npm run lint         # lint
npm run build        # dist/
npm run format       # rewrite files with Prettier
```

---

## Naming conventions

| Thing            | Convention                              | Example                                       |
| ---------------- | --------------------------------------- | --------------------------------------------- |
| Public function  | `camelCase`, named after the area       | `number`, `digits`, `date`, `time`, `stretch` |
| Public type      | `PascalCase`, descriptive suffix        | `NumberOptions`, `NumberInput`, `MonthStyle`  |
| Input union type | `<Feature>Input`                        | `DateInput`, `TimeInput`                      |
| Options type     | `<Function>Options`                     | `TimeOptions`                                 |
| Option property  | `camelCase`, no abbreviation            | `hour12`, `weekday`, `group`, `digits`        |
| Internal file    | `camelCase` for the job, not the export | `formatter.ts`, `parser.ts`, `numeric.ts`     |
| Test file        | `<function-name>.test.ts`, dashes       | `number.test.ts`                              |
| Constant         | `SCREAMING_SNAKE_CASE`, fully spelled   | `HOURS_PER_PERIOD`, `ARABIC_INDIC_DIGITS`     |
| Private helper   | `camelCase`, verb first                 | `to12Hour`, `applyGrouping`                   |

Two rules that matter more than the rest:

- **Names describe behaviour, not implementation.** `to12Hour`, not `mod12`. `applyGrouping`, not
  `doIntl`.
- **No abbreviations.** `isArabic`, not `isAr`. `TATWEEL`, not `TAT`.

**The public surface is five functions.** A new user-facing variation is an option on `number`,
`digits`, `date`, `time` or `stretch` — not a sixth function. Add a function only for a behaviour that
cannot be expressed as an option, and say what user need it serves.

---

## Where to put code

```text
Only about formatting a number    ->  src/number/
Only about digit glyphs in text   ->  src/digits/
Only about calendar dates         ->  src/date/
Only about wall-clock times       ->  src/time/
Only about tatweel stretching     ->  src/stretch/
Needed by two or more areas       ->  src/utils/
Locale metadata                   ->  src/locale/
A constant used by one file       ->  top of that file
A new public export               ->  area index.ts, then src/index.ts, then package.json
A package-level guarantee         ->  src/__tests__/
A runnable or framework example   ->  examples/
```

Read [Placement rules](./ARCHITECTURE.md#placement-rules) before you add a new folder or a new
`utils` file. The `utils` test: **used by at least two areas today, and contains no feature
behaviour.** Anything else belongs to a feature.

---

## Code style

The toolchain decides; the conventions decide what the toolchain cannot see.

- **Prettier** owns formatting. Do not hand-format; run `npm run format`.
- **TypeScript strict mode** owns types. `any`, `as` and `!` are a last resort and are reviewed
  as such.
- **ESLint** owns code smells: `no-console`, `eqeqeq`, `prefer-const`,
  `explicit-module-boundary-types` (exported functions declare their return type).
- **Small functions, one job each.** If a function needs a comment to explain its second half,
  extract the second half.
- **No `try/catch` around code that cannot throw.** Validate input and return a documented
  fallback instead.
- **No `console.*` anywhere in `src/`.** A library must be silent.
- **Comment only the why.** The code says what it does. A comment earns its place by explaining a
  decision, a constraint or a non-obvious rule (Arabic grammar, bidi, ICU behaviour).
- **No dependency can be added without discussion.** `arabic-kit` ships zero runtime
  dependencies; `Intl` and the platform are the toolbox.

---

## What contributors should avoid

| Do not                                                                   | Because                                                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Reformat a whole file inside a feature change                            | It hides the real diff.                                                                       |
| Change public output without updating README + `readme-examples.test.ts` | The docs become a lie.                                                                        |
| Add a public function for one variation of an existing one               | Five memorable functions beat a directory of helpers. Add an option.                          |
| Bring back `format*`, `toArabicDigits` or `toLatinDigits`                | They were removed on purpose; `public-api.test.ts` fails if they reappear.                    |
| Make `number()` convert digits inside arbitrary text again               | It is `digits()`'s job. Folding it back re-creates the silent-no-op that motivated the split. |
| Add a `constants/` folder                                                | It destroys locality. Constants live next to their user.                                      |
| Add a barrel file that re-exports everything                             | It defeats tree-shaking and hides ownership.                                                  |
| Introduce a cycle between areas                                          | Symptom of misplaced logic.                                                                   |
| Add a runtime dependency                                                 | The package must stay installable anywhere.                                                   |
| Ship an internal helper as public "just in case"                         | Public API is a contract; removing it is a breaking change.                                   |
| Add features outside Number/Digits/Date/Time/Stretch                     | Scope creep (currency, tafqit, OCR, NLP, Hijri, framework hooks) is explicitly out of scope.  |
| "Improve" the whitespace normalisation in `stretch`                      | It is documented, tested behaviour. Changing it is a breaking change.                         |
| Catch and swallow an error to make a test pass                           | It hides the bug the test found.                                                              |

---

## Before you open a pull request

Run the full gate:

```bash
npm run validate
```

It runs, in order: `format:check`, `lint`, `typecheck`, `test`, `build`. All of them must pass.
Then confirm by hand:

- Every public function is documented in the README API reference.
- Every public function has tests, including its edge cases.
- Every example in the README matches the current output.
- Nothing internal is exported that you did not intend to export.

---

## Adding an option or a function: checklist

```text
[ ] the user-facing need written down (which call site?)
[ ] option preferred over a new function
[ ] implementation in the right area
[ ] public types in src/<area>/types.ts
[ ] exported from src/<area>/index.ts
[ ] exported from src/index.ts
[ ] subpath registered in package.json exports (only for a new area)
[ ] tests in src/<area>/__tests__/<name>.test.ts
[ ] name added to PUBLIC_FUNCTIONS in src/__tests__/public-api.test.ts
[ ] README section + options table + API reference table row
[ ] examples added to src/__tests__/readme-examples.test.ts
[ ] ARCHITECTURE.md updated if the file layout changed
[ ] npm run validate passes
```
