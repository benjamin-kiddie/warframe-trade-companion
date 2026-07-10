import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * GET /api/transactions
 *
 * Fetches transaction history.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // CUID embeds a timestamp+counter prefix, so sort by ID on same day to break ties
    const orderBy =
      sortBy === "id"
        ? { id: sortOrder }
        : [{ [sortBy]: sortOrder }, { id: sortOrder }];

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        skip: offset,
        take: limit,
        orderBy,
      }),
      prisma.transaction.count(),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/transactions
 *
 * Creates and inserts a new transaction.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionType, itemType, itemName, slug, price, notes } = body;
    const date = `${body.date}T00:00:00Z`;

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

    const transaction = await prisma.transaction.create({
      data: {
        date,
        transactionType,
        itemType,
        itemName,
        slug: slug || null,
        price: numPrice,
        notes: notes || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        transaction,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
