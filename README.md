# Pocket Ledger

A small, accessible expense tracker for students. Add expenses, search them with regular expressions, watch a monthly cap, and keep everything in your own browser.

**Demo video:** add your link here
**Live site:** add your GitHub Pages link here

## Features
- Add, edit and delete expenses with live regex validation
- Regex search with highlighted matches and a safe compiler (invalid patterns show a message, never crash)
- Six sort orders
- Dashboard: record count, total, top category, 7-day chart
- Monthly cap with a polite or assertive live announcement
- Three currencies with editable rates (display only; amounts are stored in the base currency)
- localStorage persistence
- JSON export and import with validation (a bad file changes nothing)

## Run it
Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000

## Tests
Open `tests.html`. It prints PASS or FAIL for each assertion.

## Sample data
Settings > Import JSON > pick `seed/seed.json`. It has edge cases: zero amount, one-letter description, huge amount, HTML characters, accented text, a leap day.

## Regex catalogue
| Field | Pattern | Purpose |
|---|---|---|
| Description | `^\S(?:.*\S)?$` | No edge whitespace |
| Amount | `^(0\|[1-9]\d*)(\.\d{1,2})?$` | Up to 2 decimals |
| Date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | YYYY-MM-DD (plus calendar check) |
| Category | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Letters, spaces, hyphens |
| Duplicate word (advanced) | `\b(\w+)\s+\1\b` | Back-reference, catches "the the" |
| Currency code | `^[A-Z]{3}$` | Settings |

Search examples: `coffee|tea`, `\.\d{2}\b`, `^2025-1`.

## Keyboard map
| Key | Action |
|---|---|
| Tab / Shift+Tab | Move between controls |
| Enter / Space | Activate buttons, submit forms |
| First Tab stop | "Skip to content" |
| Arrow keys | Change a dropdown |
| Esc | Close the delete confirmation |

## Accessibility
Semantic landmarks, visible labels, errors linked with aria-describedby and aria-invalid, live regions, chart text alternative, visible focus ring, reduced-motion support. See `docs/spec.md` and `docs/a11y-audit.md`.

## Project layout
    index.html        page
    tests.html        assertions
    styles/main.css   styles
    scripts/          validators.js, search.js, app.js
    seed/seed.json    sample data
    docs/             spec,audit

## Author
RUHIGIRA IRIZA Gianne Elyse, [GitHub](https://github.com/eruhigira-tech), e.ruhigira@alustudent.com
