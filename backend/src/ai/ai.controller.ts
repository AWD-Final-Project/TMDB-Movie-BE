import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiSearchQuery } from './dto/ai-search.dto';
import { JwtAuthGuard } from 'src/auth/auth.jwt-guard';
import { AiService } from './ai.service';
import { AiNavigateQuery } from './dto/ai-navigate.dto';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @UseGuards(JwtAuthGuard)
    @Get('search')
    @UsePipes(new ValidationPipe({ transform: true }))
    async search(@Query() query: AiSearchQuery): Promise<any> {
        const { keyword } = query;
        const field = query?.field || 'movies';
        const limit = query?.limit || 10;

        const response = await this.aiService.search(keyword, field, limit);
        return {
            statusCode: 200,
            message: 'Search successfully',
            data: response,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('navigate')
    @UsePipes(new ValidationPipe({ transform: true }))
    async navigate(@Query() query: AiNavigateQuery): Promise<any> {
        const { keyword } = query;

        const response = await this.aiService.navigate(keyword);
        return {
            statusCode: 200,
            message: 'Navigate successfully',
            data: response,
        };
    }
}
