"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import WishlistList from "@/app/components/Wishlist/WishlistList";
import WishlistSummary from "@/app/components/Wishlist/WishlistSummary";
import WishlistForm from "@/app/components/Wishlist/WishlistForm";
import { sumKnownPrices } from "@/app/lib/pricing";
import {
  ItemPrice,
  ItemSet,
  ItemSetFormData,
  WishlistBuyRequest,
  WishlistItem,
  WishlistItemFormData,
} from "@/app/lib/types";

type Props = {
  /** Callback to hand a "bought" item off to the Accounting tab. */
  onRequestBuy: (request: WishlistBuyRequest) => void;
};

export default function Wishlist({ onRequestBuy }: Props) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [sets, setSets] = useState<ItemSet[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, ItemPrice>>({});
  const [pricesLoading, setPricesLoading] = useState(true);
  const [tradedBalance, setTradedBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // On mount, fetch the wishlist and the traded balance.
  useEffect(() => {
    fetchWishlist();
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle dialog state.
  useEffect(() => {
    const dialog = dialogRef.current!;
    if (dialogOpen) {
      dialog.showModal();
      dialog.dataset.open = "";
    } else {
      delete dialog.dataset.open;
      const handler = () => dialog.close();
      const inner = dialog.children[0] as HTMLElement;
      inner.addEventListener("transitionend", handler);
      return () => inner.removeEventListener("transitionend", handler);
    }
  }, [dialogOpen]);

  /** Handle fetching the wishlist (standalone items + sets) from the API. */
  const fetchWishlist = async () => {
    try {
      setEntriesLoading(true);
      const data = await window.api.wishlist.get();
      const fetchedItems: WishlistItem[] = data.items || [];
      const fetchedSets: ItemSet[] = data.sets || [];
      setItems(fetchedItems);
      setSets(fetchedSets);
      await fetchPrices(fetchedItems, fetchedSets);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
      setItems([]);
      setSets([]);
    } finally {
      setEntriesLoading(false);
    }
  };

  /** Handle fetching the traded platinum balance from the API. */
  const fetchBalance = async () => {
    try {
      const data = await window.api.transactions.balance();
      setTradedBalance(data.tradedBalance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  /** Handle fetching live prices for every slug currently on the wishlist. */
  const fetchPrices = async (
    currentItems: WishlistItem[],
    currentSets: ItemSet[],
  ) => {
    const slugs = Array.from(
      new Set([
        ...currentItems.map((item) => item.slug),
        ...currentSets.flatMap((set) => set.items.map((item) => item.slug)),
      ]),
    );

    if (slugs.length === 0) {
      setPrices({});
      setPricesLoading(false);
      return;
    }

    try {
      setPricesLoading(true);
      const prices = await window.api.wishlist.fetchPrices(slugs);
      setPrices(prices || {});
    } catch (error) {
      console.error("Error fetching wishlist prices:", error);
      toast.error("Failed to load current prices");
    } finally {
      setPricesLoading(false);
    }
  };

  /** Handle adding a new standalone wishlist item. */
  const submitItem = async (data: WishlistItemFormData) => {
    try {
      await window.api.wishlist.createItem(data);
      setDialogOpen(false);
      toast.success("Item added to wishlist");
      await fetchWishlist();
    } catch (error) {
      console.error("Error adding wishlist item:", error);
      toast.error("Failed to add item");
    }
  };

  /** Handle adding a new set with its items. */
  const submitSet = async (data: ItemSetFormData) => {
    try {
      await window.api.wishlist.createSet(data);
      setDialogOpen(false);
      toast.success("Set added to wishlist");
      await fetchWishlist();
    } catch (error) {
      console.error("Error adding item set:", error);
      toast.error("Failed to add set");
    }
  };

  /** Handle discarding a standalone or set item, with no transaction created. */
  const discardItem = async (item: WishlistItem) => {
    try {
      await window.api.wishlist.deleteItem(item.id);
      toast.success("Removed from wishlist");
      await fetchWishlist();
    } catch (error) {
      console.error("Error removing wishlist item:", error);
      toast.error("Failed to remove item");
    }
  };

  /** Handle toggling sale notifications for a standalone or set item. */
  const toggleNotify = async (item: WishlistItem) => {
    try {
      await window.api.wishlist.updateItem(item.id, {
        notifyOnSale: !item.notifyOnSale,
      });
      await fetchWishlist();
    } catch (error) {
      console.error("Error updating wishlist item:", error);
      toast.error("Failed to update notification setting");
    }
  };

  /** Handle discarding a whole set. */
  const discardSet = async (set: ItemSet) => {
    try {
      await window.api.wishlist.deleteSet(set.id);
      toast.success("Set removed from wishlist");
      await fetchWishlist();
    } catch (error) {
      console.error("Error removing item set:", error);
      toast.error("Failed to remove set");
    }
  };

  /** Handle marking an item bought — hands off to the Accounting tab to log the trade. */
  const handleBought = (item: WishlistItem) => {
    onRequestBuy({
      requestId: crypto.randomUUID(),
      wishlistItemId: item.id,
      itemName: item.name,
      slug: item.slug,
      itemType: item.itemType,
    });
  };

  const allSlugs = [
    ...items.map((item) => item.slug),
    ...sets.flatMap((set) => set.items.map((item) => item.slug)),
  ];
  const totalWishlistCost = sumKnownPrices(
    allSlugs.map((slug) => prices[slug]?.currentPrice),
  );

  return (
    <>
      <div className="flex flex-col xl:flex-row w-full h-full min-h-0 gap-6">
        <div className="flex-1 min-h-0 h-full">
          <WishlistList
            items={items}
            sets={sets}
            prices={prices}
            entriesLoading={entriesLoading}
            pricesLoading={pricesLoading}
            onAddClick={() => setDialogOpen(true)}
            onBought={handleBought}
            onDiscardItem={discardItem}
            onToggleNotify={toggleNotify}
            onDiscardSet={discardSet}
          />
        </div>
        <div className="w-full xl:w-56 shrink-0">
          <WishlistSummary
            totalWishlistCost={totalWishlistCost}
            tradedBalance={tradedBalance}
            loading={balanceLoading}
          />
        </div>
      </div>
      <dialog ref={dialogRef} className="group">
        <div className="fixed inset-0 grid place-content-center bg-black/75 opacity-0 transition-opacity group-data-[open]:opacity-100">
          <div className="w-md bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg scale-75 transition-transform group-data-[open]:scale-100">
            <WishlistForm
              onSubmitItem={submitItem}
              onSubmitSet={submitSet}
              onCancel={() => setDialogOpen(false)}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
