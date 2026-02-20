"use client";

import { Balances } from "@/app/lib/types";

type Props = {
  /** Current balances. */
  balances: Balances | null;
  /** True if balances are loading. */
  loading: boolean;
};

/** Shows current balances. */
export default function CurrentBalances({ balances, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-10">
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-28"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const boughtBalance = balances?.boughtBalance || 0;
  const tradedBalance = balances?.tradedBalance || 0;
  const totalBalance = boughtBalance + tradedBalance;

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Bought Platinum
        </h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {boughtBalance}p
        </p>
      </div>
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Traded Platinum
        </h3>
        <p
          className={`text-2xl font-bold ${
            tradedBalance >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {tradedBalance}p
        </p>
      </div>
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Total Balance
        </h3>
        <p className={"text-2xl font-bold text-green-600 dark:text-green-400"}>
          {totalBalance}p
        </p>
      </div>
    </div>
  );
}
