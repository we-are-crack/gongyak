import { pipeline } from '@xenova/transformers';

/**
 * 문장 임베딩 추출 함수
 * @param {string} searchQuery - 입력 문장
 * @returns {Float32Array(384)} - 384차원 임베딩 벡터
 */
const getEmbedding = async searchQuery => {
  if (typeof searchQuery !== 'string' || searchQuery.trim() === '') {
    throw new TypeError('searchQuery must be a non-empty string');
  }

  try {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor(searchQuery, {
      pooling: 'mean',
      normalize: false,
    });

    return output.data;
  } catch (error) {
    throw new Error(`임베딩 추출 실패: ${error.message}`);
  }
};

export default getEmbedding;
