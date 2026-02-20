"use client";

import CurrentBalances from "@/app/components/Accounting/CurrentBalances";
import TransactionForm from "@/app/components/Accounting/TransactionForm";
import TransactionsTable from "@/app/components/Accounting/TransactionsTable";
import {
  Balances,
  Pagination,
  Transaction,
  TransactionFormData,
} from "@/app/lib/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Accounting() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsPagination, setTransactionsPagination] =
    useState<Pagination | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // On mount, fetch transactions and balances.
  useEffect(() => {
    fetchTransactions(1);
    fetchBalances();
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

  /** Handle fetching transactions from the API. */
  const fetchTransactions = async (page: number) => {
    try {
      setTransactionsLoading(true);
      const response = await fetch(`/api/transactions?limit=10&page=${page}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setTransactionsPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  /** Handle fetching balances from the API. */
  const fetchBalances = async () => {
    try {
      const response = await fetch("/api/transactions/balance");
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setBalances(data);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setBalancesLoading(false);
    }
  };

  /** Handle adding a new transaction via the API. */
  const submitNewTransaction = async (newTransaction: TransactionFormData) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      setDialogOpen(false);
      toast.success("Transaction added");
      await fetchTransactions(1);
      await fetchBalances();
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  return (
    <>
      <div className="flex flex-col xl:flex-row w-full gap-6">
        <div className="flex-1">
          <TransactionsTable
            transactions={transactions}
            pagination={transactionsPagination}
            onPageChange={(page: number) => fetchTransactions(page)}
            loading={transactionsLoading}
            setDialogOpen={setDialogOpen}
          />
        </div>
        <div className="w-full xl:w-72">
          <CurrentBalances balances={balances} loading={balancesLoading} />
        </div>
      </div>
      <dialog ref={dialogRef} className="group">
        <div className="fixed inset-0 grid place-content-center bg-black/75 opacity-0 transition-opacity group-data-[open]:opacity-100">
          <div className="w-md bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg scale-75 transition-transform group-data-[open]:scale-100">
            <TransactionForm
              onSubmit={submitNewTransaction}
              onCancel={() => setDialogOpen(false)}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
