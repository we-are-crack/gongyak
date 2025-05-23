import { getEmbedding } from '../../utils/embedding.js';
import { jest } from '@jest/globals';

jest.setTimeout(10000); // 10초로 전체 테스트 타임아웃 증가

// https://github.com/microsoft/onnxruntime/issues/16622
const originalImplementation = Array.isArray;
Array.isArray = jest.fn(type => {
  if (!type) return false;
  if (type.constructor && (type.constructor.name === 'Float32Array' || type.constructor.name === 'BigInt64Array')) {
    return true;
  }
  return originalImplementation(type);
});

describe('getEmbedding', () => {
  it('should return a 384-dimensional embedding vector', async () => {
    const searchQuery = '테스트 문장';
    const embedding = await getEmbedding(searchQuery);
    expect(embedding).toHaveLength(384);
    expect(typeof embedding[0]).toBe('number');
  });

  it('should throw an error for empty input', async () => {
    const searchQuery = '';
    await expect(getEmbedding(searchQuery)).rejects.toThrow();
  });

  it('should throw an error for invalid input', async () => {
    const searchQuery = null;
    await expect(getEmbedding(searchQuery)).rejects.toThrow();
  });
});
