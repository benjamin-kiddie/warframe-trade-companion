import { Notification, shell } from "electron";
import { PrismaClient, WishlistItem } from "./generated/prisma/client";
import { fetchCurrentPrice, fetchMedianPrice } from "./warframeMarket";

const DEFAULT_POLL_INTERVAL_MS = 3 * 60 * 1000;
const DEFAULT_SALE_THRESHOLD_PERCENT = 10;

/**
 * Starts the background loop that checks wishlist items against warframe.market prices and
 * notifies (native OS notification + Discord webhook) when one is discounted.
 * No-ops (with a log line) if DISCORD_WEBHOOK_URL isn't configured.
 */
export function startWishlistPoller(prisma: PrismaClient) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.log(
      "DISCORD_WEBHOOK_URL not set; wishlist sale notifications are disabled.",
    );
    return;
  }

  const pollIntervalMs =
    Number(process.env.WISHLIST_POLL_INTERVAL_MS) || DEFAULT_POLL_INTERVAL_MS;

  console.log(`Starting wishlist sale poller (every ${pollIntervalMs}ms).`);

  checkWishlist(prisma);
  setInterval(() => checkWishlist(prisma), pollIntervalMs);
}

/**
 * Fetches live prices for every wishlist item with notifications enabled.
 * Notifies for any that are newly on sale.
 */
async function checkWishlist(prisma: PrismaClient) {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { notifyOnSale: true },
    });

    await Promise.all(items.map((item) => checkItem(prisma, item)));
  } catch (error) {
    console.error("Error checking wishlist for sale items:", error);
  }
}

/** Checks a single wishlist item's price and notifies/resets as needed. */
async function checkItem(prisma: PrismaClient, item: WishlistItem) {
  try {
    const thresholdPercent =
      Number(process.env.WISHLIST_SALE_THRESHOLD_PERCENT) ||
      DEFAULT_SALE_THRESHOLD_PERCENT;

    const [currentPrice, medianPrice] = await Promise.all([
      fetchCurrentPrice(item.slug),
      fetchMedianPrice(item.slug),
    ]);

    if (currentPrice == null || medianPrice == null) {
      return;
    }

    const discountPercent = ((medianPrice - currentPrice) / medianPrice) * 100;

    const isOnSale = discountPercent >= thresholdPercent;
    const isBetterThanLastNotified =
      item.saleNotifiedPrice == null || currentPrice < item.saleNotifiedPrice;

    if (isOnSale && isBetterThanLastNotified) {
      await notifySale(item, currentPrice, medianPrice, discountPercent);
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

/** Fires a native OS notification and a Discord webhook message for an on-sale item. */
async function notifySale(
  item: WishlistItem,
  currentPrice: number,
  medianPrice: number,
  discountPercent: number,
) {
  const url = `https://warframe.market/items/${item.slug}`;
  const title = `${item.name} is on sale!`;
  const body = `${currentPrice}p — ${discountPercent.toFixed(1)}% below the median (${medianPrice.toFixed(1)}p)`;

  if (Notification.isSupported()) {
    const notification = new Notification({ title, body });
    notification.on("click", () => shell.openExternal(url));
    notification.show();
  }

  await sendDiscordNotification(
    item,
    currentPrice,
    medianPrice,
    discountPercent,
  );
}

/** Posts a "this item is on sale" message to the configured Discord webhook. */
async function sendDiscordNotification(
  item: WishlistItem,
  currentPrice: number,
  medianPrice: number,
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
            `the median (${medianPrice.toFixed(1)}p)`,
          color: 0x22c55e,
        },
      ],
    }),
  });
}
