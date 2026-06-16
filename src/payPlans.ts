export type ObjectiveFlags = {
  alignments: boolean;
  totalLaborGross: boolean;
  cpLaborGross: boolean;
  hagProducts: boolean;
  cpLaborGrossPerRo: boolean;
  hoursPerCpro: boolean;
};

export type BreakdownRow = {
  label: string;
  amount: number;
  note?: string;
};

export type PayPlanResult = {
  total: number;
  baseCommission: number;
  bonusTotal: number;
  guaranteeTopUp: number;
  complianceTopUp: number;
  effectiveCpRate: number;
  rows: BreakdownRow[];
  warnings: string[];
};

export type OldPlanInput = {
  biweeklyCp: number;
  biweeklyWarranty: number;
  biweeklyInternal: number;
  biweeklySublet: number;
  monthlyCp: number;
  monthlyWarranty: number;
  reviewCount: number;
  trainingGuaranteeEnabled: boolean;
  hoursWorked: number;
  minimumWage: number;
  objectives: ObjectiveFlags;
};

export type NewPlanInput = {
  periodCp: number;
  periodWarranty: number;
  periodInternal: number;
  guaranteeEnabled: boolean;
  guaranteeFloor: number;
  hoursWorked: number;
  minimumWage: number;
};

const money = (value: number) => Number.isFinite(value) ? value : 0;
const floorAtZero = (value: number) => Math.max(0, money(value));

export function oldCustomerPayBonusRate(monthlyCp: number, reviewCount: number): number {
  if (reviewCount < 7) return 0;
  const tiers = [35_000, 45_000, 55_000, 65_000];
  return tiers.filter((tier) => monthlyCp >= tier).length * 0.005;
}

export function oldObjectiveBonusRate(objectives: ObjectiveFlags): number {
  return (
    (objectives.alignments ? 0.002 : 0) +
    (objectives.totalLaborGross ? 0.003 : 0) +
    (objectives.cpLaborGross ? 0.002 : 0) +
    (objectives.hagProducts ? 0.001 : 0) +
    (objectives.cpLaborGrossPerRo ? 0.001 : 0) +
    (objectives.hoursPerCpro ? 0.001 : 0)
  );
}

export function calculateOldPlan(input: OldPlanInput): PayPlanResult {
  const biweeklyCp = floorAtZero(input.biweeklyCp);
  const biweeklyWarranty = floorAtZero(input.biweeklyWarranty);
  const biweeklyInternal = floorAtZero(input.biweeklyInternal);
  const biweeklySublet = floorAtZero(input.biweeklySublet);
  const monthlyCp = floorAtZero(input.monthlyCp);
  const monthlyWarranty = floorAtZero(input.monthlyWarranty);

  const baseCommission =
    biweeklyCp * 0.07 +
    biweeklyWarranty * 0.05 +
    biweeklyInternal * 0.05 +
    biweeklySublet * 0.005;

  const trainingGuaranteeTopUp = input.trainingGuaranteeEnabled
    ? Math.max(0, 1_500 - baseCommission)
    : 0;

  const cpBonusRate = oldCustomerPayBonusRate(monthlyCp, input.reviewCount);
  const monthlyCpBonus = monthlyCp * cpBonusRate;

  const objectiveRate = oldObjectiveBonusRate(input.objectives);
  const objectiveBonus = (monthlyCp + monthlyWarranty) * objectiveRate;

  const reviewBonus = input.reviewCount >= 15 ? 375 : 0;
  const bonusTotal = monthlyCpBonus + objectiveBonus + reviewBonus;

  const grossBeforeCompliance = baseCommission + trainingGuaranteeTopUp + bonusTotal;
  const minimumWageFloor = floorAtZero(input.hoursWorked) * floorAtZero(input.minimumWage);
  const minimumWageSubsidy = Math.max(0, minimumWageFloor - grossBeforeCompliance);

  const total = grossBeforeCompliance + minimumWageSubsidy;
  const effectiveCpRate = biweeklyCp > 0 ? (biweeklyCp * 0.07) / biweeklyCp : 0;

  const warnings: string[] = [];
  if (input.reviewCount < 7 && monthlyCp >= 35_000) {
    warnings.push("Old CP monthly bonus blocked: fewer than 7 qualifying 5-star reviews.");
  }
  if (input.trainingGuaranteeEnabled && baseCommission > 1_500) {
    warnings.push("Old training guarantee does not pay because base commission exceeds $1,500.");
  }
  if (minimumWageSubsidy > 0) {
    warnings.push("Old minimum-wage subsidy appears as a top-up here; the plan says subsidy payments may be recouped from future earnings.");
  }

  return {
    total,
    baseCommission,
    bonusTotal,
    guaranteeTopUp: trainingGuaranteeTopUp,
    complianceTopUp: minimumWageSubsidy,
    effectiveCpRate,
    warnings,
    rows: [
      { label: "CP base commission", amount: biweeklyCp * 0.07, note: "7.0% of bi-weekly CP parts/labor after discounts" },
      { label: "Warranty commission", amount: biweeklyWarranty * 0.05, note: "5.0% of bi-weekly warranty parts/labor" },
      { label: "Internal commission", amount: biweeklyInternal * 0.05, note: "5.0% of bi-weekly internal parts/labor" },
      { label: "Sublet commission", amount: biweeklySublet * 0.005, note: "0.5% of bi-weekly sublet labor" },
      { label: "Training guarantee top-up", amount: trainingGuaranteeTopUp, note: "First 4 bi-weekly pay periods only" },
      { label: "Monthly CP bonus", amount: monthlyCpBonus, note: `${(cpBonusRate * 100).toFixed(1)}% CP bonus rate` },
      { label: "Monthly objective bonus", amount: objectiveBonus, note: `${(objectiveRate * 100).toFixed(1)}% of monthly CP + warranty` },
      { label: "15-review bonus", amount: reviewBonus, note: "Pays at 15+ qualifying 5-star reviews" },
      { label: "Minimum-wage subsidy estimate", amount: minimumWageSubsidy },
    ],
  };
}

export function newCustomerPayBonusRate(periodCp: number): number {
  const cp = floorAtZero(periodCp);
  if (cp < 25_000) return 0;
  const increments = 1 + Math.floor((cp - 25_000) / 500);
  return Math.min(0.04, increments * 0.0025);
}

export function calculateNewPlan(input: NewPlanInput): PayPlanResult {
  const cp = floorAtZero(input.periodCp);
  const warranty = floorAtZero(input.periodWarranty);
  const internal = floorAtZero(input.periodInternal);

  const cpBase = cp * 0.04;
  const warrantyCommission = warranty * 0.04;
  const internalCommission = internal * 0.025;
  const baseCommission = cpBase + warrantyCommission + internalCommission;

  const cpBonusRate = newCustomerPayBonusRate(cp);
  const cpBonus = cp * cpBonusRate;
  const earnedBeforeGuarantee = baseCommission + cpBonus;

  const guaranteeTopUp = input.guaranteeEnabled
    ? Math.max(0, floorAtZero(input.guaranteeFloor) - earnedBeforeGuarantee)
    : 0;

  const grossBeforeCompliance = earnedBeforeGuarantee + guaranteeTopUp;
  const roughSevenIFloor = floorAtZero(input.hoursWorked) * floorAtZero(input.minimumWage) * 1.5;
  const roughSevenIShortfall = input.hoursWorked > 0 && input.minimumWage > 0
    ? Math.max(0, roughSevenIFloor - grossBeforeCompliance)
    : 0;

  const total = grossBeforeCompliance;
  const warnings: string[] = [];
  if (cp >= 25_000 && cpBonusRate >= 0.04) {
    warnings.push("New CP bonus increase is capped at 4.0%, so CP effective rate caps at 8.0%.");
  }
  if (roughSevenIShortfall > 0) {
    warnings.push(`Rough 7(i) floor check shows a ${formatCurrency(roughSevenIShortfall)} shortfall. Payroll rules need week-level data; this is only a warning.`);
  }

  return {
    total,
    baseCommission,
    bonusTotal: cpBonus,
    guaranteeTopUp,
    complianceTopUp: roughSevenIShortfall,
    effectiveCpRate: cp > 0 ? (cpBase + cpBonus) / cp : 0,
    warnings,
    rows: [
      { label: "CP base commission", amount: cpBase, note: "4.0% of CP parts/labor after discounts" },
      { label: "Warranty commission", amount: warrantyCommission, note: "4.0% of warranty parts/labor" },
      { label: "Internal commission", amount: internalCommission, note: "2.5% of internal parts/labor" },
      { label: "CP bonus increase", amount: cpBonus, note: `${(cpBonusRate * 100).toFixed(2)}% bonus increase; max effective CP rate is 8.0%` },
      { label: "Guarantee top-up", amount: guaranteeTopUp, note: input.guaranteeEnabled ? "Applied against all earned wages entered" : "Guarantee disabled" },
      { label: "Rough 7(i) shortfall warning", amount: roughSevenIShortfall, note: "Not added to total" },
    ],
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(money(value));
}

export function formatPercent(value: number): string {
  return `${(money(value) * 100).toFixed(2)}%`;
}
