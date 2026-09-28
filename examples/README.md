# examples

Runnable examples for `arabic-kit`. The README keeps the three shortest snippets; everything larger
lives here.

| File                               | Shows                                                            |
| ---------------------------------- | ---------------------------------------------------------------- |
| [`node.mjs`](./node.mjs)           | Node.js CLI: formatting a daily report from plain data.          |
| [`scenarios.mjs`](./scenarios.mjs) | Full domain scenarios: university, government, SaaS, CSV export. |
| [`browser.html`](./browser.html)   | Zero-build browser usage via an ESM import map.                  |
| [`react.tsx`](./react.tsx)         | React: formatting at render time, normalising form input.        |
| [`vue.vue`](./vue.vue)             | Vue: a computed display string for a template.                   |

## Run the Node examples

```bash
npm run build
node examples/node.mjs
node examples/scenarios.mjs
```

Both files import `"arabic-kit"` by name, which Node resolves to `dist/` through the package's own
`exports` map. Build first.

## Use the framework examples

`react.tsx` and `vue.vue` are reference snippets: drop the relevant function into your component and
adapt the props. `arabic-kit` has no framework dependency and ships no bindings — formatting is
plain function calls, so no provider, hook, plugin or wrapper component is required.

## Try it in a browser

`browser.html` runs with no build step. Serve the repository root over HTTP and open the file, or
paste the import map into your own scratch page:

```bash
npx http-server . -p 8080
# then open http://localhost:8080/examples/browser.html
```
