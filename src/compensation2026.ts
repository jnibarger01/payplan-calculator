export type Compensation2026Input = {
  tenureYears: number; cpLaborGross: number; warrantyLaborGross: number;
  alignments: number; tireSales: number; bServices: number; tireBalances: number;
  brakeFluid: number; twoServices: number; wipers: number;
  surveyService: boolean; surveyTreatment: boolean; surveyValue: boolean;
  drawAlreadyPaid: number;
};
export const defaultCompensation2026: Compensation2026Input = {
  tenureYears: 5, cpLaborGross: 0, warrantyLaborGross: 0,
  alignments: 0, tireSales: 0, bServices: 0, tireBalances: 0,
  brakeFluid: 0, twoServices: 0, wipers: 0,
  surveyService: false, surveyTreatment: false, surveyValue: false,
  drawAlreadyPaid: 0,
};
const safe = (n: number) => Number.isFinite(n) ? Math.max(0, n) : 0;
export function tenureRate(years: number) {
  const y = safe(years);
  return y >= 10 ? .15 : y >= 7 ? .14 : y >= 5 ? .13 : y >= 2 ? .12 : .11;
}
export function tier(value: number, thresholds: readonly (readonly [number, number])[]) {
  return thresholds.reduce((amount, [minimum, payout]) => safe(value) >= minimum ? payout : amount, 0);
}
export function calculateCompensation2026(input: Compensation2026Input) {
  const rate = tenureRate(input.tenureYears);
  const cp = safe(input.cpLaborGross) * rate;
  const warranty = safe(input.warrantyLaborGross) * rate;
  const bonuses = [
    { label: "Alignments", amount: tier(input.alignments, [[25,150],[35,250],[45,350],[55,450],[65,550],[75,750]]) },
    { label: "Tire sales", amount: tier(input.tireSales, [[4000,100],[5000,150],[6000,200],[7000,250],[8000,300],[9000,350]]) },
    { label: "B services", amount: tier(input.bServices, [[25,200],[50,250],[75,300],[100,350],[125,400],[150,450]]) },
    { label: "Tire balances", amount: tier(input.tireBalances, [[25,100],[50,150],[75,200],[100,250],[125,300]]) },
    { label: "Brake fluid", amount: tier(input.brakeFluid, [[20,250],[30,300],[40,350],[50,400]]) },
    { label: "2 services", amount: tier(input.twoServices, [[20,150],[30,200],[40,250],[50,300]]) },
    { label: "Wipers / inserts", amount: tier(input.wipers, [[20,50],[30,75],[40,100],[50,150],[60,200]]) },
  ];
  const surveyCount = [input.surveyService,input.surveyTreatment,input.surveyValue].filter(Boolean).length;
  const survey = surveyCount * 250 + (surveyCount === 3 ? 250 : 0);
  const production = bonuses.reduce((sum, item) => sum + item.amount, 0);
  const earned = cp + warranty + production + survey;
  return { rate, cp, warranty, bonuses, production, survey, earned,
    remainingAfterDraw: earned - safe(input.drawAlreadyPaid),
    warnings: ["Gross earnings estimate before taxes and payroll adjustments.", "Draw is an advance against earnings, not additional commission.", "Survey toggles represent confirmed qualification, not automatically inferred scores.", "First/final employment months may be prorated."] };
}
