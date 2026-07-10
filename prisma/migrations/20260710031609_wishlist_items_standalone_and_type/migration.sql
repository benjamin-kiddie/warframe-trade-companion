/*
  Warnings:

  - You are about to drop the column `currentPrice` on the `wishlist_items` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `wishlist_items` table. All the data in the column will be lost.
  - Added the required column `itemType` to the `wishlist_items` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_wishlist_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "setId" TEXT,
    "alertPrice" INTEGER,
    CONSTRAINT "wishlist_items_setId_fkey" FOREIGN KEY ("setId") REFERENCES "item_sets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_wishlist_items" ("alertPrice", "id", "name", "setId", "slug") SELECT "alertPrice", "id", "name", "setId", "slug" FROM "wishlist_items";
DROP TABLE "wishlist_items";
ALTER TABLE "new_wishlist_items" RENAME TO "wishlist_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
