/*
  Warnings:

  - A unique constraint covering the columns `[tradeAccountId,mt5TicketId]` on the table `TradeEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `TradeAccount` ADD COLUMN `lastSyncTime` DATETIME(3) NULL,
    ADD COLUMN `mt5Login` VARCHAR(191) NULL,
    ADD COLUMN `mt5Password` VARCHAR(191) NULL,
    ADD COLUMN `mt5Server` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `TradeEntry` ADD COLUMN `mt5TicketId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `TradeEntry_tradeAccountId_mt5TicketId_key` ON `TradeEntry`(`tradeAccountId`, `mt5TicketId`);
