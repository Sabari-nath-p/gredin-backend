import { Module } from '@nestjs/common';
import { LogTemplateService } from './log-template.service';
import { LogTemplateController } from './log-template.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [LogTemplateController],
    providers: [LogTemplateService],
    exports: [LogTemplateService],
})
export class LogTemplateModule {}
