import { Injectable } from '@nestjs/common';
import { AIServiceHelper } from 'src/helpers/RAG-LLM/ai.service.helper';

@Injectable()
export class AiService {
    async search(keyword: any, field: string, limit: number = 10): Promise<any> {
        const data = await AIServiceHelper.search(keyword, field, limit);
        if (!data || data.length === 0) {
            return [];
        }

        return data;
    }

    async navigate(query: string): Promise<any> {
        const data = await AIServiceHelper.navigate(query);
        return data;
    }
}
