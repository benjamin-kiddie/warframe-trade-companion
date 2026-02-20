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
