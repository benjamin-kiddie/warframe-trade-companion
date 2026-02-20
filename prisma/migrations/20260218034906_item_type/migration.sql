/*
  Warnings:

  - You are about to drop the column `type` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `itemType` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionType` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionType" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "slug" TEXT,
    "price" INTEGER NOT NULL,
    "notes" TEXT
);
INSERT INTO "new_transactions" ("date", "id", "itemName", "notes", "price", "slug") SELECT "date", "id", "itemName", "notes", "price", "slug" FROM "transactions";
DROP TABLE "transactions";
ALTER TABLE "new_transactions" RENAME TO "transactions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
