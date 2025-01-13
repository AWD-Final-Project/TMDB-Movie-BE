import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';

import { AI_API_URL, LLM_API_KEY } from '../../configs/rag-llm.config';

@Injectable()
export class AIServiceHelper {
    private static readonly httpService: HttpService = new HttpService();
    private static readonly ROUTE_ENDPOINT_MAPPING: any = {
        HOME_PAGE: '/',
        PROFILE_PAGE: '/profile',
        SEARCH_PAGE: '/search',
        CAST_PAGE: '/movie/:id/cast',
        MOVIE_PAGE: '/movie/:id',
        GENRE_PAGE: '/search/',
    };

    static getApiEndpoint(url: string): string {
        return `${AI_API_URL}${url}`;
    }

    static getNavigationEndpoint(route: string): string {
        return AIServiceHelper.ROUTE_ENDPOINT_MAPPING[route] ?? '';
    }

    static async get(url: string, options: AxiosRequestConfig = {}): Promise<any> {
        try {
            const apiEndpoint = AIServiceHelper.getApiEndpoint(url);
            const response = await lastValueFrom(this.httpService.get(apiEndpoint, options));
            return response.data;
        } catch (error) {
            throw new Error(`Error during GET request to AI service: ${error.message}`);
        }
    }

    static async post(url: string, data: any, options: AxiosRequestConfig = {}): Promise<any> {
        try {
            const apiEndpoint = AIServiceHelper.getApiEndpoint(url);
            const response = await lastValueFrom(this.httpService.post(apiEndpoint, data, options));
            return response.data;
        } catch (error) {
            throw new Error(`Error during POST request to AI service: ${error.message}`);
        }
    }

    static async search(keyword: string, field: string = 'movies', limit: number = 10): Promise<any> {
        try {
            const url = `/retriever/`;
            const response = await AIServiceHelper.get(url, {
                params: {
                    llm_api_key: LLM_API_KEY,
                    collection_name: field,
                    query: keyword,
                    amount: limit,
                },
            });
            if (!response || !response.data) {
                throw new Error('No movies found');
            }
            return response.data?.result;
        } catch (error) {
            throw new Error(`Error during searching movies: ${error.message}`);
        }
    }

    static async getSimilarMovies(queryString: string, limit: number = 10): Promise<any> {
        try {
            const url = `/retriever/`;
            const response = await AIServiceHelper.get(url, {
                params: {
                    llm_api_key: LLM_API_KEY,
                    collection_name: 'movies',
                    query: queryString,
                    amount: limit,
                    threshold: 0.25,
                },
            });
            if (!response || !response.data) {
                throw new Error('No similar movies found');
            }
            return response.data?.result;
        } catch (error) {
            throw new Error(`Error during getting similar movies: ${error.message}`);
        }
    }

    static async navigate(query: string): Promise<any> {
        try {
            const url = `/navigate/`;
            const response = await AIServiceHelper.post(
                url,
                {}, // Empty data
                {
                    params: {
                        llm_api_key: LLM_API_KEY,
                        query,
                    },
                },
            );
            if (!response || !response.data) {
                throw new Error('No data found');
            }

            console.log('Response data: ');
            console.log(response.data);
            const routeHref = AIServiceHelper.getNavigationEndpoint(response.data?.route ?? '');
            if (!routeHref) {
                throw new Error('No route found');
            }

            let bestMatchMovieId = null;
            if (['CAST_PAGE', 'MOVIE_PAGE'].includes(response.data?.route)) {
                console.log('Type 1');
                bestMatchMovieId =
                    response.data?.params?.movie_ids?.length > 0 ? response.data?.params?.movie_ids[0] : null;
                if (!bestMatchMovieId) {
                    throw new Error('No best match movie found');
                }

                return {
                    type: response.data?.route,
                    route: routeHref.replace(':id', bestMatchMovieId),
                    id: bestMatchMovieId,
                };
            } else if (['SEARCH_PAGE'].includes(response.data?.route)) {
                console.log('Type 2');
                return {
                    type: response.data?.route,
                    route: routeHref,
                    keyword: response.data?.params?.keyword,
                };
            } else if (['GENRE_PAGE'].includes(response.data?.route)) {
                console.log('Type 3');
                return {
                    type: response.data?.route,
                    route: routeHref + response.data?.params?.genre,
                    genre_ids: response.data?.params?.genre_ids,
                };
            }

            console.log('Type 4');
            return {
                type: response.data?.route,
                route: routeHref,
            };
        } catch (error) {
            throw new Error(`Error during navigating: ${error.message}`);
        }
    }
}
