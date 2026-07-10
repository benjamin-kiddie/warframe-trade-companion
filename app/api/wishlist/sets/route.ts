import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { ItemType } from "@/app/generated/prisma/client";

/**
 * POST /api/wishlist/sets
 *
 * Creates a new item set along with its initial items in one request.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, items } = body;

    if (!name || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name and at least one item are required",
        },
        { status: 400 },
      );
    }

    for (const item of items) {
      if (!item.name || !item.slug || !item.itemType) {
        return NextResponse.json(
          { error: "Each item requires name, slug, and itemType" },
          { status: 400 },
        );
      }
    }

    const set = await prisma.itemSet.create({
      data: {
        name,
        items: {
          create: items.map(
            (item: { name: string; slug: string; itemType: ItemType }) => ({
              name: item.name,
              slug: item.slug,
              itemType: item.itemType,
            }),
          ),
        },
      },
      include: { items: { orderBy: { id: "asc" } } },
    });

    return NextResponse.json({ success: true, set }, { status: 201 });
  } catch (error) {
    console.error("Error creating item set:", error);
    return NextResponse.json(
      { error: "Failed to create item set" },
      { status: 500 },
    );
  }
}
