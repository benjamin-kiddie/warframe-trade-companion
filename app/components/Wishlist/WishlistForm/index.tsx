"use client";

import { useState } from "react";
import ItemAutocomplete from "@/app/components/Inputs/ItemAutocomplete";
import Select from "@/app/components/Inputs/Select";
import SetItemsList from "@/app/components/Wishlist/WishlistForm/SetItemsList";
import {
  ItemType,
  ItemSetFormData,
  WishlistItemFormData,
  tradeItemTypeOptions,
} from "@/app/lib/types";

type FormTab = "individual" | "set";

type Props = {
  /** Callback to submit a new standalone item. */
  onSubmitItem: (data: WishlistItemFormData) => void;
  /** Callback to submit a new set with its items. */
  onSubmitSet: (data: ItemSetFormData) => void;
  /** Cancel callback. */
  onCancel: () => void;
};

/**
 * Modal form for adding to the wishlist: either a single item, or a named
 * set with one or more items added to it before submitting as a whole.
 */
export default function WishlistForm({
  onSubmitItem,
  onSubmitSet,
  onCancel,
}: Props) {
  const [activeFormTab, setActiveFormTab] = useState<FormTab>("individual");

  const [individualItemType, setIndividualItemType] = useState<ItemType>(
    ItemType.WARFRAME_PART,
  );
  const [individualItemName, setIndividualItemName] = useState("");
  const [individualSlug, setIndividualSlug] = useState<string | null>(null);

  const [setName, setSetName] = useState("");
  const [stagingItemType, setStagingItemType] = useState<ItemType>(
    ItemType.WARFRAME_PART,
  );
  const [stagingItemName, setStagingItemName] = useState("");
  const [stagingSlug, setStagingSlug] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<WishlistItemFormData[]>([]);

  /** Handle adding the currently-staged item to the pending set. */
  const handleAddToSet = () => {
    if (!stagingItemName || !stagingSlug) {
      return;
    }

    setPendingItems([
      ...pendingItems,
      { name: stagingItemName, slug: stagingSlug, itemType: stagingItemType },
    ]);
    setStagingItemName("");
    setStagingSlug(null);
  };

  /** Handle removing a staged item from the pending set. */
  const handleRemoveFromSet = (index: number) => {
    setPendingItems(pendingItems.filter((_, i) => i !== index));
  };

  /** Reset form to initial state. */
  const resetForm = () => {
    setActiveFormTab("individual");
    setIndividualItemType(ItemType.WARFRAME_PART);
    setIndividualItemName("");
    setIndividualSlug(null);
    setSetName("");
    setStagingItemType(ItemType.WARFRAME_PART);
    setStagingItemName("");
    setStagingSlug(null);
    setPendingItems([]);
  };

  /** Handle submitting the individual item form. */
  const handleSubmitIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!individualItemName || !individualSlug) {
      return;
    }

    onSubmitItem({
      name: individualItemName,
      slug: individualSlug,
      itemType: individualItemType,
    });
    resetForm();
  };

  /** Handle submitting the set form. */
  const handleSubmitSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setName || pendingItems.length === 0) {
      return;
    }

    onSubmitSet({ name: setName, items: pendingItems });
    resetForm();
  };

  /** Handle form cancellation. */
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <>
      <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
        Add to Wishlist
      </h3>
      <div className="flex gap-1 mb-6">
        <button
          type="button"
          onClick={() => setActiveFormTab("individual")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFormTab === "individual"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-700"
          }`}
        >
          Individual Item
        </button>
        <button
          type="button"
          onClick={() => setActiveFormTab("set")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFormTab === "set"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-700"
          }`}
        >
          Set
        </button>
      </div>

      {activeFormTab === "individual" ? (
        <form onSubmit={handleSubmitIndividual}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Type
              </label>
              <Select
                value={individualItemType}
                options={tradeItemTypeOptions}
                onChange={setIndividualItemType}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item
              </label>
              <ItemAutocomplete
                currentValue={{
                  itemName: individualItemName,
                  slug: individualSlug,
                }}
                onChange={(itemName, slug) => {
                  setIndividualItemName(itemName);
                  setIndividualSlug(slug);
                }}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-700 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitSet}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Set Name
              </label>
              <input
                type="text"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                placeholder="e.g. Volt Prime"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Type
              </label>
              <Select
                value={stagingItemType}
                options={tradeItemTypeOptions}
                onChange={setStagingItemType}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Item
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <ItemAutocomplete
                    currentValue={{
                      itemName: stagingItemName,
                      slug: stagingSlug,
                    }}
                    onChange={(itemName, slug) => {
                      setStagingItemName(itemName);
                      setStagingSlug(slug);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddToSet}
                  disabled={!stagingItemName || !stagingSlug}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Items in Set
              </label>
              <SetItemsList
                items={pendingItems}
                onRemove={handleRemoveFromSet}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-700 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!setName || pendingItems.length === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Set
            </button>
          </div>
        </form>
      )}
    </>
  );
}
