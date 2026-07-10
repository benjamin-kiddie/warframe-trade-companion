"use client";

import { useId, useRef } from "react";

/** A single selectable option. */
export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  /** Currently selected value. */
  value: T;
  /** Available options. */
  options: SelectOption<T>[];
  /** Callback when the selected value changes. */
  onChange: (value: T) => void;
};

/**
 * Custom dropdown select, rendered via the native Popover API so its option
 * list is regular page content and inherits the app's font. A native
 * <select>'s open option list is instead drawn by the OS/browser and largely
 * ignores page CSS, which is what caused the font mismatch this replaces.
 */
export default function Select<T extends string>({
  value,
  options,
  onChange,
}: Props<T>) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  const selectedLabel = options.find((option) => option.value === value)
    ?.label;

  /** Position and size the popover against its trigger button just before it opens. */
  const handleBeforeToggle = (e: React.ToggleEvent<HTMLDivElement>) => {
    if (e.newState !== "open" || !buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const popover = e.currentTarget;
    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.left = `${rect.left}px`;
    popover.style.width = `${rect.width}px`;
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={popoverId}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700 dark:text-white text-left"
      >
        <span>{selectedLabel}</span>
        <svg
          className="w-4 h-4 text-gray-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        id={popoverId}
        popover="auto"
        onBeforeToggle={handleBeforeToggle}
        className="fixed m-0 p-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            popoverTarget={popoverId}
            popoverTargetAction="hide"
            onClick={() => onChange(option.value)}
            className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
              option.value === value
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
