import { BadRequestException, Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiSearchQuery } from './dto/ai-search.dto';
import { AiService } from './ai.service';
import { AiNavigateQuery } from './dto/ai-navigate.dto';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Get('search')
    @UsePipes(new ValidationPipe({ transform: true }))
    async search(@Query() query: AiSearchQuery): Promise<any> {
        const { key_word } = query;
        const field = query?.field || 'movies';
        const limit = query?.limit || 10;

        const response = await this.aiService.search(key_word, field, limit);
        return {
            statusCode: 200,
            message: 'Search successfully',
            data: response,
        };
    }

    @Get('navigate')
    @UsePipes(new ValidationPipe({ transform: true }))
    async navigate(@Query() query: AiNavigateQuery): Promise<any> {
        const { keyword } = query;

        try {
            const response = await this.aiService.navigate(keyword);
            return {
                statusCode: 200,
                message: 'Navigate successfully',
                data: response,
            };
        } catch (error) {
            throw new BadRequestException('Navigate error: ' + error.message);
        }
    }
}
