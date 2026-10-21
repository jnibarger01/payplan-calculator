import { calculateCompensation2026, defaultCompensation2026, type Compensation2026Input } from "./compensation2026";
import { useMemo, useState } from "react";
import {
  calculateNewPlan,
  calculateOldPlan,
  formatCurrency,
  formatPercent,
  NewPlanInput,
  ObjectiveFlags,
  OldPlanInput,
  PayPlanResult,
} from "./payPlans";

type PlanKey = "old" | "new" | "2026";

type ResultTile = {
  title: string;
  value: string;
  subtext: string;
  tone: "green" | "purple" | "blue" | "white" | "glow";
  icon: string;
};

const objectivesOff: ObjectiveFlags = {
  alignments: false,
  totalLaborGross: false,
  cpLaborGross: false,
  hagProducts: false,
  cpLaborGrossPerRo: false,
  hoursPerCpro: false,
};

const defaultNewInput: NewPlanInput = {
  periodCp: 25_000,
  periodWarranty: 5_000,
  periodInternal: 3_000,
  guaranteeEnabled: true,
  guaranteeFloor: 3_000,
  hoursWorked: 0,
  minimumWage: 0,
};

const defaultOldInput: OldPlanInput = {
  biweeklyCp: 25_000,
  biweeklyWarranty: 5_000,
  biweeklyInternal: 3_000,
  biweeklySublet: 0,
  monthlyCp: 25_000,
  monthlyWarranty: 5_000,
  reviewCount: 0,
  trainingGuaranteeEnabled: false,
  hoursWorked: 0,
  minimumWage: 0,
  objectives: objectivesOff,
};

function cleanNumber(value: string): number {
  const parsed = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function rowAmount(result: PayPlanResult, label: string): number {
  return result.rows.find((row) => row.label === label)?.amount ?? 0;
}

function MoneyField({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  accent: "green" | "purple" | "blue";
}) {
  return (
    <label className={`money-field ${accent}`}>
      <span className="field-label">{label}<i>?</i></span>
      <div className="money-input">
        <span>$</span>
        <input
          inputMode="decimal"
          value={String(value)}
          onChange={(event) => onChange(cleanNumber(event.target.value))}
        />
      </div>
    </label>
  );
}

function PlanToggle({ activePlan, setActivePlan }: { activePlan: PlanKey; setActivePlan: (plan: PlanKey) => void }) {
  return (
    <div className="plan-toggle" role="tablist" aria-label="Pay plan selector">
      <button className={activePlan === "2026" ? "active" : ""} onClick={() => setActivePlan("2026")}>2026 Plan</button>
      <button className={activePlan === "old" ? "active" : ""} onClick={() => setActivePlan("old")}>Old Plan</button>
      <button className={activePlan === "new" ? "active" : ""} onClick={() => setActivePlan("new")}>New Plan <span>NEW</span></button>
    </div>
  );
}

function GuaranteeCard({
  activePlan,
  checked,
  onChange,
}: {
  activePlan: PlanKey;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="guarantee-card">
      <div className="small-icon shield">◇</div>
      <div>
        <strong>{activePlan === "new" ? "$3,000 Monthly Guarantee" : "$1,500 Training Guarantee"}</strong>
        <p>{activePlan === "new" ? "Apply monthly guarantee if total pay is less than $3,000" : "First 4 bi-weekly pay periods only"}</p>
      </div>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch" />
    </label>
  );
}

function AtGlance({ activePlan }: { activePlan: PlanKey }) {
  if (activePlan === "old") {
    return (
      <section className="panel glance">
        <h2><span className="rocket">↗</span> Old Plan at a Glance</h2>
        <div className="glance-grid old-glance">
          <div>
            <b className="pill green">CP</b>
            <h3>Customer Pay<br />Parts & Labor</h3>
            <ul>
              <li><b>7.0%</b> on CP sales</li>
              <li>Monthly CP bonus tiers begin at $35,000</li>
              <li>Review gates apply to monthly bonus</li>
            </ul>
          </div>
          <div>
            <b className="pill purple">W</b>
            <h3>Warranty<br />Parts & Labor</h3>
            <ul><li><b>5.0%</b> of warranty parts & labor</li></ul>
          </div>
          <div>
            <b className="pill blue">I</b>
            <h3>Internal<br />Parts & Labor</h3>
            <ul><li><b>5.0%</b> of internal parts & labor</li></ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel glance">
      <h2><span className="rocket">↗</span> New Plan at a Glance</h2>
      <div className="glance-grid">
        <div>
          <b className="pill green">CP</b>
          <h3>Customer Pay<br />Parts & Labor</h3>
          <ul>
            <li><b>4.0%</b> base on all CP sales</li>
            <li>Bonus starts at $25,000</li>
            <li>+0.25% for every $500 over $25,000</li>
            <li>Extra bonus capped at 4.0%</li>
            <li>Max total CP rate = <b className="good">8.0%</b></li>
          </ul>
        </div>
        <div>
          <b className="pill purple">◇</b>
          <h3>Warranty<br />Parts & Labor</h3>
          <ul><li><b>4.0%</b> of warranty parts & labor</li></ul>
        </div>
        <div>
          <b className="pill blue">🔧</b>
          <h3>Internal<br />Parts & Labor</h3>
          <ul><li><b>2.5%</b> of internal parts & labor</li></ul>
        </div>
      </div>
    </section>
  );
}

function ResultGrid({ tiles }: { tiles: ResultTile[] }) {
  return (
    <section className="panel results-panel">
      <h2><span className="chart">⌁</span> Your Estimated Monthly Pay</h2>
      <div className="result-grid">
        {tiles.map((tile) => (
          <article className={`result-tile ${tile.tone}`} key={tile.title}>
            <div className="tile-title">{tile.title}<i>?</i></div>
            <strong>{tile.value}</strong>
            <p>{tile.subtext}</p>
            <span className="tile-icon">{tile.icon}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [activePlan, setActivePlan] = useState<PlanKey>("2026");
  const [comp2026, setComp2026] = useState<Compensation2026Input>(defaultCompensation2026);
  const [newInput, setNewInput] = useState<NewPlanInput>(defaultNewInput);
  const [oldInput, setOldInput] = useState<OldPlanInput>(defaultOldInput);

  const newResult = useMemo(() => calculateNewPlan(newInput), [newInput]);
  const oldResult = useMemo(() => calculateOldPlan(oldInput), [oldInput]);
  const activeResult = activePlan === "new" ? newResult : oldResult;

  const effectiveTotal = activePlan === "new" && newInput.guaranteeEnabled
    ? Math.max(newResult.total, newInput.guaranteeFloor)
    : activePlan === "old"
      ? oldResult.total
      : newResult.total;

  const tiles: ResultTile[] = activePlan === "new"
    ? [
      { title: "CP Base (4.0%)", value: formatCurrency(rowAmount(newResult, "CP base commission")), subtext: `4.0% of ${formatCurrency(newInput.periodCp)}`, tone: "green", icon: "$" },
      { title: "CP Bonus", value: formatCurrency(rowAmount(newResult, "CP bonus increase")), subtext: `${formatPercent(Math.max(0, newResult.effectiveCpRate - 0.04))} extra on CP`, tone: "green", icon: "↗" },
      { title: "Warranty (4.0%)", value: formatCurrency(rowAmount(newResult, "Warranty commission")), subtext: `4.0% of ${formatCurrency(newInput.periodWarranty)}`, tone: "purple", icon: "◇" },
      { title: "Internal (2.5%)", value: formatCurrency(rowAmount(newResult, "Internal commission")), subtext: `2.5% of ${formatCurrency(newInput.periodInternal)}`, tone: "blue", icon: "⚙" },
      { title: "Total Estimate", value: formatCurrency(effectiveTotal), subtext: "Estimated monthly commission", tone: "white", icon: "=" },
      { title: "Effective CP Rate", value: formatPercent(newResult.effectiveCpRate), subtext: `Total CP pay on ${formatCurrency(newInput.periodCp)}`, tone: "glow", icon: "%" },
    ]
    : [
      { title: "CP Base (7.0%)", value: formatCurrency(rowAmount(oldResult, "CP base commission")), subtext: `7.0% of ${formatCurrency(oldInput.biweeklyCp)}`, tone: "green", icon: "$" },
      { title: "Warranty (5.0%)", value: formatCurrency(rowAmount(oldResult, "Warranty commission")), subtext: `5.0% of ${formatCurrency(oldInput.biweeklyWarranty)}`, tone: "purple", icon: "◇" },
      { title: "Internal (5.0%)", value: formatCurrency(rowAmount(oldResult, "Internal commission")), subtext: `5.0% of ${formatCurrency(oldInput.biweeklyInternal)}`, tone: "blue", icon: "⚙" },
      { title: "Sublet (0.5%)", value: formatCurrency(rowAmount(oldResult, "Sublet commission")), subtext: `0.5% of ${formatCurrency(oldInput.biweeklySublet)}`, tone: "blue", icon: "+" },
      { title: "Total Estimate", value: formatCurrency(effectiveTotal), subtext: "Estimated commission", tone: "white", icon: "=" },
      { title: "Effective CP Rate", value: formatPercent(activeResult.effectiveCpRate), subtext: `Base CP pay on ${formatCurrency(oldInput.biweeklyCp)}`, tone: "glow", icon: "%" },
    ];

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">▦<span>$</span></div>
          <div>
            <p>Service Advisor</p>
            <h1>Pay Calculator</h1>
            <small>Estimate your earnings under the {activePlan === "2026" ? "September 2026" : activePlan === "new" ? "New" : "Old"} Plan</small>
          </div>
        </div>
        <PlanToggle activePlan={activePlan} setActivePlan={setActivePlan} />
      </header>

      {activePlan === "2026" ? <Compensation2026View input={comp2026} setInput={setComp2026} /> : <><section className="layout">
        <aside className="left-stack">
          <section className="panel input-panel">
            <h2><span className="user-icon">○</span> Your Inputs</h2>
            <p>Enter your monthly sales amounts</p>

            {activePlan === "new" ? (
              <>
                <MoneyField label="Customer Pay Parts & Labor" value={newInput.periodCp} accent="green" onChange={(value) => setNewInput((current) => ({ ...current, periodCp: value }))} />
                <MoneyField label="Warranty Parts & Labor" value={newInput.periodWarranty} accent="purple" onChange={(value) => setNewInput((current) => ({ ...current, periodWarranty: value }))} />
                <MoneyField label="Internal Parts & Labor" value={newInput.periodInternal} accent="blue" onChange={(value) => setNewInput((current) => ({ ...current, periodInternal: value }))} />
              </>
            ) : (
              <>
                <MoneyField label="Customer Pay Parts & Labor" value={oldInput.biweeklyCp} accent="green" onChange={(value) => setOldInput((current) => ({ ...current, biweeklyCp: value, monthlyCp: value }))} />
                <MoneyField label="Warranty Parts & Labor" value={oldInput.biweeklyWarranty} accent="purple" onChange={(value) => setOldInput((current) => ({ ...current, biweeklyWarranty: value, monthlyWarranty: value }))} />
                <MoneyField label="Internal Parts & Labor" value={oldInput.biweeklyInternal} accent="blue" onChange={(value) => setOldInput((current) => ({ ...current, biweeklyInternal: value }))} />
                <MoneyField label="Sublet Labor" value={oldInput.biweeklySublet} accent="blue" onChange={(value) => setOldInput((current) => ({ ...current, biweeklySublet: value }))} />
              </>
            )}
          </section>

          <GuaranteeCard
            activePlan={activePlan}
            checked={activePlan === "new" ? newInput.guaranteeEnabled : oldInput.trainingGuaranteeEnabled}
            onChange={(checked) => activePlan === "new"
              ? setNewInput((current) => ({ ...current, guaranteeEnabled: checked }))
              : setOldInput((current) => ({ ...current, trainingGuaranteeEnabled: checked }))
            }
          />
        </aside>

        <section className="right-stack">
          <AtGlance activePlan={activePlan} />
          <ResultGrid tiles={tiles} />
        </section>
      </section>

      <section className="bonus-strip">
        <b>{activePlan === "new" ? "How the CP Bonus Works" : "Old Plan Base Commission"}</b>
        {activePlan === "new" ? (
          <>
            <span>Starts at $25,000</span><em>→</em>
            <span>+0.25% for every $500</span><em>→</em>
            <span>Extra bonus capped at 4.0%</span><em>→</em>
            <span>Max total CP rate <strong>8.0%</strong></span>
          </>
        ) : (
          <>
            <span>CP 7.0%</span><em>→</em>
            <span>Warranty 5.0%</span><em>→</em>
            <span>Internal 5.0%</span><em>→</em>
            <span>Sublet 0.5%</span>
          </>
        )}
      </section></>}
    </main>
  );
}

function Compensation2026View({ input, setInput }: { input: Compensation2026Input; setInput: React.Dispatch<React.SetStateAction<Compensation2026Input>> }) {
  const result = calculateCompensation2026(input);
  const numeric: {key: keyof Compensation2026Input; label: string; unit?: string}[] = [
    {key:"tenureYears",label:"Years of service"},
    {key:"cpLaborGross",label:"Customer-pay labor gross",unit:"$"},
    {key:"warrantyLaborGross",label:"Warranty labor gross",unit:"$"},
    {key:"alignments",label:"Alignments sold"},
    {key:"tireSales",label:"Tire sales dollars",unit:"$"},
    {key:"bServices",label:"B services sold"},
    {key:"tireBalances",label:"Tire balances sold"},
    {key:"brakeFluid",label:"Brake-fluid services sold"},
    {key:"twoServices",label:"2 services sold"},
    {key:"wipers",label:"Wipers / inserts sold"},
    {key:"drawAlreadyPaid",label:"Draw already paid this month",unit:"$"},
  ];
  const surveys: {key:"surveyService"|"surveyTreatment"|"surveyValue";label:string}[] = [
    {key:"surveyService",label:"Service advisor score qualifies (Honda national average 90%)"},
    {key:"surveyTreatment",label:"Treatment / MPI score qualifies (Honda national average 92%)"},
    {key:"surveyValue",label:"Charges and value score qualifies (Honda national average 92%)"},
  ];
  return <div className="comp-layout">
    <section className="panel comp-inputs">
      <h2>September 2026 · Monthly inputs</h2>
      <p>Enter individually written labor gross, not parts-and-labor sales. Blank figures count as zero.</p>
      <div className="comp-fields">{numeric.map(({key,label,unit})=><label key={key} className="comp-field"><span>{label}</span><div>{unit && <span>{unit}</span>}<input type="number" min="0" step={key === "tenureYears" ? "0.1" : key.includes("Gross") || key === "tireSales" || key === "drawAlreadyPaid" ? "0.01" : "1"} value={input[key] as number} onChange={e=>setInput(current=>({...current,[key]: Math.max(0,Number(e.target.value)||0)}))}/></div></label>)}</div>
      <h3>Honda survey qualifications</h3>
      {surveys.map(({key,label})=><label className="comp-check" key={key}><input type="checkbox" checked={input[key]} onChange={e=>setInput(current=>({...current,[key]:e.target.checked}))}/><span>{label}</span></label>)}
    </section>
    <section className="comp-results">
      <div className="comp-hero panel"><span>Estimated monthly gross earned</span><strong>{formatCurrency(result.earned)}</strong><small>Before withholding, prorating and payroll adjustments</small></div>
      <div className="comp-summary">
        <div className="panel"><span>Labor commission</span><strong>{formatCurrency(result.cp+result.warranty)}</strong><small>{formatPercent(result.rate)} tenure rate</small></div>
        <div className="panel"><span>Production bonuses</span><strong>{formatCurrency(result.production)}</strong><small>Seven bonus categories</small></div>
        <div className="panel"><span>Honda survey bonus</span><strong>{formatCurrency(result.survey)}</strong><small>Includes $250 all-three bonus when earned</small></div>
        <div className="panel"><span>Earned less draw paid</span><strong>{formatCurrency(result.remainingAfterDraw)}</strong><small>Not a guaranteed paycheck amount</small></div>
      </div>
      <section className="panel comp-breakdown"><h2>Detailed earnings breakdown</h2>
        <div><span>Customer-pay labor commission</span><b>{formatCurrency(result.cp)}</b></div>
        <div><span>Warranty labor commission</span><b>{formatCurrency(result.warranty)}</b></div>
        {result.bonuses.map(b=><div key={b.label}><span>{b.label}</span><b>{formatCurrency(b.amount)}</b></div>)}
        <div><span>Honda survey bonuses</span><b>{formatCurrency(result.survey)}</b></div>
        <div className="comp-total"><span>Total earned</span><b>{formatCurrency(result.earned)}</b></div>
      </section>
      <p className="comp-disclaimer">{result.warnings.join(" ")}</p>
    </section>
  </div>;
}
