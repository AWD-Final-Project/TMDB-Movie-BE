import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, Max, MaxLength, Min, MinLength } from 'class-validator';

export class AiSearchQuery {
    @IsNotEmpty({ message: 'key_word is required' })
    @MinLength(3, { message: 'Search Error: key_word must be at least 3 characters long' })
    @MaxLength(5000, { message: 'Search Error: key_word length must not be greater than 5000 characters' })
    key_word: string;

    @IsOptional()
    @MaxLength(50, { message: 'Search Error: field length must not be greater than 50 characters' })
    field?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @Min(2, { message: 'Search Error: limit must be greater than 1' })
    @Max(100, { message: 'Search Error: limit must be less than or equal to 100' })
    limit?: number;
}
