import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
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
    ApiQuery,
} from '@nestjs/swagger';
import { LogTemplateService } from './log-template.service';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Log Templates')
@Controller('log-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LogTemplateController {
    constructor(private readonly logTemplateService: LogTemplateService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new log template', description: 'Create a reusable log template with custom fields (text, long text, checkbox, image).' })
    @ApiResponse({ status: 201, description: 'Template created successfully' })
    async create(@Request() req, @Body() dto: CreateLogTemplateDto) {
        return this.logTemplateService.create(req.user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all templates for current user (paginated)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
    async findAll(
        @Request() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.logTemplateService.findAllByUser(
            req.user.userId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific template with fields' })
    @ApiParam({ name: 'id', description: 'Template ID' })
    @ApiResponse({ status: 200, description: 'Template retrieved' })
    async findOne(@Param('id') id: string, @Request() req) {
        return this.logTemplateService.findOne(id, req.user.userId, req.user.role);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a template and its fields' })
    @ApiParam({ name: 'id', description: 'Template ID' })
    @ApiResponse({ status: 200, description: 'Template updated' })
    async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateLogTemplateDto) {
        return this.logTemplateService.update(id, req.user.userId, req.user.role, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a template' })
    @ApiParam({ name: 'id', description: 'Template ID' })
    @ApiResponse({ status: 204, description: 'Template deleted' })
    async delete(@Param('id') id: string, @Request() req) {
        await this.logTemplateService.delete(id, req.user.userId, req.user.role);
    }

    @Put(':id/assign/:accountId')
    @ApiOperation({ summary: 'Assign template to a trade account' })
    @ApiParam({ name: 'id', description: 'Template ID' })
    @ApiParam({ name: 'accountId', description: 'Trade account ID' })
    @ApiResponse({ status: 200, description: 'Template assigned to account' })
    async assignToAccount(
        @Param('id') id: string,
        @Param('accountId') accountId: string,
        @Request() req,
    ) {
        return this.logTemplateService.assignToAccount(id, accountId, req.user.userId, req.user.role);
    }

    @Delete('account/:accountId/template')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove template from a trade account' })
    @ApiParam({ name: 'accountId', description: 'Trade account ID' })
    @ApiResponse({ status: 204, description: 'Template unassigned from account' })
    async unassignFromAccount(@Param('accountId') accountId: string, @Request() req) {
        await this.logTemplateService.unassignFromAccount(accountId, req.user.userId, req.user.role);
    }

    @Get('account/:accountId/template')
    @ApiOperation({ summary: 'Get the template assigned to a trade account' })
    @ApiParam({ name: 'accountId', description: 'Trade account ID' })
    @ApiResponse({ status: 200, description: 'Template for account (or null)' })
    async getTemplateForAccount(@Param('accountId') accountId: string, @Request() req) {
        return this.logTemplateService.getTemplateForAccount(accountId, req.user.userId, req.user.role);
    }
}
