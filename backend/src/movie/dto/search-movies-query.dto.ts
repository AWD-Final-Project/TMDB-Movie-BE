import { Transform } from 'class-transformer';
import {
    IsBooleanString,
    IsIn,
    IsInt,
    IsISO31661Alpha2,
    IsNotEmpty,
    IsOptional,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class SearchMoviesQuery {
    @IsNotEmpty({ message: 'key_word is required' })
    @MinLength(3, { message: 'Search Error: key_word must be at least 3 characters long' })
    @MaxLength(100, { message: 'Search Error: key_word length must not be greater than 100 characters' })
    key_word: string;

    @IsOptional()
    @IsIn(['title', 'cast', 'genre'], { message: 'Search Error: Invalid filter_field' })
    filter_field?: string;

    @IsOptional()
    @IsBooleanString({ message: 'Search Error: include_adult must be a boolean' })
    include_adult?: boolean;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt({ message: 'Search Error: page must be an integer' })
    @Min(1, { message: 'Search Error: page must be at least 1' })
    page?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt({ message: 'Search Error: limit must be an integer' })
    @Min(1, { message: 'Search Error: limit must be at least 1' })
    @Max(300, { message: 'Search Error: limit must not exceed 300' })
    limit?: number;

    @IsOptional()
    @IsISO31661Alpha2({ message: 'Search Error: Invalid country code for region' })
    region?: string;

    @IsOptional()
    // @IsISO31661Alpha2({ message: 'Search Error: Invalid country code for language' })
    @Matches(/^[a-z]{2}$/, { message: 'Search Error: Invalid language code, must be an ISO 639-1 two-letter code' })
    language?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt({ message: 'Search Error: year must be an integer' })
    @Min(1900, { message: 'Search Error: year must not be earlier than 1900' })
    @Max(new Date().getFullYear(), { message: `Search Error: year cannot be in the future` })
    year?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt({ message: 'Search Error: primary_release_year must be an integer' })
    @Min(1900, { message: 'Search Error: primary_release_year must not be earlier than 1900' })
    @Max(new Date().getFullYear(), { message: `Search Error: primary_release_year cannot be in the future` })
    primary_release_year?: number;
}
