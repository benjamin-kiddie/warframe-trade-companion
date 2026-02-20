"use client";

import { Transaction, TransactionType, Pagination } from "@/app/lib/types";

type Props = {
  /** List of transactions. */
  transactions: Transaction[];
  /** True if transactions are loading. */
  loading: boolean;
  /** Pagination information. */
  pagination: Pagination | null;
  /** Callback to change page. */
  onPageChange: (page: number) => void;
  /** Callback to open the form dialog. */
  setDialogOpen: (dialogOpen: boolean) => void;
};

/** Table showing recent transactions. */
export default function TransactionsTable({
  transactions,
  loading,
  pagination,
  onPageChange,
  setDialogOpen,
}: Props) {
  /**
   * Pick color for different transaction types.
   *
   * PURCHASE = blue, MARKET_PURCHASE = purple, TRADE_BUY = red, TRADE_SELL = green
   */
  const getTransactionTypeColor = (transactionType: TransactionType) => {
    switch (transactionType) {
      case TransactionType.PURCHASE:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case TransactionType.MARKET_PURCHASE:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case TransactionType.TRADE_BUY:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case TransactionType.TRADE_SELL:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  /** Format transaction type for display. */
  const formatTransactionType = (transactionType: TransactionType) => {
    switch (transactionType) {
      case TransactionType.PURCHASE:
        return "Purchase";
      case TransactionType.MARKET_PURCHASE:
        return "Market";
      case TransactionType.TRADE_BUY:
        return "Buy";
      case TransactionType.TRADE_SELL:
        return "Sell";
    }
  };

  /** Format item type for display. */
  const formatItemType = (itemType: string) => {
    switch (itemType) {
      case "WARFRAME_PART":
        return "Warframe Part";
      case "WEAPON_PART":
        return "Weapon Part";
      case "LANDING_CRAFT_PART":
        return "Landing Craft Part";
      case "COMPANION_PART":
        return "Companion Part";
      case "ARCHWING_PART":
        return "Archwing Part";
      case "MOD":
        return "Mod";
      case "RIVEN":
        return "Riven";
      case "REACTOR":
        return "Reactor";
      case "CATALYST":
        return "Catalyst";
      case "ARCANE_ADAPTER":
        return "Arcane Adapter";
      case "EXILUS_ADAPTER":
        return "Exilus Adapter";
      case "WARFRAME_SLOT":
        return "Warframe Slot";
      case "WEAPON_SLOT":
        return "Weapon Slot";
      case "ARCHWING_WEAPON_SLOT":
        return "Archwing Weapon Slot";
      case "COMPANION_SLOT":
        return "Companion Slot";
      case "VEHICLE_SLOT":
        return "Vehicle Slot";
      case "COSMETIC":
        return "Cosmetic";
      case "PLATINUM":
        return "Platinum";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Recent Transactions
        </h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          +
        </button>
      </div>
      {!loading && transactions.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No transactions found. Start by adding your first transaction!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {loading
                ? Array.from({ length: 7 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </td>
                    </tr>
                  ))
                : transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(transaction.date).toLocaleDateString(
                          "en-US",
                          {
                            timeZone: "UTC",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.transactionType)}`}
                        >
                          {formatTransactionType(transaction.transactionType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-900 dark:text-gray-100">
                        {formatItemType(transaction.itemType)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {transaction.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-900 dark:text-gray-100">
                        {transaction.price}p
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {transaction.notes || "-"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && !loading && (
        <div className="px-6 py-4 border-t bg-gray-50 dark:bg-zinc-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing{" "}
            {Math.min(
              (pagination.page - 1) * pagination.limit + 1,
              pagination.totalCount,
            )}{" "}
            -{" "}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount,
            )}{" "}
            of {pagination.totalCount}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
