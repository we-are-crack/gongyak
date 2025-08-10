import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import { systemPrompt } from './prompt.js';

dotenv.config();

export default class Gemini {
  static #instance;

  generativeModel;

  constructor() {
    if (Gemini.#instance) {
      throw new Error('Gemini 인스턴스는 getInstance()로만 생성하세요.');
    }
    this.projectId = process.env.GCP_PROJECT_ID;
    this.location = process.env.GCP_GEMINI_LOCATION;
    this.model = process.env.GCP_GEMINI_MODEL;

    this.createAiModel();
  }

  static getInstance() {
    if (!Gemini.#instance) {
      Gemini.#instance = new Gemini();
    }
    return Gemini.#instance;
  }

  createAiModel() {
    const vertexAI = new VertexAI({ project: this.projectId, location: this.location });

    this.generativeModel = vertexAI.getGenerativeModel({
      model: this.model,
    });
  }

  async generateContent(userPrompt) {
    const request = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
    };

    const response = await this.generativeModel.generateContent(request);

    const fullTextResponse = response.response.candidates[0].content.parts[0].text;

    return fullTextResponse;
  }
}
