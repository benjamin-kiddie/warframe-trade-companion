import { useState } from "react";
import ItemAutocomplete from "@/app/components/Inputs/ItemAutocomplete";
import {
  TransactionType,
  ItemType,
  Transaction,
  TransactionFormData as TransactionFormType,
  WishlistBuyRequest,
  tradeItemTypeOptions,
} from "@/app/lib/types";
import NumberInput from "@/app/components/Inputs/NumberInput";
import Select from "@/app/components/Inputs/Select";

type Props = {
  /** Transaction being edited, or null/undefined when adding a new one. */
  editingTransaction?: Transaction | null;
  /** A "bought" wishlist item to pre-fill the form for, if any. */
  draft?: WishlistBuyRequest | null;
  /** Submission callback. */
  onSubmit: (data: TransactionFormType) => void;
  /** Cancel callback. */
  onCancel: () => void;
};

/**
 * Modal form for adding a new transaction, editing an existing one, or
 * logging the trade for a wishlist item marked bought. The date a
 * transaction occurred on cannot be edited once created.
 */
export default function TransactionForm({
  editingTransaction,
  draft,
  onSubmit,
  onCancel,
}: Props) {
  const isEditing = editingTransaction != null;

  /** Build form state from the transaction being edited, a wishlist buy draft, or blank defaults. */
  const buildInitialFormData = (): TransactionFormType => {
    if (editingTransaction) {
      return {
        date: new Date(editingTransaction.date).toISOString().split("T")[0],
        transactionType: editingTransaction.transactionType,
        itemType: editingTransaction.itemType,
        itemName: editingTransaction.itemName,
        slug: editingTransaction.slug,
        price: editingTransaction.price,
        notes: editingTransaction.notes,
      };
    }

    if (draft) {
      return {
        date: new Date().toISOString().split("T")[0],
        transactionType: TransactionType.TRADE_BUY,
        itemType: draft.itemType,
        itemName: draft.itemName,
        slug: draft.slug,
        price: 0,
        notes: null,
      };
    }

    return {
      date: new Date().toISOString().split("T")[0],
      transactionType: TransactionType.TRADE_SELL,
      itemType: ItemType.WARFRAME_PART,
      itemName: "",
      slug: null,
      price: 0,
      notes: null,
    };
  };

  const [formData, setFormData] = useState<TransactionFormType>(
    buildInitialFormData,
  );

  /** Value-label pairs for transaction types. */
  const transactionTypeOptions = [
    { value: TransactionType.TRADE_SELL, label: "Trade Sell" },
    { value: TransactionType.TRADE_BUY, label: "Trade Buy" },
    { value: TransactionType.MARKET_PURCHASE, label: "Market Purchase" },
    { value: TransactionType.PURCHASE, label: "Purchase" },
  ];

  /** Value-label pairs for purchased item types (only Platinum). */
  const purchaseItemTypeOptions = [
    { value: ItemType.PLATINUM, label: "Platinum" },
  ];

  /** Value-label pairs for item types purchased from the market. */
  const marketPurchaseItemTypeOptions = [
    { value: ItemType.REACTOR, label: "Reactor" },
    { value: ItemType.CATALYST, label: "Catalyst" },
    { value: ItemType.WARFRAME_SLOT, label: "Warframe Slot" },
    { value: ItemType.WEAPON_SLOT, label: "Weapon Slot" },
    { value: ItemType.ARCHWING_WEAPON_SLOT, label: "Archwing Weapon Slot" },
    { value: ItemType.VEHICLE_SLOT, label: "Vehicle Slot" },
    { value: ItemType.COMPANION_SLOT, label: "Companion Slot" },
    { value: ItemType.ARCANE_ADAPTER, label: "Arcane Adapter" },
    { value: ItemType.EXILUS_ADAPTER, label: "Exilus Adapter" },
    { value: ItemType.MOD, label: "Mod" },
    { value: ItemType.COSMETIC, label: "Cosmetic" },
  ];

  /** Autofill item name for certain item types. */
  const getAutoFillItemName = (itemType: ItemType): string => {
    switch (itemType) {
      case ItemType.REACTOR:
        return "Orokin Reactor";
      case ItemType.CATALYST:
        return "Orokin Catalyst";
      case ItemType.WARFRAME_SLOT:
        return "Warframe Slot";
      case ItemType.WEAPON_SLOT:
        return "Weapon Slot";
      case ItemType.ARCHWING_WEAPON_SLOT:
        return "Archwing Weapon Slot";
      case ItemType.COMPANION_SLOT:
        return "Companion Slot";
      case ItemType.VEHICLE_SLOT:
        return "Vehicle Slot";
      case ItemType.PLATINUM:
        return "Platinum";
      default:
        return "";
    }
  };

  // Determine if item type needs autocomplete search
  const needsItemSearch = (itemType: ItemType): boolean => {
    return [
      ItemType.WARFRAME_PART,
      ItemType.WEAPON_PART,
      ItemType.LANDING_CRAFT_PART,
      ItemType.COMPANION_PART,
      ItemType.ARCHWING_PART,
      ItemType.MOD,
    ].includes(itemType);
  };

  // Determine if item type should be auto-filled
  const shouldAutoFill = (itemType: ItemType): boolean => {
    return [
      ItemType.REACTOR,
      ItemType.CATALYST,
      ItemType.WARFRAME_SLOT,
      ItemType.WEAPON_SLOT,
      ItemType.ARCHWING_WEAPON_SLOT,
      ItemType.COMPANION_SLOT,
      ItemType.VEHICLE_SLOT,
      ItemType.PLATINUM,
    ].includes(itemType);
  };

  /** Get available item type options based on transaction type. */
  const getItemTypeOptions = () => {
    if (
      formData.transactionType === TransactionType.TRADE_BUY ||
      formData.transactionType === TransactionType.TRADE_SELL
    ) {
      return tradeItemTypeOptions;
    } else if (formData.transactionType === TransactionType.PURCHASE) {
      return purchaseItemTypeOptions;
    } else {
      return marketPurchaseItemTypeOptions;
    }
  };

  /** Handle changing the transaction type. */
  const handleTransactionTypeChange = (newTransactionType: TransactionType) => {
    const newFormData = { ...formData, transactionType: newTransactionType };

    if (newTransactionType === TransactionType.PURCHASE) {
      newFormData.itemType = ItemType.PLATINUM;
      newFormData.itemName = getAutoFillItemName(ItemType.PLATINUM);
      newFormData.slug = null;
    } else {
      const defaultItemType =
        newTransactionType === TransactionType.MARKET_PURCHASE
          ? ItemType.REACTOR
          : ItemType.WARFRAME_PART;

      newFormData.itemType = defaultItemType;

      if (shouldAutoFill(defaultItemType)) {
        newFormData.itemName = getAutoFillItemName(defaultItemType);
        newFormData.slug = null;
      } else {
        newFormData.itemName = "";
        newFormData.slug = null;
      }
    }

    setFormData(newFormData);
  };

  /** Handle changing the item type. */
  const handleItemTypeChange = (newItemType: ItemType) => {
    const newFormData = { ...formData, itemType: newItemType };

    if (shouldAutoFill(newItemType)) {
      newFormData.itemName = getAutoFillItemName(newItemType);
      newFormData.slug = null;
    } else {
      newFormData.itemName = "";
      newFormData.slug = null;
    }

    setFormData(newFormData);
  };

  /** Reset form to initial state. */
  const resetForm = () => {
    setFormData(buildInitialFormData());
  };

  /** Handle form submission. */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
        {isEditing ? "Edit Transaction" : draft ? "Log Trade" : "Add Transaction"}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              disabled={isEditing}
              className={`w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert ${
                isEditing
                  ? "border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-600 text-gray-500 dark:text-gray-400"
                  : "border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              }`}
              required={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Type
            </label>
            <Select
              value={formData.transactionType}
              options={transactionTypeOptions}
              onChange={handleTransactionTypeChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Type
            </label>
            <Select
              value={formData.itemType}
              options={getItemTypeOptions()}
              onChange={handleItemTypeChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Name
            </label>
            {shouldAutoFill(formData.itemType) ? (
              // Auto-filled for certain item types
              <input
                type="text"
                value={formData.itemName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-600 text-gray-500 dark:text-gray-400"
              />
            ) : needsItemSearch(formData.itemType) ? (
              // Autocomplete search for parts and mods
              <ItemAutocomplete
                currentValue={{
                  itemName: formData.itemName,
                  slug: formData.slug,
                }}
                onChange={(itemName: string, slug: string | null) =>
                  setFormData({ ...formData, itemName, slug })
                }
                required
              />
            ) : (
              // Simple text input for cosmetics, rivens, adapters
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) =>
                  setFormData({ ...formData, itemName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                placeholder="Enter item name"
                required
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price (Platinum)
            </label>
            <NumberInput
              currentValue={formData.price}
              onChange={(price: number) => setFormData({ ...formData, price })}
              required={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value || null })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
              placeholder="Add optional notes"
              rows={3}
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
            {isEditing ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </form>
    </>
  );
}
