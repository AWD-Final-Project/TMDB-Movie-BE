// filepath: /d:/HK1 2024-2025/Advanced Web Programming/FinalProject/TMDB-Movie-BE/src/cast/cast.controller.ts
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { CastService } from './cast.service';

@Controller('cast')
export class CastController {
    constructor(private readonly castService: CastService) {}

    @Get(':castId')
    async getCastById(@Param('castId') id: string) {
        try {
            if (!id) {
                throw new BadRequestException('Cast id is required to fetch details');
            }
            const idInt = parseInt(id);
            if (isNaN(idInt)) {
                throw new BadRequestException('Cast id must be a number');
            }
            const castData = await this.castService.getCastById(idInt);
            if (castData) {
                return {
                    statusCode: 200,
                    message: 'Fetched cast with details successfully',
                    data: castData,
                };
            }
            throw new BadRequestException('Not found cast details');
        } catch (error) {
            throw new BadRequestException('Get cast details error: ' + error.message);
        }
    }
}
