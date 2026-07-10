import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * GET /api/wishlist
 *
 * Fetches standalone wishlist items and item sets (with their items).
 */
export async function GET() {
  try {
    const [items, sets] = await Promise.all([
      prisma.wishlistItem.findMany({
        where: { setId: null },
        orderBy: { id: "asc" },
      }),
      prisma.itemSet.findMany({
        orderBy: { id: "asc" },
        include: { items: { orderBy: { id: "asc" } } },
      }),
    ]);

    return NextResponse.json({ items, sets });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/wishlist
 *
 * Creates a new standalone wishlist item.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, itemType } = body;

    if (!name || !slug || !itemType) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, slug, and itemType are required",
        },
        { status: 400 },
      );
    }

    const item = await prisma.wishlistItem.create({
      data: { name, slug, itemType },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Error creating wishlist item:", error);
    return NextResponse.json(
      { error: "Failed to create wishlist item" },
      { status: 500 },
    );
  }
}
