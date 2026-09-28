# Development

Everything you need to work on `arabic-kit` locally.

- [Requirements](#requirements)
- [Installation](#installation)
- [Commands](#commands)
- [Project structure](#project-structure)
- [Adding a feature](#adding-a-feature)
- [Verifying a change before publishing](#verifying-a-change-before-publishing)
- [Publishing](#publishing)
- [Troubleshooting](#troubleshooting)

---

## Requirements

| Tool    | Version | Notes                                                             |
| ------- | ------- | ----------------------------------------------------------------- |
| Node.js | >= 18   | Node 20+ recommended; tests need full ICU (default since Node 13) |
| npm     | >= 9    | pnpm and yarn work too                                            |

There is no global tooling to install: TypeScript, Vitest, ESLint and Prettier are dev
dependencies pinned in `package-lock.json`.

---

## Installation

```bash
git clone <your fork>
cd arabic-kit
npm install
```

Verify the checkout is healthy before you change anything:

```bash
npm run validate
```

Expected output: formatting check passes, no lint errors, no type errors, all tests pass, and
`dist/` is produced.

---

## Commands

| Command                | What it does                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run build`        | Cleans `dist/` and compiles `src/` to ESM + `.d.ts` with `tsc`.     |
| `npm run clean`        | Removes `dist/`.                                                    |
| `npm run typecheck`    | Type-checks `src/` (including tests) without emitting.              |
| `npm test`             | Runs the test suite once with Vitest.                               |
| `npm run test:watch`   | Runs Vitest in watch mode.                                          |
| `npm run lint`         | ESLint with type-aware rules; warnings are errors.                  |
| `npm run lint:fix`     | ESLint with autofix.                                                |
| `npm run format`       | Rewrites files with Prettier.                                       |
| `npm run format:check` | Fails if any file is not Prettier-formatted.                        |
| `npm run validate`     | `format:check` + `lint` + `typecheck` + `test` + `build`. The gate. |

`npm run validate` is the only command you need. Run it before every commit and before every
publish.

### Smoke-testing the built package

`npm run build` emits real ESM, so you can run the output with Node directly:

```bash
node --input-type=module -e '
  import { digits, number, time } from "./dist/index.js";
  console.log(number(123456, { locale: "ar", group: true }));
  console.log(digits("order #42", "arabic"));
  console.log(time("18:30", { locale: "ar", hour12: true }));
'
```

Expected:

```text
١٢٣٬٤٥٦
order #٤٢
٠٦:٣٠ م
```

The subpath entry points work the same way:

```bash
node --input-type=module -e '
  import { digits } from "./dist/digits/index.js";
  console.log(digits("۰۱۲۳۴۵۶۷۸۹", "arabic"));
'
node --input-type=module -e '
  import { stretch } from "./dist/stretch/index.js";
  console.log(stretch("مرحبا", 2));
'
```

---

## Project structure

```text
arabic-kit/
├── src/
│   ├── index.ts               # public entry point (re-exports only)
│   ├── number/                # number
│   ├── digits/                # digits
│   ├── date/                  # date
│   ├── time/                  # time
│   ├── stretch/               # stretch
│   ├── locale/                # Locale, DigitStyle, LOCALE_TAGS
│   ├── utils/                 # helpers shared by 2+ areas
│   └── __tests__/             # public-api + readme-examples
├── examples/                  # runnable examples, not published
├── tests are colocated:       # src/<area>/__tests__/<name>.test.ts
├── docs
│   ├── ARCHITECTURE.md        # where code belongs
│   ├── CONTRIBUTING.md        # workflow + conventions
│   ├── DEVELOPMENT.md         # this file
│   ├── AI_GUIDE.md            # rules for AI coding agents
│   └── README.md              # user-facing documentation
├── eslint.config.js           # flat config, type-aware rules
├── tsconfig.json              # editor + typecheck config
├── tsconfig.build.json        # emit config (excludes tests)
├── package.json               # exports map, scripts, metadata
└── .prettierrc.json           # formatting
```

`tsconfig.json` and `tsconfig.build.json` differ in exactly one way: the build config emits and
excludes `__tests__`. Keep them in sync when you add compiler options.

`tsconfig.json` includes only `src`, so `examples/` is neither type-checked nor covered by the
type-aware ESLint rules. That is why the examples are `.mjs`, `.html`, `.tsx` and `.vue` instead of
`.ts`; keep that extension choice when adding one, or extend `include` deliberately.

---

## Adding a feature

Full recipes live in [ARCHITECTURE.md](./ARCHITECTURE.md#recipes). The short version:

1. **Place it.** Behaviour that belongs to one area goes in that area's folder. Logic needed by two
   or more areas goes to `src/utils/`. Anything else is a sign the feature does not belong in this
   package.
2. **Prefer an option.** The public surface is `number`, `digits`, `date`, `time`, `stretch`. A new
   user-facing variation is a new property in the area's options interface, not a new function.
3. **Implement it** as a small function with an explicit return type. Extract helpers only when a
   function grows past one clear job.
4. **Type it** in the area's `types.ts` (public) or next to the function (internal).
5. **Test it** in `src/<area>/__tests__/<name>.test.ts`: the happy path, the default, the edge cases
   (empty, invalid, zero, negative) and every option.
6. **Export it** from the area's `index.ts`, then from `src/index.ts`. If you added a new area,
   register its subpath in `package.json`.
7. **Document it**: README section, options table, API reference row, examples in
   `src/__tests__/readme-examples.test.ts`, and `ARCHITECTURE.md` if the layout changed.
8. **Run** `npm run validate`.

---

## Verifying a change before publishing

Run, in this order:

```bash
npm run validate
npm pack --dry-run
```

`npm pack --dry-run` prints the exact file list that would be published. Confirm it contains only
`dist/`, `README.md`, `LICENSE` and `package.json`, and that `dist/` contains no test files.

Then check the tarball in isolation — the best end-to-end verification of the public API:

```bash
npm pack
mkdir -p /tmp/arabic-kit-smoke && cd /tmp/arabic-kit-smoke
npm init -y >/dev/null && npm pkg set type=module
npm install /path/to/arabic-kit-1.0.0.tgz
node --input-type=module -e '
  import { date, digits, number, stretch, time } from "arabic-kit";
  console.log(number(123456, { locale: "ar", group: true }));
  console.log(date("2026-09-28", { locale: "ar", month: "long", weekday: true }));
  console.log(time("18:30", { locale: "ar", hour12: true }));
  console.log(stretch("مرحبا", 2));
  console.log(digits("order #42", "arabic"), digits("۰۱۲۳۴۵۶۷۸۹", "latin"));
'
node --input-type=module -e '
  import { time } from "arabic-kit/time";
  console.log("subpath ok:", time("09:05", { hour12: true }));
'
node --input-type=module -e '
  import { digits } from "arabic-kit/digits";
  console.log("digits subpath ok:", digits("2026", "arabic"));
'
```

Expected:

```text
١٢٣٬٤٥٦
الاثنين، ٢٨ سبتمبر ٢٠٢٦
٠٦:٣٠ م
مــرحــبــا
order #٤٢ 0123456789
subpath ok: 09:05 AM
digits subpath ok: ٢٠٢٦
```

Finally, check the type declarations resolve for a consumer:

```bash
cat > check.ts <<'EOF'
import { date, type DateOptions, type Locale } from "arabic-kit";

const locale: Locale = "ar";
const options: DateOptions = { locale, month: "long", weekday: true };
const formatted: string = date("2026-09-28", options);
export default formatted;
EOF
npx tsc --noEmit --strict --module nodenext --moduleResolution nodenext check.ts
```

---

## Publishing

`prepublishOnly` runs `npm run validate`, and `prepack` runs the build, so a broken tree cannot be
published accidentally.

```bash
npm version minor     # or patch / major
npm publish           # runs validate + build first
```

Before the first publish, a maintainer should fill in the metadata that must not be invented:
`repository`, `bugs`, `homepage` and `author` in `package.json`. The package intentionally ships
without them rather than with placeholder URLs.

---

## The playground site

`playground/` is a static page that calls the built package in the browser. It is published to
GitHub Pages by `.github/workflows/deploy-pages.yml`, which runs on every push to `main`:

1. `npm ci` and `npm run build`
2. `node .github/scripts/assemble-pages.mjs` writes `.pages-out/`, containing `index.html` (the
   playground page itself), `playground.js`, `dist/`, `404.html` and `.nojekyll`
3. `actions/upload-pages-artifact` and `actions/deploy-pages` publish it

To test the exact site locally:

```bash
npm run build
node .github/scripts/assemble-pages.mjs
npx http-server .pages-out -p 8080
```

`.pages-out/` is generated; it is ignored by git, Prettier and ESLint.

### One-time setup

The workflow cannot create the Pages site by itself. `actions/configure-pages` can only enable
Pages when it is given a token other than the default `GITHUB_TOKEN`, so a maintainer must enable it
once under **Settings → Pages → Build and deployment → Source: GitHub Actions**. Until that is done,
the `Configure Pages` step fails and the site returns 404.

This setting must stay on **GitHub Actions**. If it is switched to **Deploy from a branch**, Pages
serves a Jekyll build of `main` instead of the workflow artifact: the root becomes GitHub's generated
README page and `dist/` is missing, because it is gitignored and so cannot exist in a branch build.
The workflow still reports success in that state, so check the served page, not just the run.

### URL layout

| URL              | Serves                                                     |
| ---------------- | ---------------------------------------------------------- |
| `/`              | `index.html`, the playground — the site homepage           |
| `/dist/…`        | the built package, loaded by the import map                |
| `/playground/…`  | nothing; the playground is only published at the site root |
| any unknown path | `404.html`, which redirects to `./` (the homepage)         |

The page is authored in `playground/`, where the built package sits at `../dist/`, and the assembly
step publishes it at the site root, where it sits at `./dist/`. That single import map rewrite is
asserted by `assemble-pages.mjs`, which fails if the map is missing, duplicated, or if the page still
contains an absolute `/playground/` URL. The target must stay **relative**: an absolute
`/dist/index.js` resolves to the domain root and breaks under `https://<user>.github.io/<repo>/`.

---

## Troubleshooting

| Problem                                                     | Fix                                                                                                                                                                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Site root shows GitHub's README page, `/dist/index.js` 404s | The Pages source was switched to **Deploy from a branch**, so Pages serves a Jekyll build of `main` and the gitignored `dist/` is absent. Set the source back to **GitHub Actions** and re-run the workflow. |
| `Cannot find module '@/constants/...'`                      | Path aliases are not part of this project. Use relative imports with the `.js` extension (`../utils/digits.js`) — required by `moduleResolution: nodenext`.                                                  |
| A test fails only on CI                                     | Check the Node/ICU version: Arabic month and weekday names come from ICU data. Node 18+ ships full ICU.                                                                                                      |
| `tsc` emits test files into `dist/`                         | `tsconfig.build.json` must keep `"exclude": ["src/**/__tests__/**"]`.                                                                                                                                        |
| ESLint: "not found by the project service"                  | The file is outside `tsconfig.json`'s `include`, which is `["src"]`. Move it into `src/`, or extend `include`.                                                                                               |
| Arabic text looks scrambled in a diff or editor             | This is Unicode bidi, not corruption. The tests assert exact code points; trust the tests.                                                                                                                   |
| `npm run clean` fails on Windows                            | The script uses `node -e`, which works in cmd and PowerShell. Do not replace it with `rm -rf`.                                                                                                               |
