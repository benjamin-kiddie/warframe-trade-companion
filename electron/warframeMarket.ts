/** Shape of a single order from api.warframe.market/v2/orders/item/{slug}. */
type WarframeMarketOrder = {
  type: "buy" | "sell";
  platinum: number;
  visible: boolean;
  user: {
    status: "offline" | "ingame" | "UNKNOWN";
  };
};

/** Shape of the response from api.warframe.market/v2/orders/item/{slug}. */
type WarframeMarketOrdersResponse = {
  data: WarframeMarketOrder[];
};

/** Shape of a single daily entry from api.warframe.market/v1/items/{slug}/statistics. */
type WarframeMarketStatEntry = {
  avg_price: number;
};

/** Shape of the response from api.warframe.market/v1/items/{slug}/statistics. */
type WarframeMarketStatisticsResponse = {
  payload: {
    statistics_closed: {
      "90days": WarframeMarketStatEntry[];
    };
  };
};

/**
 * Fetches the current actionable price for an item: the lowest sell order
 * from a seller who is actually in-game right now. A low offline listing
 * isn't fulfillable, so it's excluded rather than used as a fallback.
 */
export async function fetchCurrentPrice(slug: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.warframe.market/v2/orders/item/${slug}`,
    );
    if (!response.ok) {
      return null;
    }

    const data: WarframeMarketOrdersResponse = await response.json();
    const availablePrices = data.data
      .filter(
        (order) =>
          order.type === "sell" &&
          order.visible &&
          order.user.status === "ingame",
      )
      .map((order) => order.platinum);

    return availablePrices.length > 0 ? Math.min(...availablePrices) : null;
  } catch (error) {
    console.error(`Error fetching current price for ${slug}:`, error);
    return null;
  }
}

/**
 * Fetches the median closed-trade price for an item, over the last `days`
 * days (or the full ~90-day window warframe.market returns, if omitted).
 * Median is used instead of a mean so a handful of unusually high/low closed
 * trades don't skew the baseline used for sale comparisons.
 */
export async function fetchMedianPrice(
  slug: string,
  days?: number,
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.warframe.market/v1/items/${slug}/statistics`,
    );
    if (!response.ok) {
      return null;
    }

    const data: WarframeMarketStatisticsResponse = await response.json();
    const allDays = data.payload.statistics_closed["90days"];
    const recentDays = days ? allDays.slice(-days) : allDays;

    if (recentDays.length === 0) {
      return null;
    }

    const sortedPrices = recentDays
      .map((day) => day.avg_price)
      .sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);

    return sortedPrices.length % 2 !== 0
      ? sortedPrices[mid]
      : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
  } catch (error) {
    console.error(`Error fetching statistics for ${slug}:`, error);
    return null;
  }
}
