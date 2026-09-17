# Checklist App

A standalone checklist app: plain HTML, CSS, and vanilla JavaScript — no
framework, no build step, zero runtime dependencies. Add items, check them
off, delete them, and filter by all / active / done. State persists in the
browser's localStorage, with light and dark themes and accessible controls.

## Structure

| File | Role |
| --- | --- |
| `index.html` | Page shell |
| `styles.css` | Styling (light + dark, no framework) |
| `app.js` | UI layer: DOM wiring, localStorage persistence |
| `lib/checklist.js` | Pure ES module with all checklist logic (add / toggle / remove / clear-completed / filter / count) |
| `test/checklist.test.js` | Tests for the pure module |
| `.github/workflows/ci.yml` | GitHub Actions: runs the test suite on Node 20 |

## Run it locally

Module scripts need HTTP, so serve the repo root:

```sh
python3 -m http.server 8080
# or: npx serve .
```

Then open <http://localhost:8080>. Items persist in the browser's
localStorage under the key `checklist-app:items:v1`.

## Test it

```sh
npm test        # → node --test test/
```

No dependency install is needed — the tests use Node's built-in test
runner (Node 18+; CI pins Node 20).

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs `npm test` on Node 20 for
every pull request and every push to `main`.
