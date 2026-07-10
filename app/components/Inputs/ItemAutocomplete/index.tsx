"use client";

import { useState, useEffect } from "react";

type ItemSearchResult = {
  slug: string;
  name: string;
};

type Props = {
  /** Current value as item name and slug pair. */
  currentValue: { itemName: string; slug: string | null };
  /** Callback to update the form value. */
  onChange: (itemName: string, slug: string | null) => void;
  /** True if this input is required. */
  required?: boolean;
};

/**
 * Autocomplete input for searching items from api.warframe.market.
 * Uses a debounced search to fetch matching items from the API as the user types.
 * Calls onChange with the selected item's name and slug (or null if cleared).
 */
export default function ItemAutocomplete({
  currentValue,
  onChange,
  required = false,
}: Props) {
  const [query, setQuery] = useState(currentValue.itemName);
  const [searchResults, setSearchResults] = useState<ItemSearchResult[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayValue = currentValue.itemName || query;

  // Keep local query text in sync when the form resets itemName out from
  // under us (e.g. on submit/cancel), since that doesn't fire a blur event.
  useEffect(() => {
    setQuery(currentValue.itemName);
  }, [currentValue.itemName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() && !currentValue.itemName) {
        searchItems(query);
        setShowOptions(true);
      } else {
        setShowOptions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentValue, query]);

  /** Search for items from api.warframe.market by English item name. */
  const searchItems = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/items?query=${encodeURIComponent(query)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.items.slice(0, 5));
      }
    } catch (error) {
      console.error("Error searching items:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Handle changing the input value. */
  const handleInputChange = (newQuery: string) => {
    setQuery(newQuery);
    if (currentValue.itemName && newQuery !== currentValue.itemName) {
      onChange("", null);
    }
  };

  /** Handle selecting an item from the search results. */
  const handleItemSelect = (item: ItemSearchResult) => {
    setQuery(item.name);
    onChange(item.name, item.slug);
    setSearchResults([]);
  };

  const handleBlur = () => {
    if (!currentValue.itemName) {
      setQuery("");
    } else {
      setQuery(currentValue.itemName);
    }
  };

  /** Handle clearing the input. */
  const handleClear = () => {
    setQuery("");
    onChange("", null);
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleBlur}
        className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
        placeholder={"Search for items"}
        required={required}
      />
      {currentValue.itemName && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-8 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
      )}
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      {showOptions && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((item) => (
            <button
              type="button"
              key={item.slug}
              onClick={() => handleItemSelect(item)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-600 focus:outline-none focus:bg-gray-100 dark:focus:bg-zinc-600 text-gray-900 dark:text-gray-100"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
