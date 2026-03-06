export type ImpactCalculatorInput = {
  time_saved_min_per_user_per_day: number;
  users_affected: number;
  hourly_rate?: number | null;
};

export type ImpactCalculatorOutput = {
  minutes_saved_per_day_total: number;
  hours_saved_per_week_total: number;
  money_saved_per_month: number | null;
};

export const IMPACT_ASSUMPTIONS = {
  workdaysPerWeek: 5,
  workdaysPerMonth: 20,
} as const;

export function calculateImpact({
  time_saved_min_per_user_per_day,
  users_affected,
  hourly_rate = null,
}: ImpactCalculatorInput): ImpactCalculatorOutput {
  const minutes_saved_per_day_total = time_saved_min_per_user_per_day * users_affected;
  const hours_saved_per_week_total =
    (minutes_saved_per_day_total * IMPACT_ASSUMPTIONS.workdaysPerWeek) / 60;

  const normalizedHourlyRate =
    typeof hourly_rate === 'number' && Number.isFinite(hourly_rate) && hourly_rate >= 0
      ? hourly_rate
      : null;

  const money_saved_per_month =
    normalizedHourlyRate === null
      ? null
      : (minutes_saved_per_day_total * IMPACT_ASSUMPTIONS.workdaysPerMonth * normalizedHourlyRate) /
        60;

  return {
    minutes_saved_per_day_total,
    hours_saved_per_week_total,
    money_saved_per_month,
  };
}
