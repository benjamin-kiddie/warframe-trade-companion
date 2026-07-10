"use client";

import CurrentBalances from "@/app/components/Accounting/CurrentBalances";
import TransactionForm from "@/app/components/Accounting/TransactionForm";
import TransactionsTable from "@/app/components/Accounting/TransactionsTable";
import {
  Balances,
  Pagination,
  Transaction,
  TransactionFormData,
  WishlistBuyRequest,
} from "@/app/lib/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  /** A "bought" wishlist item handed off from the Wishlist tab, if any. */
  pendingBuyRequest?: WishlistBuyRequest | null;
  /** Callback once a pending buy request has been picked up. */
  onBuyRequestHandled?: () => void;
};

export default function Accounting({
  pendingBuyRequest,
  onBuyRequestHandled,
}: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsPagination, setTransactionsPagination] =
    useState<Pagination | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [activeBuyRequest, setActiveBuyRequest] =
    useState<WishlistBuyRequest | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // On mount, fetch transactions and balances.
  useEffect(() => {
    fetchTransactions(1);
    fetchBalances();
  }, []);

  // Pick up a "bought" wishlist item and open the dialog pre-filled for it.
  useEffect(() => {
    if (pendingBuyRequest) {
      setEditingTransaction(null);
      setActiveBuyRequest(pendingBuyRequest);
      setDialogOpen(true);
      onBuyRequestHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBuyRequest]);

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

  /** Open the dialog to add a new transaction. */
  const openAddDialog = () => {
    setEditingTransaction(null);
    setActiveBuyRequest(null);
    setDialogOpen(true);
  };

  /** Open the dialog to edit an existing transaction. */
  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveBuyRequest(null);
    setDialogOpen(true);
  };

  /** Close the dialog, discarding any in-progress add/edit/buy. */
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
    setActiveBuyRequest(null);
  };

  /** Handle adding, editing, or buying (from the wishlist) a transaction via the API. */
  const submitTransaction = async (data: TransactionFormData) => {
    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : activeBuyRequest
          ? `/api/wishlist/items/${activeBuyRequest.wishlistItemId}/buy`
          : "/api/transactions";
      const method = editingTransaction ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const wasEditing = editingTransaction !== null;
      closeDialog();
      toast.success(wasEditing ? "Transaction updated" : "Transaction added");
      await fetchTransactions(
        wasEditing ? transactionsPagination?.page || 1 : 1,
      );
      await fetchBalances();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error(
        editingTransaction
          ? "Failed to update transaction"
          : "Failed to add transaction",
      );
    }
  };

  /** Handle deleting a transaction via the API. */
  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      toast.success("Transaction deleted");
      await fetchTransactions(transactionsPagination?.page || 1);
      await fetchBalances();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  return (
    <>
      <div className="flex flex-col xl:flex-row w-full h-full min-h-0 gap-6">
        <div className="flex-1 min-h-0 h-full">
          <TransactionsTable
            transactions={transactions}
            pagination={transactionsPagination}
            onPageChange={(page: number) => fetchTransactions(page)}
            loading={transactionsLoading}
            onAddClick={openAddDialog}
            onEdit={openEditDialog}
            onDelete={deleteTransaction}
          />
        </div>
        <div className="w-full xl:w-56 shrink-0">
          <CurrentBalances balances={balances} loading={balancesLoading} />
        </div>
      </div>
      <dialog ref={dialogRef} className="group">
        <div className="fixed inset-0 grid place-content-center bg-black/75 opacity-0 transition-opacity group-data-[open]:opacity-100">
          <div className="w-md bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg scale-75 transition-transform group-data-[open]:scale-100">
            <TransactionForm
              key={editingTransaction?.id ?? activeBuyRequest?.requestId ?? "new"}
              editingTransaction={editingTransaction}
              draft={activeBuyRequest}
              onSubmit={submitTransaction}
              onCancel={closeDialog}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
