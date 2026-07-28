import { NextRequest, NextResponse } from "next/server";
import { ItemPrice } from "@/app/lib/types";
import {
  fetchCurrentPrice,
  fetchThirtyDayMedian,
} from "@/app/lib/warframeMarket";

/**
 * POST /api/wishlist/prices
 *
 * Fetches current price and 30-day median price for a batch of item
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
        const [currentPrice, thirtyDayMedian] = await Promise.all([
          fetchCurrentPrice(slug),
          fetchThirtyDayMedian(slug),
        ]);
        return [slug, { currentPrice, thirtyDayMedian }] as const;
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
