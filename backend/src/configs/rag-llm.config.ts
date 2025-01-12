import * as dotenv from 'dotenv';
dotenv.config();

export const LLM_API_TOKEN = process.env.LLM_API_TOKEN || '';
export const AI_API_URL = process.env.AI_API_URL || 'http://ai:8000';
export const LLM_API_KEY = process.env.LLM_API_KEY || '';
