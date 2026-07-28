import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * PATCH /api/wishlist/items/[id]
 *
 * Updates a wishlist item's notifyOnSale flag.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { notifyOnSale } = body;

    if (typeof notifyOnSale !== "boolean") {
      return NextResponse.json(
        { error: "Missing required field: notifyOnSale must be a boolean" },
        { status: 400 },
      );
    }

    const item = await prisma.wishlistItem.update({
      where: { id },
      data: { notifyOnSale },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist item" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/wishlist/items/[id]
 *
 * Discards one wishlist item (standalone or within a set), with no
 * transaction created. If it was the last item in its set, the now-empty
 * set is deleted too.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const deletedSetId = await prisma.$transaction(async (tx) => {
      const item = await tx.wishlistItem.delete({ where: { id } });

      if (!item.setId) {
        return null;
      }

      const remaining = await tx.wishlistItem.count({
        where: { setId: item.setId },
      });

      if (remaining > 0) {
        return null;
      }

      await tx.itemSet.delete({ where: { id: item.setId } });
      return item.setId;
    });

    return NextResponse.json({ success: true, deletedSetId });
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    return NextResponse.json(
      { error: "Failed to delete wishlist item" },
      { status: 500 },
    );
  }
}
