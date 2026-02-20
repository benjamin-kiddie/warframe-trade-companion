import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { TransactionType } from "@/app/generated/prisma/client";

/**
 * GET /api/transactions/balance
 *
 * Fetches bought and traded platinum balances.
 */
export async function GET() {
  try {
    const [purchaseData, marketPurchaseData, tradeBuyData, tradeSellData] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: { transactionType: TransactionType.PURCHASE },
          _sum: { price: true },
        }),
        prisma.transaction.aggregate({
          where: { transactionType: TransactionType.MARKET_PURCHASE },
          _sum: { price: true },
        }),
        prisma.transaction.aggregate({
          where: { transactionType: TransactionType.TRADE_BUY },
          _sum: { price: true },
        }),
        prisma.transaction.aggregate({
          where: { transactionType: TransactionType.TRADE_SELL },
          _sum: { price: true },
        }),
      ]);

    const totalPurchase = purchaseData._sum?.price || 0;
    const totalMarketPurchase = marketPurchaseData._sum?.price || 0;
    const totalTradeBuy = tradeBuyData._sum?.price || 0;
    const totalTradeSell = tradeSellData._sum?.price || 0;

    const boughtBalance = totalPurchase - totalMarketPurchase;
    const tradedBalance = totalTradeSell - totalTradeBuy;

    return NextResponse.json({
      boughtBalance,
      tradedBalance,
    });
  } catch (error) {
    console.error("Error calculating platinum balances:", error);
    return NextResponse.json(
      { error: "Failed to calculate platinum balances" },
      { status: 500 },
    );
  }
}
