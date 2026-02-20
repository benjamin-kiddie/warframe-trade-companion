import { NextRequest, NextResponse } from "next/server";

/** Structure of shortened item data from warframe.market. */
type WarframeMarketItemShort = {
  id: string;
  slug: string;
  gameRef: string;
  tags: string[];
  maxRank?: number;
  bulkTradable?: boolean;
  i18n: {
    en: {
      name: string;
      icon: string;
      thumb: string;
    };
  };
};

/** Structure of response from api.warframe.market/v2/items */
type WarframeMarketItemResponse = {
  apiVersion: string;
  data: WarframeMarketItemShort[];
};

/**
 * GET /items
 *
 * Returns a list of items from warframe.market with an English name containing the given query string.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.warframe.market/v2/items");
    if (!response.ok) {
      throw new Error(`Warframe Market API returned ${response.status}`);
    }

    const data: WarframeMarketItemResponse = await response.json();
    const items = data.data
      .filter((item) =>
        item.i18n.en.name.toLowerCase().includes(query.toLowerCase()),
      )
      .map((item) => ({
        slug: item.slug,
        name: item.i18n.en.name,
      }));

    return NextResponse.json({
      items: items,
    });
  } catch (error) {
    console.error("Error looking up items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items from Warframe Market" },
      { status: 500 },
    );
  }
}
