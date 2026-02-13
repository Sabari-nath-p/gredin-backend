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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TradeAccountService } from './trade-account.service';
import { CreateTradeAccountDto } from './dto/create-trade-account.dto';
import { UpdateTradeAccountDto } from './dto/update-trade-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Trade Accounts')
@Controller('trade-accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TradeAccountController {
  constructor(private readonly tradeAccountService: TradeAccountService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new trade account',
    description: 'Create a new trading account for the authenticated user. Users can create multiple accounts.',
  })
  @ApiResponse({ status: 201, description: 'Trade account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createDto: CreateTradeAccountDto) {
    return this.tradeAccountService.create(req.user.userId, createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all trade accounts for current user',
    description: 'Retrieve all trading accounts belonging to the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'List of trade accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllByUser(@Request() req) {
    return this.tradeAccountService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific trade account',
    description: 'Retrieve details of a specific trade account. Users can only access their own accounts unless they are SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'Trade account ID' })
  @ApiResponse({ status: 200, description: 'Trade account retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your account' })
  @ApiResponse({ status: 404, description: 'Trade account not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tradeAccountService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a trade account',
    description: 'Update account name, broker name, or active status. Users can only update their own accounts unless they are SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'Trade account ID' })
  @ApiResponse({ status: 200, description: 'Trade account updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your account' })
  @ApiResponse({ status: 404, description: 'Trade account not found' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateTradeAccountDto,
  ) {
    return this.tradeAccountService.update(id, req.user.userId, req.user.role, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a trade account',
    description: 'Delete a trade account. Users can only delete their own accounts unless they are SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'Trade account ID' })
  @ApiResponse({ status: 204, description: 'Trade account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your account' })
  @ApiResponse({ status: 404, description: 'Trade account not found' })
  async delete(@Param('id') id: string, @Request() req) {
    await this.tradeAccountService.delete(id, req.user.userId, req.user.role);
  }

  // Admin endpoints
  @Get('admin/all')
  @ApiOperation({
    summary: 'Get all trade accounts (Admin only)',
    description: 'Retrieve all trade accounts across all users. Only accessible by SUPER_ADMIN.',
  })
  @ApiResponse({ status: 200, description: 'All trade accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async findAll(@Request() req) {
    // Check if user is SUPER_ADMIN (you might want to create a separate guard for this)
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }
    return this.tradeAccountService.findAll();
  }

  @Get('admin/stats')
  @ApiOperation({
    summary: 'Get trade account statistics (Admin only)',
    description: 'Retrieve statistics about all trade accounts including counts by type and market segment. Only accessible by SUPER_ADMIN.',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getStats(@Request() req) {
    // Check if user is SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Forbidden - Admin access required');
    }
    return this.tradeAccountService.getAccountStats();
  }
}
