-- AlterTable
ALTER TABLE `TradeAccount` ADD COLUMN `logTemplateId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `LogTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LogTemplate_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogTemplateField` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `fieldName` VARCHAR(191) NOT NULL,
    `fieldType` ENUM('TEXT', 'LONG_TEXT', 'CHECKBOX', 'IMAGE') NOT NULL,
    `fieldOrder` INTEGER NOT NULL,
    `placeholder` VARCHAR(191) NULL,
    `defaultValue` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LogTemplateField_templateId_idx`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradeFieldValue` (
    `id` VARCHAR(191) NOT NULL,
    `tradeEntryId` VARCHAR(191) NOT NULL,
    `fieldId` VARCHAR(191) NOT NULL,
    `textValue` TEXT NULL,
    `booleanValue` BOOLEAN NULL,
    `imageUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TradeFieldValue_tradeEntryId_idx`(`tradeEntryId`),
    INDEX `TradeFieldValue_fieldId_idx`(`fieldId`),
    UNIQUE INDEX `TradeFieldValue_tradeEntryId_fieldId_key`(`tradeEntryId`, `fieldId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `TradeAccount_logTemplateId_idx` ON `TradeAccount`(`logTemplateId`);

-- AddForeignKey
ALTER TABLE `TradeAccount` ADD CONSTRAINT `TradeAccount_logTemplateId_fkey` FOREIGN KEY (`logTemplateId`) REFERENCES `LogTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogTemplate` ADD CONSTRAINT `LogTemplate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogTemplateField` ADD CONSTRAINT `LogTemplateField_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `LogTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeFieldValue` ADD CONSTRAINT `TradeFieldValue_tradeEntryId_fkey` FOREIGN KEY (`tradeEntryId`) REFERENCES `TradeEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeFieldValue` ADD CONSTRAINT `TradeFieldValue_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `LogTemplateField`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
