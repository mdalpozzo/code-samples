import { cleanPhoneString } from './helpers';

/**
 * @description escapes special character wildcards for hasura search filter _ and &
 * @param {string} originalSearchText String typed into search field
 * @returns {string} formatted search text
 */
const generateFormattedSearchText = (originalSearchText) => {
  const underscoreEscaped = originalSearchText.split('_').join('\\_');
  const ampersandEscaped = underscoreEscaped.split('&').join('\\&');
  return ampersandEscaped;
};

export const generateGQLSearchArgument = (searchText, parts, filterObject = {}) => {
  if (!searchText) {
    return {};
  }

  const newParts = [...parts];
  const currentPath = newParts.shift();

  const searchTextCleaned = currentPath === 'phone' ? cleanPhoneString(searchText) : searchText;

  if (parts.length === 1) {
    // eslint-disable-next-line no-param-reassign
    filterObject[currentPath] = { _ilike: `%${generateFormattedSearchText(searchTextCleaned)}%` };
    return filterObject;
  }

  const newfilter = generateGQLSearchArgument(searchTextCleaned, newParts);

  const newFilterObject = { [currentPath]: newfilter };

  return newFilterObject;
};
