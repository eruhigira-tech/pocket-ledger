# Pocket Ledger: Spec, Wireframes and Accessibility Plan

## Purpose
A student finance tracker. Add expenses, search them with regex, see totals, watch a monthly cap. All data stays in the browser (localStorage). No backend.

## User stories
1. I add an expense in under 10 seconds and see it in the list.
2. I find past spending with a search like `(coffee|tea)` and see matches highlighted.
3. I am warned when I pass my monthly cap, including with a screen reader.
4. I switch the display currency without changing stored data.
5. I back up my data to JSON and restore it later.

## Data model

### Record
| Field | Type | Rule |
|---|---|---|
| id | string | `rec_0001` style, unique |
| description | string | no edge whitespace, not empty, no repeated word |
| amount | number | base currency, >= 0, max 2 decimals |
| category | string | letters, single spaces or hyphens between words |
| date | string | `YYYY-MM-DD`, a real calendar date |
| createdAt | ISO string | set on add |
| updatedAt | ISO string | set on add and edit |

### Settings
| Field | Example | Rule |
|---|---|---|
| base | USD | 3 capital letters |
| c2, c3 | RWF, EUR | 3 capital letters, all three different |
| r2, r3 | 1450, 0.92 | number > 0, "1 base equals r units" |
| cap | 300 | same shape as an amount |
| cats | Food, Books | comma separated, each passes the category rule |

Storage: one localStorage key `ledger:v1` holding `{ settings, records }`.

## Regex rules
| # | Field | Pattern |
|---|---|---|
| 1 | description | `^\S(?:.*\S)?$` |
| 2 | amount | `^(0\|[1-9]\d*)(\.\d{1,2})?$` |
| 3 | date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` plus a calendar check |
| 4 | category | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` |
| 5 (advanced) | description | `\b(\w+)\s+\1\b` back-reference, catches "the the" |
| 6 | currency code | `^[A-Z]{3}$` |

## Wireframes

Mobile (single column):
```
+--------------------------+
| Pocket Ledger            |
| Dash Add Set Recs About  |
+--------------------------+
| DASHBOARD                |
|  12 records | total      |
|  top category | [curr v] |
|  cap message             |
|  7-day bars              |
+--------------------------+
| ADD AN EXPENSE (form)    |
+--------------------------+
| SETTINGS (form)          |
+--------------------------+
| RECORDS                  |
|  Search [regex]          |
|  Sort [v]  [x] Ignore case|
|  card per record         |
|   [Edit] [Delete]        |
+--------------------------+
```

Desktop (1024px+):
```
+----------------------------------------------+
| Pocket Ledger   Dashboard Add Settings ...   |
+----------------------------------------------+
| DASHBOARD (full width)                       |
+----------------------+-----------------------+
| ADD AN EXPENSE       | SETTINGS              |
+----------------------+-----------------------+
| RECORDS: real table (full width)             |
+----------------------------------------------+
```
Breakpoints: 480px, 768px, 1024px.

## Accessibility plan
- One h1, h2 per section, landmarks (header, nav, main, footer).
- Skip link is the first focusable element.
- Every input has a visible label. Row buttons have aria-labels.
- Errors sit under the field, linked with aria-describedby, and set aria-invalid. Never colour alone.
- Status messages use role="status". The cap message is polite under the cap and assertive when over.
- The bar chart has role="img" and a text alternative.
- Visible focus ring. Keyboard-only use must work everywhere.
- Animations are disabled under prefers-reduced-motion.
- Text contrast of 4.5:1 or better.
