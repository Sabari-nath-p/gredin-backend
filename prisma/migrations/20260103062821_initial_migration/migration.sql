-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('SUPER_ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `authProvider` ENUM('EMAIL', 'GOOGLE') NOT NULL DEFAULT 'EMAIL',
    `googleId` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_googleId_key`(`googleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtpSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OtpSession_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradeAccount` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `brokerName` VARCHAR(191) NOT NULL,
    `marketSegment` ENUM('STOCK', 'AUCTION', 'FUTURES', 'OPTIONS', 'FOREX', 'CRYPTO', 'COMMODITIES') NOT NULL,
    `currencyCode` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `initialBalance` DECIMAL(15, 2) NOT NULL,
    `currentBalance` DECIMAL(15, 2) NOT NULL,
    `accountType` ENUM('DEMO', 'LIVE', 'FUNDED') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TradeAccount_userId_idx`(`userId`),
    INDEX `TradeAccount_accountType_idx`(`accountType`),
    INDEX `TradeAccount_marketSegment_idx`(`marketSegment`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradeEntry` (
    `id` VARCHAR(191) NOT NULL,
    `tradeAccountId` VARCHAR(191) NOT NULL,
    `entryDateTime` DATETIME(3) NOT NULL,
    `instrument` VARCHAR(191) NOT NULL,
    `direction` ENUM('BUY', 'SELL') NOT NULL,
    `entryPrice` DECIMAL(15, 2) NULL,
    `positionSize` INTEGER NULL,
    `stopLossAmount` DECIMAL(15, 2) NOT NULL,
    `takeProfitAmount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `result` ENUM('PROFIT', 'LOSS', 'BREAK_EVEN') NULL,
    `realisedProfitLoss` DECIMAL(15, 2) NULL,
    `serviceCharge` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TradeEntry_tradeAccountId_idx`(`tradeAccountId`),
    INDEX `TradeEntry_status_idx`(`status`),
    INDEX `TradeEntry_entryDateTime_idx`(`entryDateTime`),
    INDEX `TradeEntry_instrument_idx`(`instrument`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OtpSession` ADD CONSTRAINT `OtpSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeAccount` ADD CONSTRAINT `TradeAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeEntry` ADD CONSTRAINT `TradeEntry_tradeAccountId_fkey` FOREIGN KEY (`tradeAccountId`) REFERENCES `TradeAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
