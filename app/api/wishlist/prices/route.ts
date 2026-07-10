import { NextRequest, NextResponse } from "next/server";
import { ItemPrice } from "@/app/lib/types";

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
async function fetchCurrentPrice(slug: string): Promise<number | null> {
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

/** Fetches the 30-day average price for an item. */
async function fetchThirtyDayAverage(slug: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.warframe.market/v1/items/${slug}/statistics`,
    );
    if (!response.ok) {
      return null;
    }

    const data: WarframeMarketStatisticsResponse = await response.json();
    const recentDays = data.payload.statistics_closed["90days"].slice(-30);

    if (recentDays.length === 0) {
      return null;
    }

    const total = recentDays.reduce((sum, day) => sum + day.avg_price, 0);
    return total / recentDays.length;
  } catch (error) {
    console.error(`Error fetching statistics for ${slug}:`, error);
    return null;
  }
}

/**
 * POST /api/wishlist/prices
 *
 * Fetches current price and 30-day average price for a batch of item
 * slugs in one round trip.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slugs } = body;

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: slugs must be a non-empty array" },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      slugs.map(async (slug: string) => {
        const [currentPrice, thirtyDayAverage] = await Promise.all([
          fetchCurrentPrice(slug),
          fetchThirtyDayAverage(slug),
        ]);
        return [slug, { currentPrice, thirtyDayAverage }] as const;
      }),
    );

    const prices: Record<string, ItemPrice> = Object.fromEntries(results);

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("Error fetching wishlist prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist prices" },
      { status: 500 },
    );
  }
}
