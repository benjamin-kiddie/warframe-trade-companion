import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * POST /api/wishlist/items/[id]/buy
 *
 * Records a trade for this wishlist item as a Transaction, then removes it
 * from the wishlist (and its now-empty set, if any) — all in one
 * transaction, so a partial failure can't leave one without the other.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { transactionType, price, notes } = body;
    const date = `${body.date}T00:00:00Z`;

    if (!transactionType || price === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: transactionType and price are required",
        },
        { status: 400 },
      );
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.wishlistItem.delete({ where: { id } });

      const transaction = await tx.transaction.create({
        data: {
          date,
          transactionType,
          itemType: item.itemType,
          itemName: item.name,
          slug: item.slug,
          price: numPrice,
          notes: notes || null,
        },
      });

      let deletedSetId: string | null = null;
      if (item.setId) {
        const remaining = await tx.wishlistItem.count({
          where: { setId: item.setId },
        });

        if (remaining === 0) {
          await tx.itemSet.delete({ where: { id: item.setId } });
          deletedSetId = item.setId;
        }
      }

      return { transaction, deletedSetId };
    });

    return NextResponse.json(
      {
        success: true,
        transaction: result.transaction,
        deletedSetId: result.deletedSetId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error buying wishlist item:", error);
    return NextResponse.json(
      { error: "Failed to record purchase" },
      { status: 500 },
    );
  }
}
