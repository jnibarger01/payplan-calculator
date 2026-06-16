# Service Advisor Pay Plan Calculator

React + TypeScript + Vite calculator using the selected dark/neon UI direction.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

## UI direction implemented

- Dark dashboard style matching the selected mockup
- Old Plan / New Plan segmented switch
- New Plan selected by default
- No hours-worked or minimum-wage fields
- Inputs limited to sales numbers:
  - Customer Pay Parts & Labor
  - Warranty Parts & Labor
  - Internal Parts & Labor
  - Sublet only appears on the Old Plan tab
- Monthly guarantee card/toggle for the New Plan
- Training guarantee card/toggle for the Old Plan
- Result tiles for base, bonus, warranty, internal, total estimate, and effective CP rate

## New plan formula

- Customer Pay base: 4.0%
- CP bonus increase starts at $25,000 CP
- CP bonus increase adds 0.25% for each additional $500
- CP bonus increase caps at 4.0%
- Total CP cap: 8.0%
- Warranty: 4.0%
- Internal: 2.5%

## Old plan formula currently shown

- CP: 7.0%
- Warranty: 5.0%
- Internal: 5.0%
- Sublet: 0.5%
- Training guarantee toggle

The old JC-1035 monthly bonus logic is still available in `src/payPlans.ts`, but this UI keeps the visible form clean.
