import {
  Balances,
  ItemSet,
  ItemSetFormData,
  Pagination,
  Transaction,
  TransactionFormData,
  ItemPrice,
  WishlistItem,
  WishlistItemFormData,
} from "@/app/lib/types";

type TransactionListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type BuyItemData = Omit<TransactionFormData, "itemName" | "itemType" | "slug">;

declare global {
  interface Window {
    api: {
      items: {
        search: (query: string) => Promise<{ slug: string; name: string }[]>;
      };
      transactions: {
        list: (
          params: TransactionListParams,
        ) => Promise<{ transactions: Transaction[]; pagination: Pagination }>;
        create: (data: TransactionFormData) => Promise<Transaction>;
        update: (id: string, data: TransactionFormData) => Promise<Transaction>;
        delete: (id: string) => Promise<void>;
        balance: () => Promise<Balances>;
      };
      wishlist: {
        get: () => Promise<{ items: WishlistItem[]; sets: ItemSet[] }>;
        createItem: (data: WishlistItemFormData) => Promise<WishlistItem>;
        updateItem: (
          id: string,
          data: { notifyOnSale: boolean },
        ) => Promise<WishlistItem>;
        deleteItem: (id: string) => Promise<{ deletedSetId: string | null }>;
        buyItem: (
          id: string,
          data: BuyItemData,
        ) => Promise<{ transaction: Transaction; deletedSetId: string | null }>;
        fetchPrices: (slugs: string[]) => Promise<Record<string, ItemPrice>>;
        createSet: (data: ItemSetFormData) => Promise<ItemSet>;
        deleteSet: (id: string) => Promise<void>;
      };
    };
  }
}

export {};
