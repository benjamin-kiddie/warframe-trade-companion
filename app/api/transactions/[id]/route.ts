import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * PATCH /api/transactions/[id]
 *
 * Updates a transaction. The date it occurred on cannot be changed, so it
 * is ignored even if present in the request body.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { transactionType, itemType, itemName, slug, price, notes } = body;

    if (!transactionType || !itemType || !itemName || price === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: transactionType, itemType, itemName, and price are required",
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

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        transactionType,
        itemType,
        itemName,
        slug: slug || null,
        price: numPrice,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/transactions/[id]
 *
 * Deletes a transaction.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
}
