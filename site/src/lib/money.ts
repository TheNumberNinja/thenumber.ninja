/**
 * Money as copy shows it (shared rule 7): pounds with no pence unless the
 * figure has them ("£245", "£36.75"), and adjustments as "add £15" or
 * "take off £35".
 */
import type { Pence } from "@data/prices";

/** "£245" or "£6.25": pence only when the figure has them. */
export function pounds(amount: Pence): string {
  const abs = Math.abs(amount);
  const whole = Math.floor(abs / 100);
  const pence = abs % 100;
  const sign = amount < 0 ? "-" : "";
  const grouped = whole.toLocaleString("en-GB");
  return pence === 0
    ? `${sign}£${grouped}`
    : `${sign}£${grouped}.${String(pence).padStart(2, "0")}`;
}

/** "add £36.75" for an increase, "take off £35" for a reduction. */
export function adjustmentText(amount: Pence): string {
  return amount < 0 ? `take off ${pounds(-amount)}` : `add ${pounds(amount)}`;
}
