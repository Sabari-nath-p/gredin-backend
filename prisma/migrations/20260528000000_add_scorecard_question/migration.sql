-- Add SCORECARD log-template fields and persist trade scoring.
-- Backward compatible: all new columns are NULLable.

ALTER TABLE `LogTemplateField`
  MODIFY `fieldType` ENUM('TEXT', 'LONG_TEXT', 'CHECKBOX', 'IMAGE', 'MULTIPLE_CHOICE', 'SCORECARD') NOT NULL;

ALTER TABLE `TradeEntry`
  ADD COLUMN `tradeScore` DECIMAL(5, 2) NULL;

ALTER TABLE `TradeFieldValue`
  ADD COLUMN `selectedOption` TEXT NULL,
  ADD COLUMN `selectedScore` INT NULL,
  ADD COLUMN `questionWeight` DECIMAL(5, 2) NULL,
  ADD COLUMN `contribution` DECIMAL(5, 2) NULL;
