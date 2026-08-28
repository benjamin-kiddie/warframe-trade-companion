import { useState } from "react";
import Accounting from "@/app/components/Accounting";
import Wishlist from "@/app/components/Wishlist";
import { WishlistBuyRequest } from "@/app/lib/types";
import { Toaster } from "sonner";

type TabType = "accounting" | "wishlist";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("accounting");
  const [pendingBuyRequest, setPendingBuyRequest] =
    useState<WishlistBuyRequest | null>(null);

  /** Hand a "bought" wishlist item off to the Accounting tab to log the trade. */
  const handleRequestBuy = (request: WishlistBuyRequest) => {
    setPendingBuyRequest(request);
    setActiveTab("accounting");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "accounting":
        return (
          <Accounting
            pendingBuyRequest={pendingBuyRequest}
            onBuyRequestHandled={() => setPendingBuyRequest(null)}
          />
        );
      case "wishlist":
        return <Wishlist onRequestBuy={handleRequestBuy} />;
      default:
        return <Accounting />;
    }
  };

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-zinc-50 font-sans dark:bg-black">
      <Toaster />
      <header className="shrink-0 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Warframe Trading Companion
            </h1>
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab("accounting")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "accounting"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-700"
                }`}
              >
                Accounting
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "wishlist"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-700"
                }`}
              >
                Wishlist
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0 max-w-[1800px] w-full mx-auto px-6 py-6 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
