"use client";

import { useState } from "react";
import { WishlistItem, ItemSet, ItemPrice } from "@/app/lib/types";
import WishlistRow from "@/app/components/Wishlist/WishlistList/WishlistRow";
import WishlistSetRow from "@/app/components/Wishlist/WishlistList/WishlistSetRow";

type Entry =
  | { kind: "item"; item: WishlistItem }
  | { kind: "set"; set: ItemSet };

type Props = {
  /** Standalone wishlist items. */
  items: WishlistItem[];
  /** Item sets, each with their own items. */
  sets: ItemSet[];
  /** Live price info by slug. */
  prices: Record<string, ItemPrice>;
  /** True while the wishlist itself is loading. */
  entriesLoading: boolean;
  /** True while prices are still being fetched. */
  pricesLoading: boolean;
  /** Callback to open the add dialog. */
  onAddClick: () => void;
  /** Callback when a standalone or set item is marked bought. */
  onBought: (item: WishlistItem) => void;
  /** Callback to discard a standalone item. */
  onDiscardItem: (item: WishlistItem) => void;
  /** Callback to discard a whole set. */
  onDiscardSet: (set: ItemSet) => void;
};

/** Id of an entry, whichever kind it is — cuids sort lexicographically in creation order. */
const entryId = (entry: Entry) =>
  entry.kind === "item" ? entry.item.id : entry.set.id;

/**
 * List of wishlist items and sets, sets expandable to reveal their items.
 * Fills whatever height its container gives it: only the row list scrolls.
 */
export default function WishlistList({
  items,
  sets,
  prices,
  entriesLoading,
  pricesLoading,
  onAddClick,
  onBought,
  onDiscardItem,
  onDiscardSet,
}: Props) {
  const [expandedSetIds, setExpandedSetIds] = useState<Set<string>>(
    new Set(),
  );

  const entries: Entry[] = [
    ...items.map((item): Entry => ({ kind: "item", item })),
    ...sets.map((set): Entry => ({ kind: "set", set })),
  ].sort((a, b) => entryId(a).localeCompare(entryId(b)));

  /** Handle toggling a set's expanded/collapsed state. */
  const toggleExpand = (setId: string) => {
    setExpandedSetIds((prev) => {
      const next = new Set(prev);
      if (next.has(setId)) {
        next.delete(setId);
      } else {
        next.add(setId);
      }
      return next;
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b flex justify-between items-center shrink-0">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Wishlist
        </h2>
        <button
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          +
        </button>
      </div>
      {!entriesLoading && entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
          Your wishlist is empty. Start by adding an item or a set!
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-200 dark:divide-zinc-700">
          {entriesLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            : entries.map((entry) =>
                entry.kind === "item" ? (
                  <WishlistRow
                    key={entry.item.id}
                    item={entry.item}
                    price={prices[entry.item.slug]}
                    pricesLoading={pricesLoading}
                    onBought={() => onBought(entry.item)}
                    onDiscard={() => onDiscardItem(entry.item)}
                  />
                ) : (
                  <WishlistSetRow
                    key={entry.set.id}
                    set={entry.set}
                    prices={prices}
                    pricesLoading={pricesLoading}
                    expanded={expandedSetIds.has(entry.set.id)}
                    onToggleExpand={() => toggleExpand(entry.set.id)}
                    onBoughtChild={onBought}
                    onDiscardChild={onDiscardItem}
                    onDiscardSet={() => onDiscardSet(entry.set)}
                  />
                ),
              )}
        </div>
      )}
    </div>
  );
}
