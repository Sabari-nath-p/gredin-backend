import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { TradeEntryService } from './trade-entry.service';
import { CreateTradeEntryDto } from './dto/create-trade-entry.dto';
import { UpdateTradeEntryDto } from './dto/update-trade-entry.dto';
import { CloseTradeDto } from './dto/close-trade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Trade Entries')
@Controller('trade-entries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TradeEntryController {
    constructor(private readonly tradeEntryService: TradeEntryService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new trade entry',
        description: `Create a trade entry for a specific account. 
    - Can be created with OPEN status (default) or directly as CLOSED
    - If CLOSED, must include: result, realisedProfitLoss
    - Account balance is automatically updated for CLOSED trades:
      * PROFIT: adds (realisedProfitLoss - serviceCharge)
      * LOSS: subtracts (stopLossAmount + serviceCharge)
      * BREAK_EVEN: subtracts serviceCharge only`,
    })
    @ApiResponse({ status: 201, description: 'Trade entry created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input or missing required fields for closed trade' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Trade account not found' })
    async create(@Request() req, @Body() createDto: CreateTradeEntryDto) {
        return this.tradeEntryService.create(req.user.userId, createDto);
    }

    @Get('account/:tradeAccountId')
    @ApiOperation({
        summary: 'Get all trade entries for a specific account',
        description: 'Retrieve all trade entries for a specific trade account. Users can only view their own trades unless SUPER_ADMIN.',
    })
    @ApiParam({ name: 'tradeAccountId', description: 'Trade account ID' })
    @ApiResponse({ status: 200, description: 'Trade entries retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not your account' })
    @ApiResponse({ status: 404, description: 'Trade account not found' })
    async findAllByAccount(@Param('tradeAccountId') tradeAccountId: string, @Request() req) {
        return this.tradeEntryService.findAllByAccount(tradeAccountId, req.user.userId, req.user.role);
    }

    @Get('account/:tradeAccountId/stats')
    @ApiOperation({
        summary: 'Get trade statistics for an account',
        description: 'Get comprehensive statistics including total trades, win rate, profit/loss breakdown.',
    })
    @ApiParam({ name: 'tradeAccountId', description: 'Trade account ID' })
    @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not your account' })
    @ApiResponse({ status: 404, description: 'Trade account not found' })
    async getStats(@Param('tradeAccountId') tradeAccountId: string, @Request() req) {
        return this.tradeEntryService.getTradeStats(tradeAccountId, req.user.userId, req.user.role);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a specific trade entry',
        description: 'Retrieve detailed information about a specific trade entry.',
    })
    @ApiParam({ name: 'id', description: 'Trade entry ID' })
    @ApiResponse({ status: 200, description: 'Trade entry retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not your trade' })
    @ApiResponse({ status: 404, description: 'Trade entry not found' })
    async findOne(@Param('id') id: string, @Request() req) {
        return this.tradeEntryService.findOne(id, req.user.userId, req.user.role);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update an open trade entry',
        description: 'Update details of an OPEN trade. Cannot update CLOSED trades. Can update instrument, prices, stop loss, take profit, and notes.',
    })
    @ApiParam({ name: 'id', description: 'Trade entry ID' })
    @ApiResponse({ status: 200, description: 'Trade entry updated successfully' })
    @ApiResponse({ status: 400, description: 'Cannot update closed trade' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not your trade' })
    @ApiResponse({ status: 404, description: 'Trade entry not found' })
    async update(
        @Param('id') id: string,
        @Request() req,
        @Body() updateDto: UpdateTradeEntryDto,
    ) {
        return this.tradeEntryService.update(id, req.user.userId, req.user.role, updateDto);
    }

    @Put(':id/close')
    @ApiOperation({
        summary: 'Close an open trade',
        description: `Close an OPEN trade and update account balance automatically.
    Balance changes:
    - PROFIT: adds (realisedProfitLoss - serviceCharge) to account
    - LOSS: subtracts (stopLossAmount + serviceCharge) from account
    - BREAK_EVEN: subtracts serviceCharge only from account`,
    })
    @ApiParam({ name: 'id', description: 'Trade entry ID' })
    @ApiResponse({ status: 200, description: 'Trade closed successfully and balance updated' })
    @ApiResponse({ status: 400, description: 'Trade is already closed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not your trade' })
    @ApiResponse({ status: 404, description: 'Trade entry not found' })
    async closeTrade(
        @Param('id') id: string,
        @Request() req,
        @Body() closeDto: CloseTradeDto,
    ) {
        return this.tradeEntryService.closeTrade(id, req.user.userId, req.user.role, closeDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete a trade entry',
        description: 'Delete a trade entry. If the trade was CLOSED, the balance change will be reversed automatically.',
    })
    @ApiParam({ name: 'id', description: 'Trade entry ID' })
    @ApiResponse({ status: 204, description: 'Trade entry deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not your trade' })
    @ApiResponse({ status: 404, description: 'Trade entry not found' })
    async delete(@Param('id') id: string, @Request() req) {
        await this.tradeEntryService.delete(id, req.user.userId, req.user.role);
    }

    @Get('admin/all')
    @ApiOperation({
        summary: 'Get all trade entries (Admin only)',
        description: 'Retrieve all trade entries across all users and accounts. Only accessible by SUPER_ADMIN.',
    })
    @ApiResponse({ status: 200, description: 'All trade entries retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async findAll(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden - Admin access required');
        }
        return this.tradeEntryService.findAll();
    }
}
