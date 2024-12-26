export interface SearchMoviesQuery {
    key_word: string;
    include_adult?: boolean;
    language?: string;
    primary_release_year?: number;
    page?: number;
    region?: string;
    year?: number;
}
