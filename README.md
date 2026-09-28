# arabic-kit

Arabic **number**, **digit**, **date**, **time** and **text stretching** formatting for JavaScript
and TypeScript.

- **Zero runtime dependencies.**
- **ESM only**, ships declaration files, fully tree-shakable.
- Built on `Intl` where `Intl` is the right tool, deterministic string rendering where it is not.
- Five functions, each with exactly one job. No configuration files, no globals, no runtime setup.

```ts
import { date, digits, number, stretch, time } from "arabic-kit";

number(123456, { locale: "ar" }); // "١٢٣٤٥٦"
digits("order #42", "arabic"); // "order #٤٢"
date("2026-09-28", { locale: "ar", month: "long", weekday: true }); // "الاثنين، ٢٨ سبتمبر ٢٠٢٦"
time("18:30", { locale: "ar" }); // "١٨:٣٠"
stretch("مرحبا", 2); // "مــرحــبــا"
```

---

## Table of contents

- [What is arabic-kit?](#what-is-arabic-kit)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Number](#number)
- [Digits](#digits)
- [Date](#date)
- [Time](#time)
- [Stretch](#stretch)
- [API reference](#api-reference)
- [Real-world examples](#real-world-examples)
- [Native Intl](#native-intl)
- [Non-goals](#non-goals)
- [Documentation](#documentation)

---

## What is arabic-kit?

`arabic-kit` is a small formatting library for applications that display numbers, dates and times
to Arabic-speaking users.

It exists because the naive approach to Arabic formatting is a set of one-off `replace` calls
scattered through an application. Those calls are hard to test, drift apart, and quietly corrupt
identifiers such as phone numbers and national IDs. `arabic-kit` replaces them with five functions,
one job each:

| I have…                      | Use       | What it does                                          |
| ---------------------------- | --------- | ----------------------------------------------------- |
| a number to display          | `number`  | Locale-aware number formatting, grouping, digit style |
| text with digits to re-glyph | `digits`  | Digit conversion inside arbitrary text                |
| a calendar date              | `date`    | ISO dates, month names, weekday names                 |
| a wall-clock time            | `time`    | 12/24-hour clocks with `ص` / `م`                      |
| an Arabic label to fill      | `stretch` | Tatweel stretching for fixed-width titles             |

`number` and `digits` are deliberately separate: a formatted number and a sentence that happens to
contain digits are different problems, and only one of them is number formatting.

Design rules that hold everywhere:

1. **Nothing throws for the documented input types.** Every function takes the input type it
   documents and returns a string.
2. **Input that cannot be formatted is returned unchanged**, so you can call these functions
   directly in a template without guarding every call site.
3. **Identifiers keep their digits.** Grouping is only applied to values that are plain decimal
   numbers, so `"0501234567"` never becomes `"50,123,4567"`.
4. **No magic, no side effects.** Pure functions, no globals, no locale detection, no `console`
   output.

---

## Installation

```bash
npm install arabic-kit
```

```bash
pnpm add arabic-kit
```

```bash
yarn add arabic-kit
```

Requires Node.js 18 or newer. The package is ESM only; there is no CommonJS build.

---

## Quick start

```ts
import { date, digits, number, stretch, time } from "arabic-kit";

number(123456, { locale: "ar" }); // "١٢٣٤٥٦"
number(123456, { locale: "ar", group: true }); // "١٢٣٬٤٥٦"
number(123456.78, { locale: "en", group: true }); // "123,456.78"

digits("2026-09-28", "arabic"); // "٢٠٢٦-٠٩-٢٨"
digits("٢٠٢٦-٠٩-٢٨", "latin"); // "2026-09-28"

date("2026-09-28"); // "2026-09-28"
date("2026-09-28", { locale: "ar", month: "long" }); // "٢٨ سبتمبر ٢٠٢٦"
time("18:30", { locale: "ar" }); // "١٨:٣٠"
time("18:30", { locale: "ar", hour12: true }); // "٠٦:٣٠ م"
stretch("مرحبا", 2); // "مــرحــبــا"
```

You can also import a single function to keep your bundle small:

```ts
import { number } from "arabic-kit/number";
import { digits } from "arabic-kit/digits";
import { date } from "arabic-kit/date";
import { time } from "arabic-kit/time";
import { stretch } from "arabic-kit/stretch";
```

---

## Number

### `number(value, options?)`

Formats a number. `value` accepts `string`, `number`, `bigint`, `null` and `undefined`.

| Option   | Type                            | Default  | Description                                                  |
| -------- | ------------------------------- | -------- | ------------------------------------------------------------ |
| `locale` | `"ar" \| "en"`                  | `"en"`   | Formatting profile. See [Locale profiles](#locale-profiles). |
| `digits` | `"auto" \| "arabic" \| "latin"` | `"auto"` | `auto` follows the locale; the others force a digit style.   |
| `group`  | `boolean`                       | `false`  | Add thousands separators and normalise decimals.             |

```ts
import { number } from "arabic-kit";

number(123456); // "123456"
number(123456.78); // "123456.78"
number(-42.5); // "-42.5"
number(1234n); // "1234"

number(123456, { locale: "ar" }); // "١٢٣٤٥٦"
number(123456, { locale: "ar", group: true }); // "١٢٣٬٤٥٦"
number(123456.78, { locale: "en", group: true }); // "123,456.78"
number(1000000, { locale: "ar", group: true }); // "١٬٠٠٠٬٠٠٠"
number(1234.5, { locale: "ar", group: true }); // "١٬٢٣٤.٥"
```

`null` and `undefined` become an empty string, so an optional total never renders `"null"`:

```ts
number(null); // ""
number(undefined); // ""
```

### Identifiers are never grouped

Grouping is applied only when the string form of `value` is a plain decimal number, which keeps
phone numbers, national IDs and account numbers intact. Bigints are grouped exactly, without
rounding through a float.

```ts
number("0501234567", { locale: "ar" }); // "٠٥٠١٢٣٤٥٦٧"
number("0501234567", { locale: "ar", group: true }); // "٠٥٠١٢٣٤٥٦٧"
number("+966501234567", { locale: "ar", group: true }); // "+٩٦٦٥٠١٢٣٤٥٦٧"
number("0123", { locale: "en", group: true }); // "0123"
number(123456789012345678901234567890n, { group: true }); // "123,456,789,012,345,678,901,234,567,890"
```

### `number()` does not format text

Anything that is not a number is returned exactly as it came in, with **no digit conversion**. If
you need digits shaped inside a sentence, an identifier, or any other text, that is
[`digits()`](#digits):

```ts
number("abc", { locale: "ar" }); // "abc"
number("order #42", { locale: "ar" }); // "order #42"  ← unchanged, use digits()
number("1,000", { locale: "ar", group: true }); // "1,000"
number("1e3", { locale: "ar", group: true }); // "1e3"
```

Non-finite numbers are returned as their text form rather than throwing:

```ts
number(Number.NaN, { group: true }); // "NaN"
number(Number.POSITIVE_INFINITY, { group: true }); // "Infinity"
```

Two details worth knowing about the grouped output:

- With `locale: "ar"` the thousands separator is `٬` (U+066C) and the Arabic decimal separator
  `٫` (U+066B) is normalised to `.` so the result stays easy to parse.
- Grouped values use the `Intl` defaults, which means at most 3 fraction digits:
  `number(1234.56789, { group: true })` is `"1,234.568"`.

---

## Digits

### `digits(value, style)`

Converts the digit glyphs inside arbitrary text. Nothing else about the string is touched.

| Argument | Type                  | Description                                          |
| -------- | --------------------- | ---------------------------------------------------- |
| `value`  | `string`              | The text to convert.                                 |
| `style`  | `"arabic" \| "latin"` | Target digit family. Required — there is no default. |

```ts
import { digits } from "arabic-kit";

digits("0123456789", "arabic"); // "٠١٢٣٤٥٦٧٨٩"
digits("order #42", "arabic"); // "order #٤٢"
digits("2026-09-28 18:30", "arabic"); // "٢٠٢٦-٠٩-٢٨ ١٨:٣٠"

digits("٢٠٢٦-٠٩-٢٨", "latin"); // "2026-09-28"
digits("۰۱۲۳۴۵۶۷۸۹", "latin"); // "0123456789"
```

Three digit families are recognised, and any of them converts to any of them:

| Family                          | Glyphs       | Code points   |
| ------------------------------- | ------------ | ------------- |
| Latin                           | `0123456789` | U+0030–U+0039 |
| Arabic-Indic                    | `٠١٢٣٤٥٦٧٨٩` | U+0660–U+0669 |
| Persian / extended Arabic-Indic | `۰۱۲۳۴۵۶۷۸۹` | U+06F0–U+06F9 |

```ts
digits("۰۱۲۳۴۵۶۷۸۹", "arabic"); // "٠١٢٣٤٥٦٧٨٩"  (normalised, not left as Persian)
digits("٠١٢٣٤٥٦٧٨٩", "latin"); // "0123456789"
```

Everything that is not a digit is preserved, and text without digits comes back unchanged:

```ts
digits("الفاتورة رقم 42 — 2026", "arabic"); // "الفاتورة رقم ٤٢ — ٢٠٢٦"
digits("Total: $1,299.00 (paid)", "arabic"); // "Total: $١,٢٩٩.٠٠ (paid)"
digits("(+966) 50-123-4567", "arabic"); // "(+٩٦٦) ٥٠-١٢٣-٤٥٦٧"
digits("مرحبا بالعالم!", "latin"); // "مرحبا بالعالم!"
digits("hello", "latin"); // "hello"
digits("", "arabic"); // ""
```

`digits()` never normalises separators, currency symbols or signs — that is number formatting. For
that, use [`number()`](#number):

```ts
digits("١٬٠٠٠", "latin"); // "1٬000"   ← the ٬ stays; it is not a digit
number(1000, { locale: "en", group: true }); // "1,000"
```

---

## Date

### `date(value, options?)`

`value` is an ISO calendar date string (`"YYYY-MM-DD"`) or a `Date` object.

| Option    | Type                          | Default  | Description                                                      |
| --------- | ----------------------------- | -------- | ---------------------------------------------------------------- |
| `locale`  | `"ar" \| "en"`                | `"en"`   | Formatting profile. See [Locale profiles](#locale-profiles).     |
| `month`   | `"none" \| "short" \| "long"` | `"none"` | `"none"` returns `YYYY-MM-DD`; the others render the month name. |
| `weekday` | `boolean`                     | `false`  | Prepend the weekday name. Only applies when `month` is a name.   |

### The ISO form is locale-independent by design

With the default `month: "none"`, `date()` returns the calendar date and nothing else. It does not
apply the locale, and it does not shape the digits — even for `locale: "ar"`. That is intentional:
this output exists to be stored, compared, submitted and parsed, so it must be identical no matter
where it is rendered.

```ts
date("2026-09-28"); // "2026-09-28"
date("2026-09-28", { locale: "ar" }); // "2026-09-28"  ← still Latin digits
date("2026-09-28", { month: "none" }); // "2026-09-28"

date("2026-09-28", { locale: "ar", month: "long" }); // "٢٨ سبتمبر ٢٠٢٦"  ← localized + Arabic digits
```

Ask for a month name when you want a date a human reads, and leave `month` alone when you want a
date a machine reads.

```ts
date("2026-09-28", { locale: "ar", month: "long" }); // "٢٨ سبتمبر ٢٠٢٦"
date("2026-09-28", { locale: "en", month: "long" }); // "September 28, 2026"
date("2026-09-28", { locale: "en", month: "short" }); // "Sep 28, 2026"
date("2026-09-28", { locale: "ar", month: "short" }); // "٢٨ سبتمبر ٢٠٢٦"
```

Arabic has no shorter month form, so `"short"` and `"long"` produce the same Arabic month name.
`month` accepts `"none" | "short" | "long"`; TypeScript rejects anything else at compile time.

Weekday names use the locale's own separator and capitalization:

```ts
date("2026-09-28", { locale: "ar", month: "long", weekday: true }); // "الاثنين، ٢٨ سبتمبر ٢٠٢٦"
date("2026-09-28", { locale: "en", month: "long", weekday: true }); // "Monday, September 28, 2026"
date("2024-02-29", { locale: "ar", month: "long", weekday: true }); // "الخميس، ٢٩ فبراير ٢٠٢٤"
```

A `Date` object works too:

```ts
date(new Date(2026, 8, 28), { locale: "ar", month: "long" }); // "٢٨ سبتمبر ٢٠٢٦"
```

### Behaviour for input that cannot be formatted

`date` never throws and never guesses. Dates are parsed as **local calendar dates**, so the output
does not shift with the machine timezone.

```ts
date(null); // ""
date(undefined); // ""
date(new Date("not a date")); // ""
date("28/09/2026"); // "28/09/2026" (unchanged)
date("2026-9-8"); // "2026-9-8" (unchanged, not zero padded)
date("2026-02-31"); // "2026-02-31" (unchanged, not a real date)
date("2026-13-01"); // "2026-13-01" (unchanged, not a real date)
```

---

## Time

### `time(value, options?)`

`value` is a wall-clock time string: `"HH:mm"` or `"HH:mm:ss"`.

| Option    | Type                            | Default  | Description                                                   |
| --------- | ------------------------------- | -------- | ------------------------------------------------------------- |
| `locale`  | `"ar" \| "en"`                  | `"en"`   | Formatting profile. See [Locale profiles](#locale-profiles).  |
| `digits`  | `"auto" \| "arabic" \| "latin"` | `"auto"` | `auto` follows the locale; the others force a digit style.    |
| `hour12`  | `boolean`                       | `false`  | Render the 12-hour clock with an AM/PM period.                |
| `seconds` | `boolean`                       | `false`  | Include seconds — only if the input already contains seconds. |

```ts
import { time } from "arabic-kit";

time("18:30"); // "18:30"
time("18:30", { locale: "ar" }); // "١٨:٣٠"
time("09:05", { hour12: true }); // "09:05 AM"
time("18:30", { hour12: true }); // "06:30 PM"
time("18:30", { locale: "ar", hour12: true }); // "٠٦:٣٠ م"
time("09:05", { locale: "ar", hour12: true }); // "٠٩:٠٥ ص"
```

`digits` is useful for the mixed styles real Arabic interfaces use — Latin digits for compactness,
an Arabic period for the clock:

```ts
time("18:30", { locale: "ar", digits: "latin", hour12: true }); // "06:30 م"
time("18:30", { locale: "en", digits: "arabic" }); // "١٨:٣٠"
```

Midnight and noon are handled for you:

```ts
time("00:00", { hour12: true }); // "12:00 AM"
time("00:00", { locale: "ar", hour12: true }); // "١٢:٠٠ ص"
time("12:00", { hour12: true }); // "12:00 PM"
time("12:30", { locale: "ar", hour12: true }); // "١٢:٣٠ م"
```

Seconds are never invented. Asking for seconds on a value that has none returns the value without
seconds:

```ts
time("18:30:45"); // "18:30"
time("18:30:45", { seconds: true }); // "18:30:45"
time("18:30", { seconds: true }); // "18:30"
time("18:30:45", { locale: "ar", hour12: true, seconds: true }); // "٠٦:٣٠:٤٥ م"
```

Unparsable input is returned unchanged:

```ts
time(null); // ""
time("25:00"); // "25:00"
time("18:5"); // "18:5"
time("8:30"); // "8:30"
time("18:30:99"); // "18:30:99"
```

---

## Locale profiles

`locale` is not a locale _detector_ and not an open locale system. It is a two-value switch between
two fixed profiles, chosen so the output is predictable on every runtime:

| Value  | Intl tag | Digit family     | Month names        | Period labels |
| ------ | -------- | ---------------- | ------------------ | ------------- |
| `"ar"` | `ar-EG`  | Arabic-Indic ٠-٩ | Arabic, Gregorian  | `ص` / `م`     |
| `"en"` | `en-US`  | Latin `0-9`      | English, Gregorian | `AM` / `PM`   |

Two things this is **not**:

- It is not a promise about every Arabic regional convention. `ar-EG` is the Egyptian profile:
  Eastern Arabic numerals, Gregorian month names, `ص` / `م`. Users who need Maghrebi, Levantine or
  Gulf-specific conventions are outside the scope of this package — see
  [Non-goals](#non-goals).
- It does not detect the user's language. Nothing reads `navigator.language` or the environment;
  the caller decides.

`"ar"` is pinned to `ar-EG` on purpose. `new Intl.NumberFormat("ar")` resolves to the `latn`
numbering system and would silently produce Latin digits, so the tag is fixed in one place.

---

## Stretch

### `stretch(text, amount?)`

Inserts the Arabic tatweel character (`ـ`, U+0640) between letters that connect, so a word can fill
a fixed width — a chart label, a table header, a logo-like title.

| Argument | Type     | Default | Description                                                       |
| -------- | -------- | ------- | ----------------------------------------------------------------- |
| `text`   | `string` | —       | The text to stretch.                                              |
| `amount` | `number` | `1`     | Tatweel characters added per join. Truncated, and clamped to ≥ 0. |

```ts
import { stretch } from "arabic-kit";

stretch("مرحبا"); // "مـرحـبـا"
stretch("مرحبا", 2); // "مــرحــبــا"
stretch("مرحبا", 3); // "مـــرحـــبـــا"
```

`amount` stays a plain second argument: an options object would add ceremony to the only decision
this function has.

The rules are the ones a typesetter would use:

- **No tatweel after the last letter** of a word.
- **No tatweel after a non-connecting letter.** These letters end a word, so the join that follows
  them does not exist: `ا` `أ` `إ` `آ` `د` `ذ` `ر` `ز` `و` `ؤ` `ئ` `ء` `ة` `ى`.
- **Diacritics stay attached** to the letter they sit on, and the pair is stretched together.
- **Non-Arabic content is left alone**, so mixed text is safe.

```ts
stretch("أحمد", 3); // "أحـــمـــد"
stretch("مُحَمَّد", 2); // "مُــحَــمَّــد"
stretch("مرحبا بالعالم", 2); // "مــرحــبــا بــالــعــالــم"
stretch("Hello", 2); // "Hello"
stretch("2026", 2); // "2026"
stretch("مرحبا 2026", 2); // "مــرحــبــا 2026"
stretch("مرحباً، بالعالم!", 2); // "مــرحــبــاً، بــالــعــالــم!"
```

Whitespace between words is normalised to a single space, which is what a fixed-width label wants:

```ts
stretch("  مرحبا   بالعالم  ", 1); // " مـرحـبـا بـالـعـالـم "
```

Amounts are sanitised instead of throwing:

```ts
stretch("مرحبا", 0); // "مرحبا"
stretch("مرحبا", -3); // "مرحبا"
stretch("مرحبا", 1.9); // "مـرحـبـا"
stretch("مرحبا", Number.NaN); // "مرحبا"
```

---

## API reference

| Export          | Kind     | Signature                                                                                 | Summary                                            |
| --------------- | -------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `number`        | function | `(value: NumberInput, options?: NumberOptions) => string`                                 | Locale-aware number formatting and grouping.       |
| `digits`        | function | `(value: string, style: DigitStyle) => string`                                            | Digit conversion inside arbitrary text.            |
| `date`          | function | `(value: DateInput, options?: DateOptions) => string`                                     | ISO dates, month names, weekday names.             |
| `time`          | function | `(value: TimeInput, options?: TimeOptions) => string`                                     | 12/24-hour times with `ص` / `م`.                   |
| `stretch`       | function | `(text: string, amount?: number) => string`                                               | Arabic text stretching with tatweel.               |
| `Locale`        | type     | `"ar" \| "en"`                                                                            | Formatting profile.                                |
| `DigitStyle`    | type     | `"arabic" \| "latin"`                                                                     | Digit family accepted by `digits` and the options. |
| `MonthStyle`    | type     | `"none" \| "short" \| "long"`                                                             | Month rendering style.                             |
| `NumberInput`   | type     | `string \| number \| bigint \| null \| undefined`                                         | Accepted number input.                             |
| `DateInput`     | type     | `string \| Date \| null \| undefined`                                                     | Accepted date input.                               |
| `TimeInput`     | type     | `string \| null \| undefined`                                                             | Accepted time input.                               |
| `NumberOptions` | type     | `{ locale?: Locale; digits?: DigitStyle \| "auto"; group?: boolean }`                     | `number` options.                                  |
| `DateOptions`   | type     | `{ locale?: Locale; month?: MonthStyle; weekday?: boolean }`                              | `date` options.                                    |
| `TimeOptions`   | type     | `{ locale?: Locale; digits?: DigitStyle \| "auto"; hour12?: boolean; seconds?: boolean }` | `time` options.                                    |

Subpath entry points: `arabic-kit`, `arabic-kit/number`, `arabic-kit/digits`, `arabic-kit/date`,
`arabic-kit/time`, `arabic-kit/stretch`. Each subpath exports its own function and types; the shared
`Locale` and `DigitStyle` types are exported from the root entry point.

---

## Real-world examples

### Dashboard KPI tiles

```ts
import { date, number } from "arabic-kit";

const tiles = [
  { label: "إجمالي الطلبات", value: 1284730, period: "2026-09-28" },
  { label: "المتوسط", value: 154.87, period: "2026-09-28" },
];

for (const tile of tiles) {
  console.log(
    `${tile.label}: ${number(tile.value, { locale: "ar", group: true })}`,
  );
  console.log(date(tile.period, { locale: "ar", month: "long" }));
}

// إجمالي الطلبات: ١٬٢٨٤٬٧٣٠
// ٢٨ سبتمبر ٢٠٢٦
// المتوسط: ١٥٤.٨٧
// ٢٨ سبتمبر ٢٠٢٦
```

### Admin table

```ts
import { number, time } from "arabic-kit";

type Order = { id: string; total: number; createdAt: string };

const orders: Order[] = [
  { id: "ORD-2026-00412", total: 8490, createdAt: "14:05" },
  { id: "ORD-2026-00413", total: 1290.5, createdAt: "18:30" },
];

for (const order of orders) {
  console.log(
    order.id,
    number(order.total, { locale: "ar", group: true }),
    time(order.createdAt, { locale: "ar", hour12: true }),
  );
}

// ORD-2026-00412 ٨٬٤٩٠ ٠٢:٠٥ م
// ORD-2026-00413 ١٬٢٩٠.٥ ٠٦:٣٠ م
```

### Form input typed in Arabic

A search box or national-ID field receives Arabic-Indic digits from the keyboard. Normalise with
`digits()` before validating, and shape the display value with `number()`.

```ts
import { date, digits, number } from "arabic-kit";

function onNationalIdInput(typed: string): string {
  return digits(typed, "latin").replace(/\D/g, "").slice(0, 10);
}

function onDateInput(typed: string): string {
  return date(digits(typed, "latin"), { locale: "ar", month: "long" });
}

onNationalIdInput("١٠٩٨٧٦٥٤٣٢"); // "1098765432"
onDateInput("2026-09-28"); // "٢٨ سبتمبر ٢٠٢٦"
onDateInput("٢٠٢٦-٠٩-٢٨"); // "٢٨ سبتمبر ٢٠٢٦"
number("1098765432", { digits: "arabic" }); // "١٠٩٨٧٦٥٤٣٢"
```

More scenarios — universities, government forms, CSV reports, SaaS dashboards — plus React, Vue,
Node and browser integrations live in [`examples/`](./examples/README.md).

---

## Native Intl

`arabic-kit` and `Intl` are not competitors.

| Concern                                       | Who owns it                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Number grouping, digits                       | `Intl.NumberFormat` under the hood via `number({ group: true })`           |
| Month and weekday names, ordering, separators | `Intl.DateTimeFormat` under the hood via `date({ month: ... })`            |
| Digit glyphs inside text                      | `arabic-kit` — `digits()` covers what `Intl` will not touch                |
| Identifiers, phones, national IDs             | `arabic-kit` — grouping is skipped, digits are shaped                      |
| Wall-clock time strings                       | `arabic-kit` — `Intl` cannot format a time without a `Date` and a timezone |
| Arabic text stretching                        | `arabic-kit` — not an `Intl` concern                                       |

Two decisions follow from this:

1. **Use `arabic-kit` for application output.** It saves you from writing the locale tag table, the
   digit replacements and the "should I group this string?" rule by hand.
2. **Use `Intl` directly when you are already formatting a `Date` for a locale you support** and do
   not need the Arabic-specific guarantees. `arabic-kit` does not wrap `Intl` to hide it; it uses
   it, and adds the parts `Intl` deliberately leaves to you.

Time is the one area where `arabic-kit` does not delegate. `Intl.DateTimeFormat` formats a
`Date`, so formatting `"18:30"` would mean inventing a `Date` in some timezone and hoping the
runtime's ICU data matches. `time` therefore validates the string and renders it deterministically,
which is why `time("18:30", { locale: "ar" })` is always `"١٨:٣٠"`.

---

## Non-goals

`arabic-kit` is deliberately narrow. It does **not** do:

- currency or money formatting,
- number-to-words (tafqit),
- OCR, NLP, stemming or translation,
- Hijri / Islamic calendar conversion,
- regional Arabic locale packs beyond the `ar-EG` profile,
- framework bindings (React hooks, Vue composables),
- locale files or runtime configuration.

If you need one of those, keep it in your application or in a separate package. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for why the project is scoped this way.

---

## Documentation

| Document                             | Read it when                                              |
| ------------------------------------ | --------------------------------------------------------- |
| [examples/](./examples/README.md)    | You want React, Vue, Node, browser or full-scenario code. |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | You want to know where a piece of code belongs.           |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | You are about to open a pull request.                     |
| [DEVELOPMENT.md](./DEVELOPMENT.md)   | You are setting up the repo or publishing a release.      |
| [AI_GUIDE.md](./AI_GUIDE.md)         | You are an AI coding agent modifying this repository.     |

## License

MIT
