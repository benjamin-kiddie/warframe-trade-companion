"use client";

import { WishlistItem, ItemPrice } from "@/app/lib/types";
import { getPriceColorClass } from "@/app/lib/pricing";

type Props = {
  /** The wishlist item this row represents. */
  item: WishlistItem;
  /** Live price info for this item's slug, if loaded. */
  price: ItemPrice | undefined;
  /** True while prices are still being fetched. */
  pricesLoading: boolean;
  /** True when rendered as a child of an expanded set (adds indentation). */
  nested?: boolean;
  /** Callback when this item is marked bought. */
  onBought: () => void;
  /** Callback to discard this item without buying it. */
  onDiscard: () => void;
};

/**
 * A single wishlist row: name, live price colored vs. its 30-day average,
 * a "bought" button, and a discard button.
 */
export default function WishlistRow({
  item,
  price,
  pricesLoading,
  nested = false,
  onBought,
  onDiscard,
}: Props) {
  /** Handle discarding this item, after confirming with the user. */
  const handleDiscard = () => {
    if (
      window.confirm(
        `Remove "${item.name}" from your wishlist? This cannot be undone.`,
      )
    ) {
      onDiscard();
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors ${
        nested ? "pl-14 bg-gray-50/50 dark:bg-zinc-900/30" : ""
      }`}
    >
      <span className="text-sm text-gray-900 dark:text-gray-100">
        {item.name}
      </span>
      <div className="flex items-center gap-4 shrink-0">
        {pricesLoading ? (
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <span className={`text-sm font-mono ${getPriceColorClass(price)}`}>
            {price?.currentPrice != null ? `${price.currentPrice}p` : "—"}
          </span>
        )}
        <button
          type="button"
          onClick={onBought}
          aria-label={`Mark "${item.name}" as bought`}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleDiscard}
          aria-label={`Remove "${item.name}" from wishlist`}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
