import { ipcMain } from "electron";
import { PrismaClient, TransactionType, ItemType } from "../generated/prisma/client";

type ListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type TransactionData = {
  date: string;
  transactionType: TransactionType;
  itemType: ItemType;
  itemName: string;
  slug: string | null;
  price: number;
  notes: string | null;
};

export function registerTransactionsIpc(prisma: PrismaClient) {
  ipcMain.handle("transactions:list", async (_event, params: ListParams) => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const offset = (page - 1) * limit;
    const sortBy = params.sortBy ?? "date";
    const sortOrder = params.sortOrder ?? "desc";

    // CUID embeds a timestamp+counter prefix, so sort by ID on same day to break ties.
    const orderBy =
      sortBy === "id"
        ? { id: sortOrder }
        : [{ [sortBy]: sortOrder }, { id: sortOrder }];

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({ skip: offset, take: limit, orderBy }),
      prisma.transaction.count(),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  });

  ipcMain.handle("transactions:create", async (_event, data: TransactionData) => {
    return prisma.transaction.create({
      data: {
        date: `${data.date}T00:00:00Z`,
        transactionType: data.transactionType,
        itemType: data.itemType,
        itemName: data.itemName,
        slug: data.slug || null,
        price: Number(data.price),
        notes: data.notes || null,
      },
    });
  });

  ipcMain.handle(
    "transactions:update",
    async (_event, id: string, data: TransactionData) => {
      return prisma.transaction.update({
        where: { id },
        data: {
          transactionType: data.transactionType,
          itemType: data.itemType,
          itemName: data.itemName,
          slug: data.slug || null,
          price: Number(data.price),
          notes: data.notes || null,
        },
      });
    },
  );

  ipcMain.handle("transactions:delete", async (_event, id: string) => {
    await prisma.transaction.delete({ where: { id } });
  });

  ipcMain.handle("transactions:balance", async () => {
    const [purchaseData, marketPurchaseData, tradeBuyData, tradeSellData] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: { transactionType: "PURCHASE" },
          _sum: { price: true },
        }),
        prisma.transaction.aggregate({
          where: { transactionType: "MARKET_PURCHASE" },
          _sum: { price: true },
        }),
        prisma.transaction.aggregate({
          where: { transactionType: "TRADE_BUY" },
          _sum: { price: true },
        }),
        prisma.transaction.aggregate({
          where: { transactionType: "TRADE_SELL" },
          _sum: { price: true },
        }),
      ]);

    const totalPurchase = purchaseData._sum?.price || 0;
    const totalMarketPurchase = marketPurchaseData._sum?.price || 0;
    const totalTradeBuy = tradeBuyData._sum?.price || 0;
    const totalTradeSell = tradeSellData._sum?.price || 0;

    return {
      boughtBalance: totalPurchase - totalMarketPurchase,
      tradedBalance: totalTradeSell - totalTradeBuy,
    };
  });
}
