export enum TransactionType {
  PURCHASE = "PURCHASE",
  MARKET_PURCHASE = "MARKET_PURCHASE",
  TRADE_BUY = "TRADE_BUY",
  TRADE_SELL = "TRADE_SELL",
}

export enum ItemType {
  WARFRAME_PART = "WARFRAME_PART",
  WEAPON_PART = "WEAPON_PART",
  LANDING_CRAFT_PART = "LANDING_CRAFT_PART",
  COMPANION_PART = "COMPANION_PART",
  ARCHWING_PART = "ARCHWING_PART",
  MOD = "MOD",
  RIVEN = "RIVEN",
  REACTOR = "REACTOR",
  CATALYST = "CATALYST",
  ARCANE_ADAPTER = "ARCANE_ADAPTER",
  EXILUS_ADAPTER = "EXILUS_ADAPTER",
  WARFRAME_SLOT = "WARFRAME_SLOT",
  WEAPON_SLOT = "WEAPON_SLOT",
  ARCHWING_WEAPON_SLOT = "ARCHWING_WEAPON_SLOT",
  COMPANION_SLOT = "COMPANION_SLOT",
  VEHICLE_SLOT = "VEHICLE_SLOT",
  COSMETIC = "COSMETIC",
  PLATINUM = "PLATINUM",
}

/** Info about an individual transaction. */
export type Transaction = {
  id: string;
  date: Date;
  transactionType: TransactionType;
  itemType: ItemType;
  itemName: string;
  slug: string | null;
  price: number;
  notes: string | null;
};

/** Form data about an individual transaction. */
export type TransactionFormData = {
  date: string;
  transactionType: TransactionType;
  itemType: ItemType;
  itemName: string;
  slug: string | null;
  price: number;
  notes: string | null;
};

/** Platinum balances. */
export type Balances = {
  boughtBalance: number;
  tradedBalance: number;
};

/** Pagination information. */
export type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

/** Value-label pairs for the item types tradeable via TRADE_BUY/TRADE_SELL. */
export const tradeItemTypeOptions: { value: ItemType; label: string }[] = [
  { value: ItemType.MOD, label: "Mod" },
  { value: ItemType.RIVEN, label: "Riven" },
  { value: ItemType.WARFRAME_PART, label: "Warframe Part" },
  { value: ItemType.WEAPON_PART, label: "Weapon Part" },
  { value: ItemType.LANDING_CRAFT_PART, label: "Landing Craft Part" },
  { value: ItemType.COMPANION_PART, label: "Companion Part" },
  { value: ItemType.ARCHWING_PART, label: "Archwing Part" },
];

/** Info about an individual wishlist item. */
export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  itemType: ItemType;
  setId: string | null;
  notifyOnSale: boolean;
};

/** A named set of wishlist items tracked together. */
export type ItemSet = {
  id: string;
  name: string;
  items: WishlistItem[];
};

/** Form data for adding a standalone wishlist item, or one item within a set. */
export type WishlistItemFormData = {
  name: string;
  slug: string;
  itemType: ItemType;
};

/** Form data for creating a new item set with its initial items. */
export type ItemSetFormData = {
  name: string;
  items: WishlistItemFormData[];
};

/** Live current price and 30-day median for a single item slug. */
export type ItemPrice = {
  currentPrice: number | null;
  thirtyDayMedian: number | null;
};

/** A pending "buy" handoff from the Wishlist tab to the Accounting tab. */
export type WishlistBuyRequest = {
  requestId: string;
  wishlistItemId: string;
  itemName: string;
  slug: string;
  itemType: ItemType;
};
