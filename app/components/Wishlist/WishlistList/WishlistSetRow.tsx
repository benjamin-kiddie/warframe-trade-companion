"use client";

import { ItemSet, ItemPrice, WishlistItem } from "@/app/lib/types";
import { getPriceColorClass, sumKnownPrices } from "@/app/lib/pricing";
import WishlistRow from "@/app/components/Wishlist/WishlistList/WishlistRow";

type Props = {
  /** The item set this row represents. */
  set: ItemSet;
  /** Live price info by slug. */
  prices: Record<string, ItemPrice>;
  /** True while prices are still being fetched. */
  pricesLoading: boolean;
  /** True if this set is currently expanded. */
  expanded: boolean;
  /** Callback to toggle expanded/collapsed. */
  onToggleExpand: () => void;
  /** Callback when a child item is marked bought. */
  onBoughtChild: (item: WishlistItem) => void;
  /** Callback to discard a child item. */
  onDiscardChild: (item: WishlistItem) => void;
  /** Callback to discard the whole set. */
  onDiscardSet: () => void;
};

/**
 * A set header row: chevron to expand/collapse, name, rolled-up collective
 * price vs. 30-day average across all its items, and a discard button.
 * Expands to render each child item as its own WishlistRow.
 */
export default function WishlistSetRow({
  set,
  prices,
  pricesLoading,
  expanded,
  onToggleExpand,
  onBoughtChild,
  onDiscardChild,
  onDiscardSet,
}: Props) {
  const collectivePrice: ItemPrice = {
    currentPrice: sumKnownPrices(
      set.items.map((item) => prices[item.slug]?.currentPrice),
    ),
    thirtyDayAverage: sumKnownPrices(
      set.items.map((item) => prices[item.slug]?.thirtyDayAverage),
    ),
  };

  /** Handle discarding the whole set, after confirming with the user. */
  const handleDiscardSet = () => {
    if (
      window.confirm(
        `Remove the "${set.name}" set (and all its items) from your wishlist? This cannot be undone.`,
      )
    ) {
      onDiscardSet();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? "Collapse set" : "Expand set"}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {set.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({set.items.length} {set.items.length === 1 ? "item" : "items"})
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {pricesLoading ? (
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <span
              className={`text-sm font-mono ${getPriceColorClass(collectivePrice)}`}
            >
              {collectivePrice.currentPrice != null
                ? `${collectivePrice.currentPrice}p`
                : "—"}
            </span>
          )}
          <button
            type="button"
            onClick={handleDiscardSet}
            aria-label={`Remove the "${set.name}" set from wishlist`}
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
      {expanded &&
        set.items.map((item) => (
          <WishlistRow
            key={item.id}
            item={item}
            price={prices[item.slug]}
            pricesLoading={pricesLoading}
            nested
            onBought={() => onBoughtChild(item)}
            onDiscard={() => onDiscardChild(item)}
          />
        ))}
    </>
  );
}
