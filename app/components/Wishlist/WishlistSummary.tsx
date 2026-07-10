"use client";

type Props = {
  /** Total current cost across the whole wishlist, or null if no prices are known yet. */
  totalWishlistCost: number | null;
  /** Current traded platinum balance. */
  tradedBalance: number;
  /** True while data is loading. */
  loading: boolean;
};

/** Shows wishlist totals: current cost, and what would be left of the traded balance if it were all bought via trade. */
export default function WishlistSummary({
  totalWishlistCost,
  tradedBalance,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-10">
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-28"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-36"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    );
  }

  const cost = totalWishlistCost ?? 0;
  const projectedRemaining = tradedBalance - cost;

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Wishlist Cost
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {totalWishlistCost != null ? `${totalWishlistCost}p` : "—"}
        </p>
      </div>
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Remaining If Bought
        </h3>
        <p
          className={`text-2xl font-bold ${
            projectedRemaining >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {projectedRemaining}p
        </p>
      </div>
    </div>
  );
}
