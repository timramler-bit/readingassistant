
import { WordPart } from '../types.ts';

/**
 * Calculates the Optimal Recognition Point (ORP) for a word.
 * Usually around 25-35% of the way into the word.
 */
export const getWordParts = (word: string): WordPart => {
  if (!word) return { prefix: '', pivot: '', suffix: '' };
  
  const length = word.length;
  let pivotIndex = 0;

  if (length === 1) {
    pivotIndex = 0;
  } else if (length <= 5) {
    pivotIndex = 1;
  } else if (length <= 9) {
    pivotIndex = 2;
  } else if (length <= 13) {
    pivotIndex = 3;
  } else {
    pivotIndex = 4;
  }

  return {
    prefix: word.substring(0, pivotIndex),
    pivot: word.substring(pivotIndex, pivotIndex + 1),
    suffix: word.substring(pivotIndex + 1),
  };
};

export const splitIntoWords = (text: string): string[] => {
  return text
    .replace(/[\r\n]+/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
};
