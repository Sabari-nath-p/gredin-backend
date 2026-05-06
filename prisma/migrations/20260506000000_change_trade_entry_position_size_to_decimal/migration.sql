-- Allow fractional position sizes for trade entries.
ALTER TABLE `TradeEntry`
  MODIFY `positionSize` DECIMAL(15, 8) NULL;