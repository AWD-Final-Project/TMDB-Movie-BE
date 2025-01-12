import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';

import { AI_API_URL, LLM_API_KEY } from '../../configs/rag-llm.config';

@Injectable()
export class AIServiceHelper {
    private static readonly httpService: HttpService = new HttpService();

    static getApiEndpoint(url: string): string {
        return `${AI_API_URL}${url}`;
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
}
