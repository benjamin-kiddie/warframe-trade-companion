import { prisma } from "@/app/lib/db";
import { WishlistItem } from "@/app/generated/prisma/client";
import {
  fetchCurrentPrice,
  fetchThirtyDayMedian,
} from "@/app/lib/warframeMarket";

const DEFAULT_POLL_INTERVAL_MS = 3 * 60 * 1000;
const DEFAULT_SALE_THRESHOLD_PERCENT = 10;

const pollerGlobal = globalThis as unknown as {
  wishlistPollerStarted: boolean | undefined;
};

/**
 * Starts the background loop that checks wishlist items against warframe.market prices and posts Discord notifications for items on sale.
 * No-ops (with a log line) if DISCORD_WEBHOOK_URL isn't configured and guards against being started more than once per process.
 */
export function startWishlistPoller() {
  if (pollerGlobal.wishlistPollerStarted) {
    return;
  }

  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.log(
      "DISCORD_WEBHOOK_URL not set; wishlist sale notifications are disabled.",
    );
    return;
  }

  pollerGlobal.wishlistPollerStarted = true;

  const pollIntervalMs =
    Number(process.env.WISHLIST_POLL_INTERVAL_MS) || DEFAULT_POLL_INTERVAL_MS;

  console.log(`Starting wishlist sale poller (every ${pollIntervalMs}ms).`);

  checkWishlist();
  setInterval(checkWishlist, pollIntervalMs);
}

/**
 * Fetches live prices for every wishlist item with notifications enabled.
 * Sends a Discord notification for any that are newly on sale.
 */
async function checkWishlist() {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { notifyOnSale: true },
    });

    await Promise.all(items.map(checkItem));
  } catch (error) {
    console.error("Error checking wishlist for sale items:", error);
  }
}

/** Checks a single wishlist item's price and notifies/resets as needed. */
async function checkItem(item: WishlistItem) {
  try {
    const thresholdPercent =
      Number(process.env.WISHLIST_SALE_THRESHOLD_PERCENT) ||
      DEFAULT_SALE_THRESHOLD_PERCENT;

    const [currentPrice, thirtyDayMedian] = await Promise.all([
      fetchCurrentPrice(item.slug),
      fetchThirtyDayMedian(item.slug),
    ]);

    if (currentPrice == null || thirtyDayMedian == null) {
      return;
    }

    const discountPercent =
      ((thirtyDayMedian - currentPrice) / thirtyDayMedian) * 100;

    const isOnSale = discountPercent >= thresholdPercent;
    const isBetterThanLastNotified =
      item.saleNotifiedPrice == null || currentPrice < item.saleNotifiedPrice;

    if (isOnSale && isBetterThanLastNotified) {
      await sendDiscordNotification(
        item,
        currentPrice,
        thirtyDayMedian,
        discountPercent,
      );
      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: { saleNotifiedPrice: currentPrice },
      });
    } else if (!isOnSale && item.saleNotifiedPrice != null) {
      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: { saleNotifiedPrice: null },
      });
    }
  } catch (error) {
    console.error(`Error checking wishlist item ${item.slug}:`, error);
  }
}

/** Posts a "this item is on sale" message to the configured Discord webhook. */
async function sendDiscordNotification(
  item: WishlistItem,
  currentPrice: number,
  thirtyDayMedian: number,
  discountPercent: number,
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: `${item.name} is on sale!`,
          url: `https://warframe.market/items/${item.slug}`,
          description:
            `**${currentPrice}p** — ${discountPercent.toFixed(1)}% below ` +
            `the 30-day median (${thirtyDayMedian.toFixed(1)}p)`,
          color: 0x22c55e,
        },
      ],
    }),
  });
}
