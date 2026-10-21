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

## September 2026 compensation plan

The **2026 Plan** tab implements the uploaded Jay Wolfe Honda service-advisor compensation agreement effective September 1, 2026. The earlier Old/New plan tabs remain available for historical comparisons.

- Customer-pay and warranty **individually written labor gross** each earn 11% (under 2 years), 12% (2–under 5), 13% (5–under 7), 14% (7–under 10), or 15% (10+).
- Monthly production bonuses are non-cumulative threshold payouts for alignments, tire sales dollars, B services, tire balances, brake fluid, 2 services, and wipers/inserts.
- Honda survey bonuses: $250 for each qualified category, plus $250 when all three qualify.
- The draw already paid is deducted only in the separate remaining-after-draw estimate. The agreement specifies a $4,000 draw paid on the 10th and 25th, but does not clearly state its reconciliation details; the user enters the amount already paid.
- Gross figures exclude tax withholding, payroll adjustments, and initial/final month proration. Survey qualification is manually confirmed.
- The compensation agreement has no separate commission rate for internal parts/labor or sublet in the 2026 plan, so those are not included.

### Verification examples

- 5 years, $10,000 CP labor gross, $2,000 warranty labor gross → $1,560 labor commission.
- 75 alignments → $750, not the sum of prior tiers.
- $8,999 tire sales → $300; $9,000 → $350.
- All three Honda survey categories qualified → $1,000.
- $1,560 earned and $1,000 draw already paid → $560 remaining before other adjustments.

