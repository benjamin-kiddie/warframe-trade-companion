import { ipcMain } from "electron";
import { PrismaClient, TransactionType, ItemType } from "../generated/prisma/client";
import { fetchCurrentPrice, fetchMedianPrice } from "../warframeMarket";

type WishlistItemData = {
  name: string;
  slug: string;
  itemType: ItemType;
};

type ItemSetData = {
  name: string;
  items: WishlistItemData[];
};

type BuyItemData = {
  transactionType: TransactionType;
  price: number;
  notes: string | null;
  date: string;
};

export function registerWishlistIpc(prisma: PrismaClient) {
  ipcMain.handle("wishlist:get", async () => {
    const [items, sets] = await Promise.all([
      prisma.wishlistItem.findMany({
        where: { setId: null },
        orderBy: { id: "asc" },
      }),
      prisma.itemSet.findMany({
        orderBy: { id: "asc" },
        include: { items: { orderBy: { id: "asc" } } },
      }),
    ]);

    return { items, sets };
  });

  ipcMain.handle("wishlist:createItem", async (_event, data: WishlistItemData) => {
    return prisma.wishlistItem.create({ data });
  });

  ipcMain.handle(
    "wishlist:updateItem",
    async (_event, id: string, data: { notifyOnSale: boolean }) => {
      return prisma.wishlistItem.update({
        where: { id },
        data: { notifyOnSale: data.notifyOnSale },
      });
    },
  );

  // Discards one wishlist item (standalone or within a set). If it was the last item in its
  // set, the now-empty set is deleted too.
  ipcMain.handle("wishlist:deleteItem", async (_event, id: string) => {
    return prisma.$transaction(async (tx) => {
      const item = await tx.wishlistItem.delete({ where: { id } });

      if (!item.setId) {
        return { deletedSetId: null };
      }

      const remaining = await tx.wishlistItem.count({
        where: { setId: item.setId },
      });

      if (remaining > 0) {
        return { deletedSetId: null };
      }

      await tx.itemSet.delete({ where: { id: item.setId } });
      return { deletedSetId: item.setId };
    });
  });

  // Records a trade for this wishlist item as a Transaction, then removes it from the
  // wishlist (and its now-empty set, if any) — all in one transaction, so a partial failure
  // can't leave one without the other.
  ipcMain.handle(
    "wishlist:buyItem",
    async (_event, id: string, data: BuyItemData) => {
      return prisma.$transaction(async (tx) => {
        const item = await tx.wishlistItem.delete({ where: { id } });

        const transaction = await tx.transaction.create({
          data: {
            date: `${data.date}T00:00:00Z`,
            transactionType: data.transactionType,
            itemType: item.itemType,
            itemName: item.name,
            slug: item.slug,
            price: Number(data.price),
            notes: data.notes || null,
          },
        });

        let deletedSetId: string | null = null;
        if (item.setId) {
          const remaining = await tx.wishlistItem.count({
            where: { setId: item.setId },
          });

          if (remaining === 0) {
            await tx.itemSet.delete({ where: { id: item.setId } });
            deletedSetId = item.setId;
          }
        }

        return { transaction, deletedSetId };
      });
    },
  );

  ipcMain.handle("wishlist:fetchPrices", async (_event, slugs: string[]) => {
    const results = await Promise.all(
      slugs.map(async (slug) => {
        const [currentPrice, thirtyDayMedian] = await Promise.all([
          fetchCurrentPrice(slug),
          fetchMedianPrice(slug, 30),
        ]);
        return [slug, { currentPrice, thirtyDayMedian }] as const;
      }),
    );

    return Object.fromEntries(results);
  });

  ipcMain.handle("wishlist:createSet", async (_event, data: ItemSetData) => {
    return prisma.itemSet.create({
      data: {
        name: data.name,
        items: { create: data.items },
      },
      include: { items: { orderBy: { id: "asc" } } },
    });
  });

  ipcMain.handle("wishlist:deleteSet", async (_event, id: string) => {
    await prisma.itemSet.delete({ where: { id } });
  });
}
