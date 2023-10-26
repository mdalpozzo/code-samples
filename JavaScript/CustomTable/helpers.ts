/* eslint-disable no-plusplus */

const nonAlphaNumericRegex = /[^a-zA-Z0-9]/g;

/**
 * @description Returns a tuple containing the index bounds of the matching substring. Should return [0,0] if there is no match
 */
export const findSubstringBounds = (content: string, search: string) => {
  if (!search) {
    return [0, 0];
  }

  const indexOfMatch = content.indexOf(search);

  if (indexOfMatch === -1) {
    return [0, 0];
  }

  const mutableContent = content.split(search);
  const startingIndexOfMatch = mutableContent[0]?.length || 0;
  const endingIndexOfMatch = startingIndexOfMatch + search.length;
  return [startingIndexOfMatch, endingIndexOfMatch];
};

/**
 * @description Removes all non-alphanumeric characters from a string
 */
export const cleanPhoneString = (str: string) => str.replace(nonAlphaNumericRegex, '');

/**
 * @description Returns a tuple containing the index bounds of the matching substring.  Ignores non-alphanumeric characters.
 */
export const findAlphanumericSubstringBounds = (
  content: string,
  search: string
): [number, number] => {
  const cleanedContent = cleanPhoneString(content);
  const cleanedSearch = cleanPhoneString(search);

  const [startingIndexOfMatch, endingIndexOfMatch] = findSubstringBounds(
    cleanedContent,
    cleanedSearch
  );

  // Find the original indices in the content string
  let originalStart = 0;
  for (let i = 0; i < startingIndexOfMatch; i++) {
    while (nonAlphaNumericRegex.test(content[originalStart])) {
      originalStart++;
    }
    originalStart++;
  }

  let originalEnd = originalStart;
  for (let i = 0; i < endingIndexOfMatch - startingIndexOfMatch; i++) {
    while (nonAlphaNumericRegex.test(content[originalEnd])) {
      originalEnd++;
    }
    originalEnd++;
  }

  return [originalStart, originalEnd];
};

/**
 * @description Returns true if the search string is a substring of the content string.  Ignores case.
 */
export const isSubstringIgnoreCase = (content: string, search: string): boolean => {
  return (
    !!search &&
    !!content &&
    typeof content === 'string' &&
    content.toLowerCase().includes(search.toLowerCase())
  );
};
