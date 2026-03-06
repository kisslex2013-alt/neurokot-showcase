import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateImpact } from '../src/lib/impact.ts';

test('calculateImpact computes daily and weekly totals', () => {
  const result = calculateImpact({
    time_saved_min_per_user_per_day: 30,
    users_affected: 10,
  });

  assert.equal(result.minutes_saved_per_day_total, 300);
  assert.equal(result.hours_saved_per_week_total, 25);
  assert.equal(result.money_saved_per_month, null);
});

test('calculateImpact computes monthly money when hourly rate is provided', () => {
  const result = calculateImpact({
    time_saved_min_per_user_per_day: 15,
    users_affected: 8,
    hourly_rate: 50,
  });

  assert.equal(result.minutes_saved_per_day_total, 120);
  assert.equal(result.hours_saved_per_week_total, 10);
  assert.equal(result.money_saved_per_month, 2000);
});

test('calculateImpact ignores invalid hourly rates', () => {
  const result = calculateImpact({
    time_saved_min_per_user_per_day: 5,
    users_affected: 3,
    hourly_rate: Number.NaN,
  });

  assert.equal(result.money_saved_per_month, null);
});
