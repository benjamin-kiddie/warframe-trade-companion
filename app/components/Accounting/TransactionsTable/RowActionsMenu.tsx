"use client";

import { useRef } from "react";
import { Transaction } from "@/app/lib/types";

type Props = {
  /** Transaction this menu acts on. */
  transaction: Transaction;
  /** Callback to edit the transaction. */
  onEdit: (transaction: Transaction) => void;
  /** Callback to delete the transaction. */
  onDelete: (id: string) => void;
};

/**
 * Kebab menu of row actions, rendered via the native Popover API so it
 * escapes the table's scroll/overflow container instead of being clipped.
 */
export default function RowActionsMenu({
  transaction,
  onEdit,
  onDelete,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverId = `row-actions-${transaction.id}`;

  /** Position the popover against its trigger button just before it opens. */
  const handleBeforeToggle = (e: React.ToggleEvent<HTMLDivElement>) => {
    if (e.newState !== "open" || !buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const popover = e.currentTarget;
    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.left = `${Math.max(8, rect.right - popover.offsetWidth)}px`;
  };

  /** Handle deleting this transaction, after confirming with the user. */
  const handleDelete = () => {
    if (window.confirm("Delete this transaction? This cannot be undone.")) {
      onDelete(transaction.id);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={popoverId}
        aria-label="Row actions"
        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-500 dark:text-gray-400 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6h.01M12 12h.01M12 18h.01"
          />
        </svg>
      </button>
      <div
        id={popoverId}
        popover="auto"
        onBeforeToggle={handleBeforeToggle}
        className="fixed m-0 p-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg min-w-32"
      >
        <button
          type="button"
          popoverTarget={popoverId}
          popoverTargetAction="hide"
          onClick={() => onEdit(transaction)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
        <button
          type="button"
          popoverTarget={popoverId}
          popoverTargetAction="hide"
          onClick={handleDelete}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
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
          Delete
        </button>
      </div>
    </>
  );
}
