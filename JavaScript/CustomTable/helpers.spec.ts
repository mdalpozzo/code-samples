import { findSubstringBounds } from './helpers';

describe('findSubstringBounds', () => {
  test('should return [0, 0] if there is no match', () => {
    const content = 'Hello, world!';
    const search = 'test';
    const result = findSubstringBounds(content, search);
    expect(result).toEqual([0, 0]);
  });

  test('should return correct index bounds for a matching substring', () => {
    const content = 'Hello, world!';
    const search = 'world';
    const result = findSubstringBounds(content, search);
    expect(result).toEqual([7, 12]);
  });

  test('should return correct index bounds for the first occurrence of a matching substring', () => {
    const content = 'Hello, world! This is a world of possibilities.';
    const search = 'world';
    const result = findSubstringBounds(content, search);
    expect(result).toEqual([7, 12]);
  });

  test('should return [0, 0] for an empty search string', () => {
    const content = 'Hello, world!';
    const search = '';
    const result = findSubstringBounds(content, search);
    expect(result).toEqual([0, 0]);
  });

  test('should return [0, 0] for an empty content string', () => {
    const content = '';
    const search = 'test';
    const result = findSubstringBounds(content, search);
    expect(result).toEqual([0, 0]);
  });

  test('should return correct index bounds for a matching substring at the beginning', () => {
    const content = 'Hello, world!';
    const search = 'Hello';
    const result = findSubstringBounds(content, search);
    expect(result).toEqual([0, 5]);
  });

  test('should return correct index bounds for a matching substring at the end', () => {
    const content = 'Hello, world!';
    const search = 'world!';
    const result = findSubstringBounds(content, search);
    expect(result).toEqual([7, 13]);
  });
});
