import { ItemPrice } from "@/app/lib/types";

/** Color a current price green/red against its 30-day median (gray if either is unavailable). */
export function getPriceColorClass(price: ItemPrice | undefined): string {
  if (!price || price.currentPrice == null || price.thirtyDayMedian == null) {
    return "text-gray-500 dark:text-gray-400";
  }
  if (price.currentPrice < price.thirtyDayMedian) {
    return "text-green-600 dark:text-green-400";
  }
  if (price.currentPrice > price.thirtyDayMedian) {
    return "text-red-600 dark:text-red-400";
  }
  return "text-gray-900 dark:text-gray-100";
}

/** Sum whatever values are known (not null/undefined), or null if none are known. */
export function sumKnownPrices(
  values: (number | null | undefined)[],
): number | null {
  const known = values.filter((value): value is number => value != null);
  if (known.length === 0) {
    return null;
  }
  return known.reduce((sum, value) => sum + value, 0);
}
