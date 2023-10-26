import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { formatPhone } from 'utilities/formatters/formatPhone';
import {
  cleanPhoneString,
  findSubstringBounds,
  findAlphanumericSubstringBounds,
  isSubstringIgnoreCase,
} from '../helpers';

const useStyles = makeStyles(() => ({
  text: {
    maxWidth: '250px',
  },
}));

interface SearchTableCellProps {
  search: string;
  content: string;
  isPhone?: boolean;
}

export const SearchTableCell = (props: SearchTableCellProps) => {
  const classes = useStyles();
  const { search: searchRaw, content: contentRaw, isPhone = false } = props;

  // if isPhone, clean search string before anything
  const searchCleaned = useMemo(() => (isPhone ? cleanPhoneString(searchRaw) : searchRaw), [
    isPhone,
    searchRaw,
  ]);
  const searchFormatted = useMemo(() => (isPhone ? formatPhone(searchCleaned) : searchCleaned), [
    isPhone,
    searchCleaned,
  ]);
  const contentFormatted = useMemo(() => (isPhone ? formatPhone(contentRaw) : contentRaw), [
    contentRaw,
    isPhone,
  ]);

  const hasSearchMatch = useMemo(() => isSubstringIgnoreCase(contentRaw, searchCleaned), [
    contentRaw,
    searchCleaned,
  ]);
  const [startingIndexOfMatch, setStartingIndexOfMatch] = useState(0);
  const [endingIndexOfMatch, setEndingIndexOfMatch] = useState(0);

  useEffect(() => {
    if (hasSearchMatch) {
      const [startIndex, endIndex] = isPhone
        ? findAlphanumericSubstringBounds(
            contentFormatted.toLowerCase(),
            searchFormatted.toLowerCase()
          )
        : findSubstringBounds(contentFormatted.toLowerCase(), searchFormatted.toLowerCase());

      setStartingIndexOfMatch(startIndex);
      setEndingIndexOfMatch(endIndex);
    } else {
      setStartingIndexOfMatch(0);
      setEndingIndexOfMatch(0);
    }
  }, [contentFormatted, hasSearchMatch, isPhone, searchFormatted, startingIndexOfMatch]);

  return (
    <div>
      {hasSearchMatch ? (
        <Typography variant="body2" className={classes.text} noWrap>
          {contentFormatted.substring(0, startingIndexOfMatch)}
          <b>{contentFormatted.substring(startingIndexOfMatch, endingIndexOfMatch)}</b>
          {contentFormatted.substring(endingIndexOfMatch, contentFormatted.length)}
        </Typography>
      ) : (
        <Typography variant="body2" className={classes.text} noWrap>
          {contentFormatted}
        </Typography>
      )}
    </div>
  );
};

export default {};
