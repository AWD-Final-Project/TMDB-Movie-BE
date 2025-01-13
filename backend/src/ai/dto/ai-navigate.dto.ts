import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class AiNavigateQuery {
    @IsNotEmpty({ message: 'key_word is required' })
    @MinLength(1, { message: 'Search Error: key_word must be at least 1 characters long' })
    @MaxLength(250, { message: 'Search Error: key_word length must not be greater than 250 characters' })
    keyword: string;
}
