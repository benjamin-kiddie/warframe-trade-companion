import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * DELETE /api/wishlist/sets/[id]
 *
 * Discards a whole item set and all its items (no transaction created).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.itemSet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item set:", error);
    return NextResponse.json(
      { error: "Failed to delete item set" },
      { status: 500 },
    );
  }
}
