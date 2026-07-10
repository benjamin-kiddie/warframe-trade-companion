"use client";

import { WishlistItemFormData } from "@/app/lib/types";

type Props = {
  /** Items staged to be added to the set. */
  items: WishlistItemFormData[];
  /** Callback to remove a staged item by index. */
  onRemove: (index: number) => void;
};

/** List of items staged for a new set, before the set is submitted. */
export default function SetItemsList({ items, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No items added yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1 max-h-40 overflow-y-auto">
      {items.map((item, index) => (
        <li
          key={`${item.slug}-${index}`}
          className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-zinc-700 rounded-md text-sm text-gray-900 dark:text-gray-100"
        >
          {item.name}
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${item.name}`}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
