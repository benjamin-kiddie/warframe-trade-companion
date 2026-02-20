import { useState } from "react";
import ItemAutocomplete from "@/app/components/Inputs/ItemAutocomplete";
import {
  TransactionType,
  ItemType,
  TransactionFormData as TransactionFormType,
} from "@/app/lib/types";
import NumberInput from "@/app/components/Inputs/NumberInput";

type Props = {
  /** Submission callback. */
  onSubmit: (data: TransactionFormType) => void;
  /** Cancel callback. */
  onCancel: () => void;
};

/**
 * Modal form for adding a new transaction.
 */
export default function TransactionForm({ onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState<TransactionFormType>({
    date: new Date().toISOString().split("T")[0],
    transactionType: TransactionType.TRADE_SELL,
    itemType: ItemType.WARFRAME_PART,
    itemName: "",
    slug: null,
    price: 0,
    notes: null,
  });

  /** Value-label pairs for transaction types. */
  const transactionTypeOptions = [
    { value: TransactionType.TRADE_SELL, label: "Trade Sell" },
    { value: TransactionType.TRADE_BUY, label: "Trade Buy" },
    { value: TransactionType.MARKET_PURCHASE, label: "Market Purchase" },
    { value: TransactionType.PURCHASE, label: "Purchase" },
  ];

  /** Value-label pairs for traded item types. */
  const tradeItemTypeOptions = [
    { value: ItemType.WARFRAME_PART, label: "Warframe Part" },
    { value: ItemType.WEAPON_PART, label: "Weapon Part" },
    { value: ItemType.LANDING_CRAFT_PART, label: "Landing Craft Part" },
    { value: ItemType.COMPANION_PART, label: "Companion Part" },
    { value: ItemType.ARCHWING_PART, label: "Archwing Part" },
    { value: ItemType.MOD, label: "Mod" },
    { value: ItemType.RIVEN, label: "Riven" },
  ];

  /** Value-label pairs for purchased item types (only Platinum). */
  const purchaseItemTypeOptions = [
    { value: ItemType.PLATINUM, label: "Platinum" },
  ];

  /** Value-label pairs for item types purchased from the market. */
  const marketPurchaseItemTypeOptions = [
    { value: ItemType.REACTOR, label: "Reactor" },
    { value: ItemType.CATALYST, label: "Catalyst" },
    { value: ItemType.ARCANE_ADAPTER, label: "Arcane Adapter" },
    { value: ItemType.EXILUS_ADAPTER, label: "Exilus Adapter" },
    { value: ItemType.WARFRAME_SLOT, label: "Warframe Slot" },
    { value: ItemType.WEAPON_SLOT, label: "Weapon Slot" },
    { value: ItemType.ARCHWING_WEAPON_SLOT, label: "Archwing Weapon Slot" },
    { value: ItemType.COMPANION_SLOT, label: "Companion Slot" },
    { value: ItemType.VEHICLE_SLOT, label: "Vehicle Slot" },
    { value: ItemType.COSMETIC, label: "Cosmetic" },
    { value: ItemType.MOD, label: "Mod" },
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
    setFormData({
      date: new Date().toISOString().split("T")[0],
      transactionType: TransactionType.TRADE_SELL,
      itemType: ItemType.WARFRAME_PART,
      itemName: "",
      slug: null,
      price: 0,
      notes: null,
    });
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
        Add Transaction
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
              className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert"
              required={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Type
            </label>
            <select
              value={formData.transactionType}
              onChange={(e) =>
                handleTransactionTypeChange(e.target.value as TransactionType)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
              required
            >
              {transactionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Type
            </label>
            <select
              value={formData.itemType}
              onChange={(e) => handleItemTypeChange(e.target.value as ItemType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
              required
            >
              {getItemTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            Add Transaction
          </button>
        </div>
      </form>
    </>
  );
}
